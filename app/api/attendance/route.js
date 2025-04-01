import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import attendance from "@/models/attendance";

export async function POST(req) {
  await dbConnect();
  try {
    const { attendanceRecords } = await req.json();

    if (!attendanceRecords || !attendanceRecords.length) {
      return NextResponse.json({ message: "No attendance records provided" }, { status: 400 });
    }

    const savedRecords = await attendance.insertMany(attendanceRecords);
    return NextResponse.json({ message: "Attendance saved successfully", savedRecords }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error saving attendance", error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
    await dbConnect();
    try {
      const { searchParams } = new URL(req.url);
      const date = searchParams.get("date");
  
      if (date) {
        // Fetch attendance for a specific date
        const attendanceRecords = await attendance.find({ date }).populate("employee");
        return NextResponse.json(attendanceRecords, { status: 200 });
      } else {
        // Fetch unique dates where attendance was marked
        const uniqueDates = await attendance.distinct("date");
        return NextResponse.json(uniqueDates, { status: 200 });
      }
    } catch (error) {
      return NextResponse.json({ message: "Error fetching attendance data", error: error.message }, { status: 500 });
    }
  }