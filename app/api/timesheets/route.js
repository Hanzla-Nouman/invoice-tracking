import dbConnect from "@/lib/db";
import Timesheet from "@/models/timesheet";
import User from "@/models/user";
import Project from "@/models/project";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { consultant, consultantEmail, project, workType, workQuantity, notes } = await req.json();


    if (!consultant) {
      return NextResponse.json({ message: "Consultant ID is required" }, { status: 400 });
    }

    const consultantData = await User.findById(consultant);
    if (!consultantData || consultantData.role !== "Consultant") {
      return NextResponse.json({ message: "Only Consultants can submit timesheets" }, { status: 403 });
    }

    // ✅ Convert project to ObjectId before saving
    const projectObjectId = mongoose.Types.ObjectId.isValid(project) ? new mongoose.Types.ObjectId(project) : null;
    if (!projectObjectId) {
      return NextResponse.json({ message: "Invalid Project ID" }, { status: 400 });
    }


    const newTimesheet = new Timesheet({
      consultant,
      consultantEmail,
      project: projectObjectId, // ✅ Always store ObjectId
      workType,
      workQuantity,
      dateIssued: new Date().toISOString().split("T")[0],
      notes,
    });

    await newTimesheet.save();
    return NextResponse.json({ message: "Timesheet submitted successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Timesheet submission error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // Logged-in user ID
    const userRole = searchParams.get("role"); // "Admin" or "Consultant"

    let timesheets;

    if (userRole === "Admin") {
      // ✅ Admin sees all timesheets
      timesheets = await Timesheet.find()
        .populate("consultant", "name email")
        .populate("project", "name")
        .lean(); // Converts MongoDB objects to plain JSON
    } else if (userRole === "Consultant" && userId) {
      // ✅ Consultant sees only their own timesheets
      timesheets = await Timesheet.find({ consultant: userId })
        .populate("project", "name")
        .lean();
    } else {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(timesheets, { status: 200 });

  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}