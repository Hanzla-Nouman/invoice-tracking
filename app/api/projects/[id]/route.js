import dbConnect from "@/lib/db";
import Project from "@/models/project";
import Users from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const project = await Project.findById(params.id)
      .populate('assignedConsultants', 'name email');
    
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" }, 
        { status: 404 }
      );
    }

    // Ensure assignedConsultants is always an array
    if (!project.assignedConsultants) {
      project.assignedConsultants = [];
    }

    return NextResponse.json(project, { status: 200 });

  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Validate status if provided
    if (data.status && !['Draft', 'Started', 'Completed'].includes(data.status)) {
      return NextResponse.json(
        { message: "Invalid project status" },
        { status: 400 }
      );
    }

    // Validate budget if provided
    if (data.budget && isNaN(data.budget)) {
      return NextResponse.json(
        { message: "Budget must be a number" },
        { status: 400 }
      );
    }

    // Validate consultants exist
    const validConsultants = await Users.find({
      _id: { $in: data.assignedConsultants || [] },
      role: "Consultant"
    });
    const validConsultantIds = validConsultants.map(c => c._id);

    const updateData = {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      budget: data.budget ? parseFloat(data.budget) : 0,
      assignedConsultants: validConsultantIds
    };

    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).populate('assignedConsultants', 'name email');
    
    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProject, { status: 200 });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedProject = await Project.findByIdAndDelete(params.id);
    
    if (!deletedProject) {
      return NextResponse.json(
        { message: "Project not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Project deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Important for Next.js API routes