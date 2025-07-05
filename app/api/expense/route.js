import dbConnect from "@/lib/db";
import Expense from "@/models/expense";
import Users from "@/models/user";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Verify consultant exists
    const consultant = await Users.findById(data.consultant);
    if (!consultant || consultant.role !== "Consultant") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid consultant selected" 
      }), { status: 400 });
    }

    const expense = new Expense(data);
    await expense.save();
    
    return new Response(JSON.stringify({ 
      success: true, 
      expense 
    }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find()
      .populate("consultant", "name email")
      .sort({ date: -1 });
      
    return new Response(JSON.stringify({ 
      success: true, 
      expenses 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}