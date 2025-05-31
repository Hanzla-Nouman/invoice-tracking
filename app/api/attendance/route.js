import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/attendance";

export async function POST(req) {
  await dbConnect();
  try {
    const { date, attendanceRecords } = await req.json();

    if (!date || !attendanceRecords?.length) {
      return NextResponse.json(
        { message: "Date and attendance records are required" },
        { status: 400 }
      );
    }

    // Convert to Date object and set to start of day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check for existing attendance for these employees on this date
    const existing = await Attendance.find({
      employee: { $in: attendanceRecords.map(r => r.employee) },
      date: attendanceDate
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Attendance already exists for some employees on this date" },
        { status: 400 }
      );
    }

    // Add date to each record
    const recordsToSave = attendanceRecords.map(record => ({
      ...record,
      date: attendanceDate
    }));

    const savedRecords = await Attendance.insertMany(recordsToSave);
    return NextResponse.json(
      { message: "Attendance saved successfully", data: savedRecords },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Duplicate attendance detected" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const employeeId = searchParams.get("employeeId");

    if (date) {
      // Parse the input date string (expecting format YYYY-MM-DD)
      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format. Please use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      // Create exact date range to match your stored records
      // Your records show times at 19:00:00 UTC (7 PM)
      const exactDate = new Date(inputDate);
      exactDate.setUTCHours(19, 0, 0, 0); // Match your record format

      // Alternative: Query for the entire day (if you want to find any time on that date)
      const startDate = new Date(inputDate);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(inputDate);
      endDate.setUTCDate(inputDate.getUTCDate() + 1);
      endDate.setUTCHours(0, 0, 0, 0);

      // Choose one of these query approaches:
      // 1. Exact match (for your specific 7 PM records)
      // const records = await Attendance.find({ date: exactDate }).populate("employee", "name position");
      
      // 2. Whole day range (recommended)
      const records = await Attendance.find({
        date: { $gte: startDate, $lt: endDate }
      }).populate("employee", "name position");

      console.log(`Found ${records.length} records for ${date}`); // Debug

      return NextResponse.json(records, { status: 200 });
    } 
    else if (employeeId) {
      // Fetch attendance for specific employee
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return NextResponse.json(
          { message: "Invalid employee ID format" },
          { status: 400 }
        );
      }

      const records = await Attendance.find({ employee: employeeId })
        .sort({ date: -1 })
        .limit(30)
        .populate("employee", "name position");

      return NextResponse.json(records, { status: 200 });
    } 
    else {
      // Fetch all unique dates (formatted as YYYY-MM-DD)
      const uniqueDates = await Attendance.aggregate([
        {
          $project: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            }
          }
        },
        {
          $group: {
            _id: "$dateString"
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 100 }
      ]);

      return NextResponse.json(
        uniqueDates.map(d => d._id), 
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/attendance:", error);
    return NextResponse.json(
      { 
        message: "Server error while fetching attendance",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const { attendanceId, status, notes } = await req.json();

    if (!attendanceId || !status) {
      return NextResponse.json(
        { message: "Attendance ID and status are required" },
        { status: 400 }
      );
    }

    const updated = await Attendance.findByIdAndUpdate(
      attendanceId,
      { status, notes },
      { new: true }
    ).populate("employee", "name position");

    if (!updated) {
      return NextResponse.json(
        { message: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Attendance updated", data: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}