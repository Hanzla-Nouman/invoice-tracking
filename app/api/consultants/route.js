import dbConnect from "@/lib/db";
import Users from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    
    const consultants = await Users.find({ role: "Consultant" })
      .select("name email phone yearsOfExperience status createdAt");

    return NextResponse.json(consultants, { status: 200 });

  } catch (error) {
    console.error("Error fetching consultants:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.json();

    if (!formData.name || !formData.email || !formData.password) {
      return NextResponse.json(
        { message: "Name, email and password are required" }, 
        { status: 400 }
      );
    }

    const existingUser = await Users.findOne({ email: formData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Consultant with this email already exists" }, 
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const newConsultant = new Users({
      name: formData.name,
      email: formData.email,
      password: hashedPassword,
      role: "Consultant",
      phone: formData.phone || "",
      yearsOfExperience: formData.yearsOfExperience || 0,
      bio: formData.bio || "",
      status: formData.status || "Active",
      country: formData.country || "",
      address: formData.address || ""
    });

    await newConsultant.save();

    return NextResponse.json(
      { message: "Consultant added successfully!" }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding consultant:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}