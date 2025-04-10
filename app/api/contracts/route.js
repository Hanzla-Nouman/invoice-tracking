import dbConnect from "@/lib/db";
import Contract from "@/models/contract";
import { NextResponse } from "next/server";

// Create Contract (POST)
export async function POST(req) {
  try {
    await dbConnect();
    const { 
      title, 
      description, 
      consultant, 
      customer, 
      startDate, 
      endDate, 
      rate, 
      rateType, 
      paymentTerms, 
      status ,
      maxDaysPerYear 
    } = await req.json();

    // Validate required fields
    if (!title || !consultant || !customer || !startDate || !endDate || !rate || !rateType) {
      return NextResponse.json(
        { message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const newContract = new Contract({
      title,
      description,
      consultant,
      customer,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rate: Number(rate),
      rateType,
      paymentTerms: paymentTerms || "30 days",
      status: status || "Draft",
      maxDaysPerYear: maxDaysPerYear ? Number(maxDaysPerYear) : null,
    });

    await newContract.save();
    
    return NextResponse.json(
      { 
        message: "Contract created successfully!", 
        contract: newContract 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { 
        message: "Server error", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Get all contracts (GET)
export async function GET() {
  try {
    await dbConnect();
    const contracts = await Contract.find()
      .populate("customer", "fullName email phone")
      .populate("consultant", "name email");

    return NextResponse.json(contracts, { status: 200 });

  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { 
        message: "Server error", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}