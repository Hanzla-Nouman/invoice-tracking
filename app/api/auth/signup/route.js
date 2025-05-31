
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import Users from "@/models/user";

export async function POST(req) {
  try {

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Users already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({ name, email, password: hashedPassword, role: "Consultant" });

    await newUser.save();
    return NextResponse.json({ message: "Users registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
