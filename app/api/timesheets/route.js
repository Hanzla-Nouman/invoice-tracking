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

    // Validate required fields
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

    // Get contract details with customer info
    const contractData = await Contract.findById(contract)
      .populate("customer", "fullName");
    
    if (!contractData) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }
  
    // Verify consultant is assigned to this contract
    if (!contractData.consultants.includes(consultant)) {
      return NextResponse.json(
        { message: "You are not assigned to this contract" },
        { status: 403 }
      );
    }

    // Check for existing timesheet for this contract and month
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

    // Calculate financial amounts
    const totalAmount = workQuantity * rate;
    const adminFee = contractData.adminFee || 0; // Make sure this is a percentage (e.g., 10 for 10%)
    const remainingAmount = totalAmount - (totalAmount * (adminFee / 100));

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
      adminFee, // Store the admin fee percentage
      adminFeeAmount: totalAmount * (adminFee / 100), // Store the actual fee amount
      remainingAmount,
      monthYear,
      notes,
      status: "Pending",
      paymentStatus: "Pending"
    });

    // Save the timesheet
    await newTimesheet.save();

    // Handle MonthlySummary creation/update
    let monthlySummary = await MonthlySummary.findOne({
      consultant,
      monthYear
    });

    // Get all timesheets for this consultant and month (including the new one)
    const allTimesheets = await Timesheet.find({
      consultant,
      monthYear
    });

    // Calculate total remaining amount from all timesheets
    const totalRemainingAmount = allTimesheets.reduce(
      (sum, ts) => sum + ts.remainingAmount, 
      0
    );

    if (!monthlySummary) {
      // Create new monthly summary
      monthlySummary = new MonthlySummary({
        consultant,
        consultantName: consultantData.name,
        monthYear,
        Timesheets: allTimesheets.map(ts => ts._id),
        totalApprovedAmount: totalRemainingAmount,
        baseSalary: consultantData.baseSalary || 0,
        insuranceAmount: consultantData.insuranceAmount || 0,
        remainingBalance: totalRemainingAmount - 
                        (consultantData.baseSalary || 0) - 
                        (consultantData.insuranceAmount || 0),
        paymentStatus: "Pending"
      });
    } else {
      // Update existing monthly summary
      monthlySummary.Timesheets = allTimesheets.map(ts => ts._id);
      monthlySummary.totalApprovedAmount = totalRemainingAmount;
      monthlySummary.remainingBalance = 
        totalRemainingAmount - 
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
      .populate({
        path: "contract",
        select: "title adminFee" // Add adminFee to the populated fields
      }) 
      .lean();
    } else if (userRole === "Consultant" && userId) {
      timesheets = await Timesheet.find({ consultant: userId })
        .populate({
          path: "contract",
          select: "title adminFee" // Add adminFee to the populated fields
        })
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
