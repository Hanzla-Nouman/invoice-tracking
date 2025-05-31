import dbConnect from "@/lib/db";
import MonthlySummary from "@/models/MonthlySummary";
import Timesheet from "@/models/timesheet";
import Customer from "@/models/customer";
import { NextResponse } from "next/server";
import { sendInvoiceEmail } from "@/lib/emailService"; // You'll need to create this

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updatedFields = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing timesheet ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the existing timesheet first to compare values
    const existingTimesheet = await Timesheet.findById(id)
      .populate("consultant", "name email")
      .populate("contract", "title")
      .populate("customer");

    if (!existingTimesheet) {
      return new Response(JSON.stringify({ error: "Timesheet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if status is being changed to Approved
    const isBeingApproved = updatedFields.status === 'Approved' && 
                           existingTimesheet.status !== 'Approved';

    // Calculate new total amount if quantity or rate is being updated
    let newTotalAmount;
    if (updatedFields.workQuantity !== undefined || updatedFields.rate !== undefined) {
      const newQuantity = updatedFields.workQuantity ?? existingTimesheet.workQuantity;
      const newRate = updatedFields.rate ?? existingTimesheet.rate;
      newTotalAmount = newQuantity * newRate;
      updatedFields.totalAmount = newTotalAmount;
    }

    // Update the timesheet
    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    )
      .populate("consultant", "name email")
      .populate("contract", "title")
      .populate("customer");

    if (!updatedTimesheet) {
      return new Response(JSON.stringify({ error: "Timesheet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only update monthly summary if relevant fields were changed
    if (updatedFields.workQuantity !== undefined || 
        updatedFields.rate !== undefined || 
        updatedFields.status !== undefined) {
      
      // Find all monthly summaries containing this timesheet (should typically be one)
      const monthlySummaries = await MonthlySummary.find({
        Timesheets: id,
        monthYear: existingTimesheet.monthYear
      }).populate('Timesheets');

     for (const monthlySummary of monthlySummaries) {
  // Recalculate the total approved amount (after admin fee)
  let totalApprovedAmount = 0;

  monthlySummary.Timesheets.forEach(timesheet => {
    // Get adminFee from contract (populated or fetch if needed)
    const adminFee = timesheet.contract?.adminFee || 0;
    if (timesheet._id.toString() === id) {
      if (updatedFields.status === 'Approved' ||
          (updatedFields.status === undefined && timesheet.status === 'Approved')) {
        totalApprovedAmount += (newTotalAmount || timesheet.totalAmount) * (1 - adminFee / 100);
      }
    } else {
      if (timesheet.status === 'Approved') {
        totalApprovedAmount += timesheet.totalAmount * (1 - adminFee / 100);
      }
    }
  });

  // Update the monthly summary
  await MonthlySummary.findByIdAndUpdate(
    monthlySummary._id,
    {
      totalApprovedAmount,
      remainingBalance: totalApprovedAmount - 
                      (monthlySummary.baseSalary || 0) - 
                      (monthlySummary.insuranceAmount || 0)
    }
  );
}
    }

    // Send invoice email if the timesheet was just approved
    if (isBeingApproved && updatedTimesheet.customer) {
      try {
        await sendInvoiceEmail(
          updatedTimesheet, 
          updatedTimesheet.customer
        );
        
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
      }
    }

    return new Response(JSON.stringify({ timesheet: updatedTimesheet }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}





export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const timesheet = await Timesheet.findById(id) .populate({
      path: "consultant",
      model: "Users", 
      select: "name email baseSalary insuranceAmount"
    }).populate("contract", "title");

    if (!timesheet) {
      return NextResponse.json({ message: "Timesheet not found" }, { status: 404 });
    }

    return NextResponse.json(timesheet, { status: 200 });

  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
