import { NextResponse } from "next/server";
import MonthlySummary from "@/models/MonthlySummary";
import dbConnect from "@/lib/db";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultantId");
    const monthYear = searchParams.get("monthYear");

    let query = {};
    if (consultantId) query.consultant = consultantId;

    if (monthYear) {
      // Convert "YYYY-MM" → "Month YYYY"
      const [year, month] = monthYear.split("-");
      const date = new Date(`${year}-${month}-01`);
      const monthName = date.toLocaleString("default", { month: "long" });
      const altFormat = `${monthName} ${year}`;

      // Debug logs
      console.log("📌 MonthYear query received:", monthYear);
      console.log("📌 Also checking alternate format:", altFormat);

      // Match either format
      query.$or = [{ monthYear }, { monthYear: altFormat }];
    }

    console.log("📌 MonthlySummaries API - Final query:", query);

    const summaries = await MonthlySummary.find(query)
      .populate("consultant", "name")
      .populate({
        path: "Timesheets",
        select: "workType workQuantity rate status paymentStatus",
      })
      .populate({
        path: "consultant",
        select: "creditCardFee",
      })
      .sort({ monthYear: -1 });

    console.log("✅ MonthlySummaries API - Found summaries:", summaries);

    return NextResponse.json(summaries, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching monthly summaries:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


// pages/api/monthly-summaries.js
export async function PUT(req) {
  try {
    await dbConnect();
    const { 
      id, 
      paymentStatus, 
      paymentMethod, 
      baseSalary, 
      remainingBalance,
      partialPaymentAmount, // New parameter for partial payments
      partialPaymentMethod // New parameter for partial payment method
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required ID field" },
        { status: 400 }
      );
    }

    // Fetch the current document
    const currentSummary = await MonthlySummary.findById(id)
      .populate('consultant', 'creditCardFee');

    if (!currentSummary) {
      return NextResponse.json(
        { error: "Monthly summary not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    // Handle partial payments
    if (partialPaymentAmount && partialPaymentMethod) {
      if (partialPaymentAmount <= 0) {
        return NextResponse.json(
          { error: "Partial payment amount must be greater than 0" },
          { status: 400 }
        );
      }
      
      if (partialPaymentAmount > currentSummary.remainingBalance) {
        return NextResponse.json(
          { error: "Partial payment amount cannot exceed remaining balance" },
          { status: 400 }
        );
      }

      // Add partial payment to history
      const newPartialPayment = {
        amount: partialPaymentAmount,
        paymentMethod: partialPaymentMethod,
        date: new Date()
      };

      updateData.$push = { partialPayments: newPartialPayment };
      updateData.remainingBalance = currentSummary.remainingBalance - partialPaymentAmount;
      
      // Update payment status based on new remaining balance
      if (updateData.remainingBalance === 0) {
        updateData.paymentStatus = "Paid";
        updateData.paymentDate = new Date();
      } else {
        updateData.paymentStatus = "Partially Paid";
      }
    } 
    // Handle full payment status change
    else if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      
      if (paymentStatus === "Paid") {
        updateData.paymentDate = new Date();
        updateData.remainingBalance = 0;
      } else if (paymentStatus === "Partially Paid") {
        // If changing to partially paid without specifying amount, keep current balance
        updateData.remainingBalance = currentSummary.remainingBalance;
      }
    }

    // Handle explicit remaining balance update (from frontend)
    if (remainingBalance !== undefined && !partialPaymentAmount) {
      updateData.remainingBalance = remainingBalance;
    }

    // Handle base salary update
    if (baseSalary !== undefined) {
      updateData.baseSalary = baseSalary;
      
      // Only recalculate if payment status is not Paid
      if (currentSummary.paymentStatus !== "Paid") {
        const totalApprovedAmount = currentSummary.totalApprovedAmount || 0;
        const insuranceAmount = currentSummary.insuranceAmount || 0;
        const expense = currentSummary.expense || 0;
        
        updateData.remainingBalance = totalApprovedAmount - insuranceAmount - expense - baseSalary;
        
        // If payment method is Card, recalculate card fee and adjust remaining balance
        if (currentSummary.paymentMethod === "Card") {
          const creditCardFee = currentSummary.consultant?.creditCardFee || 0;
          if (creditCardFee > 0 && creditCardFee <= 100) {
            const cardFee = (updateData.remainingBalance * creditCardFee) / 100;
            updateData.cardFee = cardFee;
            updateData.remainingBalance = updateData.remainingBalance - cardFee;
          }
        }
      }
    }

    // Handle payment method
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;

      // Only recalculate if payment status is not Paid
      if (currentSummary.paymentStatus !== "Paid") {
        if (paymentMethod === "Card") {
          // Safeguard: Ensure creditCardFee exists and is valid
          const creditCardFee = currentSummary.consultant?.creditCardFee || 0;
          if (creditCardFee <= 0 || creditCardFee > 100) {
            return NextResponse.json(
              { error: "Invalid credit card fee percentage" },
              { status: 400 }
            );
          }

          // Calculate fee (ensure remainingBalance is positive)
          const remainingBalance = Math.max(0, updateData.remainingBalance || currentSummary.remainingBalance);
          const cardFee = (remainingBalance * creditCardFee) / 100;

          updateData.cardFee = cardFee;
          updateData.remainingBalance = remainingBalance - cardFee;

        } else {
          // Reset fee for non-card methods
          updateData.cardFee = 0;
          
          // Recalculate remaining balance without card fee
          if (baseSalary === undefined) {
            const totalApprovedAmount = currentSummary.totalApprovedAmount || 0;
            const insuranceAmount = currentSummary.insuranceAmount || 0;
            const expense = currentSummary.expense || 0;
            const baseSalary = currentSummary.baseSalary || 0;
            
            updateData.remainingBalance = totalApprovedAmount - insuranceAmount - expense - baseSalary;
          }
        }
      }
    }

    const updatedSummary = await MonthlySummary.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedSummary);

  } catch (error) {
    console.error("Error updating monthly summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}