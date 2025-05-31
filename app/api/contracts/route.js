import dbConnect from "@/lib/db";
import contract from "@/models/contract";
import customer from "@/models/customer";
import Users from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    
    const { 
      title, 
      description, 
      consultants, 
      customer, 
      startDate, 
      endDate, 
      rate, 
      rateType, 
      paymentTerms, 
      status,
      adminFee,
      maxDaysPerYear 
    } = await req.json();

    // Validate required fields
    if (!title || !consultants || consultants.length === 0 || !customer || 
        !startDate || !endDate || !rate || !rateType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newContract = await contract.create({
      title,
      description,
      consultants,
      customer,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rate: Number(rate),
      rateType,
      adminFee: adminFee || 0,
      paymentTerms: paymentTerms || "30 days",
      status: status || "Draft",
      maxDaysPerYear: maxDaysPerYear ? Number(maxDaysPerYear) : null
    });
    
    return NextResponse.json(
      { success: true, data: newContract },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const consultantId = searchParams.get('consultantId');
    
    const query = consultantId ? { consultants: consultantId } : {};
    
    const contracts = await contract.find(query)
    .populate({
      path: "customer",
      model: customer,
      select: "fullName email phone"
    })
    .populate({
      path: "consultants",
      model: Users,
      select: "name email"
    })
    .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: contracts },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}