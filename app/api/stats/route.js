import dbConnect from "@/lib/db";
import Customer from "@/models/customer";
import User from "@/models/user";
import Project from "@/models/project";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const customerCount = await Customer.countDocuments();
    const consultantCount = await User.countDocuments({ role: "Consultant" });
    const projectCount = await Project.countDocuments();

    return NextResponse.json({
      success: true,
      customers: customerCount,
      consultants: consultantCount,
      projects: projectCount,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
