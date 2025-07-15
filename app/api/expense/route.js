import dbConnect from "@/lib/db";
import Expense from "@/models/expense";
import Users from "@/models/user";
import MonthlySummary from "@/models/MonthlySummary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
  }

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

    // Convert amount to number
    const expenseAmount = Number(data.amount);
    if (isNaN(expenseAmount)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid expense amount" 
      }), { status: 400 });
    }

    // Create the expense
    const expense = new Expense({...data, amount: expenseAmount});
    await expense.save();
    
    // Update monthly summary
    const expenseDate = new Date(data.date);
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    const monthYear = `${monthNames[expenseDate.getMonth()]} ${expenseDate.getFullYear()}`;
    
    const existingSummary = await MonthlySummary.findOne({
      consultant: data.consultant,
      monthYear: monthYear
    });

    if (!existingSummary) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `No monthly summary exists for ${consultant.name} for ${monthYear}`
      }), { status: 400 });
    }

    const currentExpense = Number(existingSummary.expense) || 0;
    const totalApproved = Number(existingSummary.totalApprovedAmount) || 0;
    const baseSalary = Number(existingSummary.baseSalary) || 0;
    const insurance = Number(existingSummary.insuranceAmount) || 0;

    const newExpenseTotal = currentExpense + expenseAmount;
    const newRemainingBalance = totalApproved - (baseSalary + insurance + newExpenseTotal);

    await MonthlySummary.findByIdAndUpdate(
      existingSummary._id,
      {
        $set: { 
          expense: newExpenseTotal,
          remainingBalance: newRemainingBalance
        }
      },
      { new: true }
    );
    
    return new Response(JSON.stringify({ 
      success: true, 
      expense,
      updatedSummary: {
        previousExpense: currentExpense,
        newExpense: newExpenseTotal,
        remainingBalance: newRemainingBalance,
        balanceDeduction: expenseAmount
      }
    }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
  }

  try {
    await dbConnect();
    
    // Build query based on user role
    let query = {};
    if (session.user.role === 'Consultant') {
      query = { consultant: session.user.id };
    }
    
    const expenses = await Expense.find(query)
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