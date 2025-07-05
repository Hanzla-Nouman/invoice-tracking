
import dbConnect from "@/lib/db";
import Expense from "@/models/expense";
import Users from "@/models/user";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const expense = await Expense.findById(id).populate("consultant", "name email");
    if (!expense) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Expense not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      expense 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await req.json();
    
    // Verify consultant exists if being updated
    if (data.consultant) {
      const consultant = await Users.findById(data.consultant);
      if (!consultant || consultant.role !== "Consultant") {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Invalid consultant selected" 
        }), { status: 400 });
      }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, data, { new: true });
    if (!updatedExpense) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Expense not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      expense: updatedExpense 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const deletedExpense = await Expense.findByIdAndDelete(id);
    if (!deletedExpense) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Expense not found" 
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Expense deleted successfully" 
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}