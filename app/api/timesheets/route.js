import dbConnect from "@/lib/db";
import Timesheet from "@/models/timesheet";
import Contract from "@/models/contract";
import Users from "@/models/user";
import MonthlySummary from "@/models/MonthlySummary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { 
      consultant,
      consultantEmail,
      contract,
      workType,
      workQuantity,
      notes,
      monthYear
    } = await req.json();

    if (!consultant || !contract || !workType || !workQuantity || !monthYear) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get consultant details
    const consultantData = await Users.findById(consultant);
    if (!consultantData) {
      return NextResponse.json(
        { message: "Consultant not found" },
        { status: 404 }
      );
    }

    const contractData = await Contract.findById(contract)
      .populate("customer", "fullName");
    
    if (!contractData) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }
  
    if (!contractData.consultants.includes(consultant)) {
      return NextResponse.json(
        { message: "You are not assigned to this contract" },
        { status: 403 }
      );
    }

    const existingTimesheet = await Timesheet.findOne({
      consultant,
      contract,
      monthYear
    });

    if (existingTimesheet) {
      return NextResponse.json(
        { message: "Timesheet already exists for this contract and month" },
        { status: 400 }
      );
    }

    // Calculate rate based on consultant's rates
    let rate;
    if (workType === "Hours") {
      rate = consultantData.ratePerHour || 0;
    } else {
      rate = consultantData.ratePerDay || 0;
    }

    const totalAmount = workQuantity * rate;

    // Create new timesheet
    const newTimesheet = new Timesheet({
      consultant,
      consultantEmail,
      contract,
      customer: contractData.customer._id,
      workType,
      workQuantity,
      rate,
      totalAmount,
      monthYear,
      notes,
      status: "Pending",
      paymentStatus: "Pending"
    });

    // Save the timesheet first
    await newTimesheet.save();

    // Now handle the MonthlySummary
    let monthlySummary = await MonthlySummary.findOne({
      consultant,
      monthYear
    });

    if (!monthlySummary) {
      // Create new MonthlySummary if it doesn't exist
      monthlySummary = new MonthlySummary({
        consultant,
        consultantName: consultantData.name,
        monthYear,
        Timesheets: [newTimesheet._id],
        totalApprovedAmount: totalAmount,
        baseSalary: consultantData.baseSalary || 0,
        insuranceAmount: consultantData.insuranceAmount || 0,
        remainingBalance: totalAmount - (consultantData.baseSalary || 0) - (consultantData.insuranceAmount || 0),
        paymentStatus: "Pending"
      });
    } else {
      // Update existing MonthlySummary
      monthlySummary.Timesheets.push(newTimesheet._id);
      monthlySummary.totalApprovedAmount += totalAmount;
      monthlySummary.remainingBalance = 
        monthlySummary.totalApprovedAmount - 
        monthlySummary.baseSalary - 
        monthlySummary.insuranceAmount;
    }

    // Save the MonthlySummary
    await monthlySummary.save();

    return NextResponse.json(
      { 
        message: "Timesheet submitted successfully!",
        timesheet: newTimesheet,
        monthlySummary
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

// ... rest of your code remains the same

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("role");

    let timesheets;

    if (userRole === "Admin") {
      timesheets = await Timesheet.find()
      .populate({
        path: "consultant",
        model: "Users", 
        select: "name email baseSalary insuranceAmount"
      })
      .populate("contract", "title") 
      .lean();
        
    } else if (userRole === "Consultant" && userId) {
      timesheets = await Timesheet.find({ consultant: userId })
        .populate("contract", "title")
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

