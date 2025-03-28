import dbConnect from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// ✅ Handle GET request to fetch consultants
export async function GET() {
  try {
    await dbConnect();
    
    // ✅ Ensure we fetch email and createdAt fields
    const consultants = await User.find({ role: "Consultant" }).select("name _id email createdAt");


    return NextResponse.json(consultants, { status: 200 });

  } catch (error) {
    console.error("Error fetching consultants:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// ✅ Handle POST request to add a consultant
export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

 

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Consultant with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newConsultant = new User({
      name,
      email,
      password: hashedPassword,
      role: "Consultant", // Always set role as Consultant
    });

    await newConsultant.save();

    return NextResponse.json({ message: "Consultant added successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Error adding consultant:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
