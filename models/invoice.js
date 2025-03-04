import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant", // Linking to Consultant model
      required: true,
    },
    timesheets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Timesheet", // Linking to Timesheet model
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    dateIssued: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
