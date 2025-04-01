import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ticket from "@/models/ticket";

// Create a new ticket (POST)
export async function POST(req) {
    try {
      await dbConnect();
      const { title, message, priority, consultant } = await req.json();
  
      if (!title || !message || !priority || !consultant) {
        return NextResponse.json({ message: "All fields are required, including consultant" }, { status: 400 });
      }
  
      const newTicket = new ticket({ title, message, priority, consultant });
      await newTicket.save();
  
      return NextResponse.json({ message: "Ticket created successfully!", ticket: newTicket }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
  }
  

// Get all tickets (GET)
export async function GET() {
  try {
    await dbConnect();
    const tickets = await ticket.find().sort({ createdAt: -1 });
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
