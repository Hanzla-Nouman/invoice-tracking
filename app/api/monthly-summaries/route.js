
import { NextResponse } from "next/server";
import MonthlySummary from "@/models/MonthlySummary";
import timesheet from "@/models/timesheet";
import dbConnect from "@/lib/db";



export async function GET(req) {
    try {
      await dbConnect();
  
      const { searchParams } = new URL(req.url);
      const consultantId = searchParams.get('consultantId');
      const monthYear = searchParams.get('monthYear');
  
      let query = {};
  
      // Filter by consultant if provided
      if (consultantId) {
        query.consultant = consultantId;
      }
  
      // Filter by month if provided
      if (monthYear) {
        query.monthYear = monthYear;
      }
  
      const summaries = await MonthlySummary.find(query)
        .populate('consultant', 'name')
        .populate({
          path: 'Timesheets',
          select: 'workType workQuantity rate status paymentStatus'
        })
        .populate({
          path: 'consultant',
          select: 'creditCardFee'
        })
        .sort({ monthYear: -1 });
  
      return NextResponse.json(summaries, { status: 200 });
  
    } catch (error) {
      console.error('Error fetching monthly summaries:', error);
      return NextResponse.json(
        { message: 'Server error', error: error.message },
        { status: 500 }
      );
    }
  }

export async function PUT(req) {
  try {
    await dbConnect();
    const { id, paymentStatus, paymentMethod } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required ID field" },
        { status: 400 }
      );
    }

    // Fetch the current document with consultant's creditCardFee
    const currentSummary = await MonthlySummary.findById(id)
      .populate('consultant', 'creditCardFee');

    if (!currentSummary) {
      return NextResponse.json(
        { error: "Monthly summary not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    // Handle payment status
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      updateData.paymentDate = paymentStatus === "Paid" ? new Date() : null;
    }

    // Handle payment method
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;

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
        const remainingBalance = Math.max(0, currentSummary.remainingBalance);
        const cardFee = (remainingBalance * creditCardFee) / 100;

        updateData.cardFee = cardFee;
        updateData.remainingBalance = remainingBalance - cardFee;

      } else {
        // Reset fee for non-card methods
        updateData.cardFee = 0;
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