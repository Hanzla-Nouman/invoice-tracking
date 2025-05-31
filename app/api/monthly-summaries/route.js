
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
    
    const { id, paymentStatus } = await req.json();
    
    if (!id || !paymentStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedSummary = await MonthlySummary.findByIdAndUpdate(
      id,
      { paymentStatus, paymentDate: paymentStatus === "Paid" ? new Date() : null },
      { new: true }
    );

    if (!updatedSummary) {
      return NextResponse.json(
        { error: "Monthly summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSummary);
    
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}