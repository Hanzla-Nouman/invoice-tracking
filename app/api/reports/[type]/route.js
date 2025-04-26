import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import employee from "@/models/employee";
import expense from "@/models/expense";
import income from "@/models/income";
import { parse } from "json2csv";

export async function GET(req, { params }) {
  await dbConnect();

  const { type } = params;
  let data = [];

  try {
    switch (type) {
      case "employees":
        data = await employee.find({});
        break;
      case "expenses":
        data = await expense.find({});
        break;
      case "income":
        data = await income.find({});
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    if (!data.length) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const csv = parse(data.map((item) => item.toObject()));

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${type}-report.csv`,
    }});
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
