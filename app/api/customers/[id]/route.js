import dbConnect from "@/lib/db";
import Customer from "@/models/customer";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const customer = await Customer.findById(params.id);
    
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(customer, { status: 200 });

  } catch (error) {
    console.error("Error fetching customer:", error);
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
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          currency: data.currency,
          country: data.country,
          status: data.status,
          postalCode: data.postalCode
        }
      },
      { new: true }
    );
    
    if (!updatedCustomer) {
      return NextResponse.json(
        { message: "Customer not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer, { status: 200 });

  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedCustomer = await Customer.findByIdAndDelete(params.id);
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { message: "Customer not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}