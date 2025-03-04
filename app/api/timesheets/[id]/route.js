import dbConnect from "@/lib/db";
import Timesheet from "@/models/timesheet";
import { NextResponse } from "next/server";

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

    // ✅ Update timesheet
    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    )
      .populate("consultant", "name email") // ✅ Populate consultant details
      .populate("project", "name"); // ✅ Populate project details

    if (!updatedTimesheet) {
      return new Response(JSON.stringify({ error: "Timesheet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
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
    const timesheet = await Timesheet.findById(id).populate("consultant", "name email").populate("project", "name");

    if (!timesheet) {
      return NextResponse.json({ message: "Timesheet not found" }, { status: 404 });
    }

    return NextResponse.json(timesheet, { status: 200 });

  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
