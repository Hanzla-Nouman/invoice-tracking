import dbConnect from "@/lib/db";
import Users from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const consultant = await Users.findById(params.id).select("-password");
    
    if (!consultant) {
      return NextResponse.json(
        { message: "Consultant not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(consultant, { status: 200 });

  } catch (error) {
    console.error("Error fetching consultant:", error);
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
    
    const updatedConsultant = await Users.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          yearsOfExperience: data.yearsOfExperience,
          bio: data.bio,
          status: data.status,
          country: data.country,
          address: data.address
        }
      },
      { new: true }
    ).select("-password");
    
    if (!updatedConsultant) {
      return NextResponse.json(
        { message: "Consultant not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedConsultant, { status: 200 });

  } catch (error) {
    console.error("Error updating consultant:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedConsultant = await Users.findByIdAndDelete(params.id);
    
    if (!deletedConsultant) {
      return NextResponse.json(
        { message: "Consultant not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Consultant deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting consultant:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}