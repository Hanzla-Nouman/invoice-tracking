import dbConnect from "@/lib/db";
import Ticket from "@/models/ticket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
  
    const { id } = params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });

  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const updatedFields = await req.json();

    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: id, user: session.user.id }, 
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket, { status: 200 });

  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
