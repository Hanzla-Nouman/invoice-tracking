import dbConnect from "@/lib/db";
import Users from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { newPassword } = await req.json();
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await Users.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          password: hashedPassword
        }
      },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: "Consultant not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}