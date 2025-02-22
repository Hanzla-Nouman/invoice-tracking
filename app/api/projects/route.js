import dbConnect from "@/lib/db";
import Project from "@/models/project";
import User from "@/models/user"; // For assigning consultants
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, description, startDate, endDate, assignedConsultants } = await req.json();

    console.log("Received Project Data:", { name, startDate, endDate, assignedConsultants });

    if (!name) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }

    const existingProject = await Project.findOne({ name });
    if (existingProject) {
      return NextResponse.json({ message: "Project with this name already exists" }, { status: 400 });
    }

    // Validate consultants
    const validConsultants = await User.find({ _id: { $in: assignedConsultants }, role: "Consultant" });
    const validConsultantIds = validConsultants.map((consultant) => consultant._id);

    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      assignedConsultants: validConsultantIds, // Store only valid consultant IDs
    });

    await newProject.save();
    return NextResponse.json({ message: "Project added successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get("consultant"); // Get consultant ID from query

    let projects;

    if (consultantId) {
      // Fetch only projects assigned to the consultant
      projects = await Project.find({ assignedConsultants: consultantId }).select("name description startDate endDate");
    } else {
      // Fetch all projects (for admin or general view)
      projects = await Project.find().select("name description startDate endDate assignedConsultants");
    }

    console.log("Fetched Projects:", projects);

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
