import dbConnect from "@/lib/db";
import lead from "@/models/lead";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, title, email, phone, country, postalCode, description, source } = await req.json();

    if (!name || !title || !email || !country || !source) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newLead = new lead({ name, title, email, phone, country, postalCode, description, source });
    await newLead.save();

    return NextResponse.json({ message: "Lead created successfully!", lead: newLead }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function GET() {
    try {
      await dbConnect();
      const leads = await lead.find();
      return NextResponse.json(leads, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
  }
  
