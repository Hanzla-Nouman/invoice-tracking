// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import Consultant from "@/models/consultant";
// import Admin from "@/models/admin";

// export async function POST(req) {
//   const { name, email, password, role } = await req.json();

//   if (!name || !email || !password || !role) {
//     return NextResponse.json({ message: "All fields are required" }, { status: 400 });
//   }

//   const existingUser = await (role === "Admin" ? Admin : Consultant).findOne({ email });
//   if (existingUser) {
//     return NextResponse.json({ message: "User already exists" }, { status: 400 });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = role === "Admin"
//     ? new Admin({ name, email, password: hashedPassword })
//     : new Consultant({ name, email, password: hashedPassword });

//   await newUser.save();
//   return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
// }
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/user";

export async function POST(req) {
  try {

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: "Consultant" });

    await newUser.save();
    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
