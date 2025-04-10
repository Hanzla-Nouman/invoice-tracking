import dbConnect from "@/lib/db";
import Contract from "@/models/contract";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const contract = await Contract.findById(params.id)
      .populate("customer", "fullName email phone")
      .populate("consultant", "name email");
    
    if (!contract) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json(contract, { status: 200 });

  } catch (error) {
    console.error("Error fetching contract:", error);
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
      
      const updatedContract = await Contract.findByIdAndUpdate(
        params.id,
        { $set: data },
        { new: true }
      ).populate("customer", "fullName").populate("consultant", "name");
      
      if (!updatedContract) {
        return NextResponse.json({ message: "Contract not found" }, { status: 404 });
      }
  
      return NextResponse.json(updatedContract, { status: 200 });
    } catch (error) {
      console.error("Error updating contract:", error);
      return NextResponse.json(
        { message: "Server error", error: error.message }, 
        { status: 500 }
      );
    }
  }

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedContract = await Contract.findByIdAndDelete(params.id);
    
    if (!deletedContract) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Contract deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting contract:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}