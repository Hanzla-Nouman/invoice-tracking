import dbConnect from "@/lib/db";
import Customer from "@/models/customer";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find().select("fullName email phone currency country status postalCode createdAt");
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { fullName, email, phone, currency, country, status, postalCode } = await req.json();

    if (!fullName || !email || !phone || !currency || !country || !status || !postalCode) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return NextResponse.json({ message: "Customer with this email already exists" }, { status: 400 });
    }

    const newCustomer = new Customer({
      fullName,
      email,
      phone,
      currency,
      country,
      status,
      postalCode,
    });

    await newCustomer.save();

    return NextResponse.json({ message: "Customer added successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error adding customer:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
