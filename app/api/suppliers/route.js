import dbConnect from "@/lib/db";
import supplier from "@/models/supplier";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, phone, country, postalCode } = await req.json();

    if (!name || !email || !country) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newSupplier = new supplier({ name, email, phone, country, postalCode });
    await newSupplier.save();

    return NextResponse.json({ message: "Supplier added successfully!", supplier: newSupplier }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const suppliers = await supplier.find();
    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
