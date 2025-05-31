import dbConnect from "@/lib/db";
import Order from "@/models/order";
import Customer from "@/models/customer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { title, description, customer, amount, status, date } = await req.json();

    if (!title || !customer || !amount || !date) {
      return NextResponse.json({ message: "Title, customer, amount, and date are required" }, { status: 400 });
    }

    // Validate customer existence
    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 400 });
    }

    const newOrder = new Order({ title, description, customer, amount, status, date });
    await newOrder.save();

    return NextResponse.json({ message: "Order added successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Error adding order:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customer");

    let orders;
    if (customerId) {
      orders = await Order.find({ customer: customerId })
        .populate("customer", "name")
        .select("title description amount status date");
    } else {
      orders = await Order.find()
        .populate("customer", "fullName")
        .select("title description amount status date customer");
    }

    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
