
import dbConnect from "@/lib/db";
import employee from "@/models/employee";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const employees = await employee.find();
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const newEmployee = new employee(data);
    await newEmployee.save();
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
