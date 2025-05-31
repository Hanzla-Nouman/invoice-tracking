import dbConnect from "@/lib/db";
import expense from "@/models/expense";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const expenses = new expense(data);
    await expenses.save();
    return new Response(JSON.stringify({ success: true, expense }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const expenses = await expense.find().sort({ date: -1 });
    return new Response(JSON.stringify({ success: true, expenses }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
