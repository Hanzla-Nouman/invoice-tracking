import dbConnect from "@/lib/db";
import Contract from "@/models/contract";
import { NextResponse } from "next/server";

// 📌 Create Contract (POST)
export async function POST(req) {
  try {
    await dbConnect();
    const { title, description, consultant, customer, startDate, endDate, amount, paymentTerms, contractFile } = await req.json();

    if (!title || !consultant || !customer || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newContract = new Contract({
      title,
      description,
      consultant,
      customer,
      startDate,
      endDate,
      amount: amount || 0, // Default value
      paymentTerms: paymentTerms || "Milestone",
      contractFile,
      status: "Pending Approval",
    });

    await newContract.save();
    return NextResponse.json({ message: "Contract created successfully!", contract: newContract }, { status: 201 });

  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// 📌 Get All Contracts (GET)
export async function GET() {
  try {
    await dbConnect();
    const contracts = await Contract.find()// ✅ Get consultant's name and email
    .populate("customer", "fullName");

    return NextResponse.json(contracts, { status: 200 });

  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
