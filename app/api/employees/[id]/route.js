import dbConnect from "@/lib/db";
import Employee from "@/models/employee";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const employee = await Employee.findById(params.id);
    
    if (!employee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee, { status: 200 });

  } catch (error) {
    console.error("Error fetching employee:", error);
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
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );
    
    if (!updatedEmployee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEmployee, { status: 200 });

  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    
    const deletedEmployee = await Employee.findByIdAndDelete(params.id);
    
    if (!deletedEmployee) {
      return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Employee deleted successfully" }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, 
      { status: 500 }
    );
  }
}