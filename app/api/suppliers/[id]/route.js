import dbConnect from "@/lib/db";
import Supplier from "@/models/supplier";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const supplier = await Supplier.findById(params.id);
    
    if (!supplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier, { status: 200 });

  } catch (error) {
    console.error("Error fetching supplier:", error);
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
    
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );
    
    if (!updatedSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSupplier, { status: 200 });

  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedSupplier = await Supplier.findByIdAndDelete(params.id);
    
    if (!deletedSupplier) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Supplier deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}