import dbConnect from "@/lib/db";
import Timesheet from "@/models/timesheet";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updatedFields = await req.json(); // Get all fields from frontend

    console.log("Received Update Request:", { id, updatedFields });

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing timesheet ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Update all edited fields
    const updatedTimesheet = await Timesheet.findByIdAndUpdate(
      id,
      { $set: updatedFields }, // ✅ Update multiple fields dynamically
      { new: true, runValidators: true }
    );

    if (!updatedTimesheet) {
      console.log("Timesheet Not Found in DB");
      return new Response(JSON.stringify({ error: "Timesheet not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Timesheet Updated Successfully:", updatedTimesheet);

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
