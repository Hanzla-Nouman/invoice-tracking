import dbConnect from "@/lib/db";
import Invoice from "@/models/invoice";
import Timesheet from "@/models/timesheet";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { consultantId, timesheetIds } = await req.json();

    // Validate input
    if (!consultantId || !timesheetIds.length) {
      return NextResponse.json(
        { error: "Missing consultant ID or timesheets" },
        { status: 400 }
      );
    }

    // Get selected timesheets
    const timesheets = await Timesheet.find({ _id: { $in: timesheetIds } });

    if (!timesheets.length) {
      return NextResponse.json(
        { error: "No timesheets found" },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = timesheets.reduce((sum, ts) => sum + ts.totalAmount, 0);

    // Create invoice
    const newInvoice = await Invoice.create({
      consultant: consultantId,
      timesheets: timesheetIds,
      totalAmount,
      status: "Pending",
    });

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
    try {
      await dbConnect();
  
      // Get query params
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
  
      // Build query
      const query = status ? { status } : {};
  
      const timesheets = await Timesheet.find(query).populate("consultant", "name email");
  
      return NextResponse.json(timesheets, { status: 200 });
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }