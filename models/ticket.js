import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
  status: { type: String, enum: ["Open", "In Progress", "Resolved", "Cancelled"], default: "Open" },
  response: { type: String, default: "" },
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
