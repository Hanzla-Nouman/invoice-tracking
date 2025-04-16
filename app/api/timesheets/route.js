import dbConnect from "@/lib/db";
import Timesheet from "@/models/timesheet";
import Users from "@/models/user";
import Project from "@/models/project";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { consultant, project, workType, workQuantity, notes,consultantEmail, } = await req.json();

    // Validate required fields
    if (!consultant || !project || !workType || !workQuantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current month/year range
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Check for existing timesheet this month
    const existingTimesheet = await Timesheet.findOne({
      consultant,
      dateIssued: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });

    if (existingTimesheet) {
      return NextResponse.json(
        { message: "You already have a timesheet for this month" },
        { status: 400 }
      );
    }

    // Get consultant's rates
    const consultantData = await Users.findById(consultant);
    if (!consultantData) {
      return NextResponse.json(
        { message: "Consultant not found" },
        { status: 404 }
      );
    }

    const rate = workType === "Hours" 
      ? consultantData.ratePerHour 
      : consultantData.ratePerDay;
    const totalAmount = workQuantity * rate;
    const monthYear = currentDate.toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Create new timesheet
    const newTimesheet = new Timesheet({
      consultant,
      project,
      workType,
      workQuantity,
      consultantEmail,
      rate,
      totalAmount,
      monthYear,
      dateIssued: currentDate,
      notes,
      status: "Pending",
      paymentStatus: "Pending"
    });

    await newTimesheet.save();

    return NextResponse.json(
      { 
        message: "Monthly timesheet submitted successfully!",
        timesheet: newTimesheet
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Timesheet submission error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// GET, PUT, and other methods remain the same as before
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("role");

    let timesheets;

    if (userRole === "Admin") {
      timesheets = await Timesheet.find()
        .populate("consultant", "name email")
        .populate("project", "name")
        .lean();
    } else if (userRole === "Consultant" && userId) {
      timesheets = await Timesheet.find({ consultant: userId })
        .populate("project", "name")
        .lean();
    } else {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 403 }
      );
    }

    return NextResponse.json(timesheets, { status: 200 });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// ... PUT and other methods remain unchanged ...
