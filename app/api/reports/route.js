import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import dbConnect from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { type } = req.query;
  if (!type) {
    return res.status(400).json({ message: "Report type is required" });
  }

  try {
    const db = await dbConnect();
    let data;

    switch (type) {
      case "income":
        data = await db.collection("income").find().toArray();
        break;
      case "expenses":
        data = await db.collection("expenses").find().toArray();
        break;
      case "consultants":
        data = await db.collection("consultants").find({}, { projection: { name: 1, email: 1, phone: 1 } }).toArray();
        break;
      case "employees":
        data = await db.collection("employees").find().toArray();
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    const pdfDoc = new PDFDocument();
    const filePath = path.join("./public", `${type}-report.pdf`);
    const stream = fs.createWriteStream(filePath);
    pdfDoc.pipe(stream);

    pdfDoc.fontSize(20).text(`${type.toUpperCase()} REPORT`, { align: "center" });
    pdfDoc.moveDown();

    data.forEach((item) => {
      pdfDoc.fontSize(12).text(JSON.stringify(item, null, 2));
      pdfDoc.moveDown();
    });

    pdfDoc.end();

    stream.on("finish", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${type}-report.pdf`);
      res.sendFile(filePath);
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
