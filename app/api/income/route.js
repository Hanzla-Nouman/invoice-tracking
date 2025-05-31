import dbConnect from "@/lib/db";
import income from "@/models/income";

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const incomes = new income(data);
    await incomes.save();
    return new Response(JSON.stringify({ success: true, income }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const incomes = await income.find().sort({ date: -1 });
    return new Response(JSON.stringify({ success: true, incomes }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
