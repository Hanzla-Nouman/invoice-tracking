import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    consultants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Users", 
      required: true 
    }],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rate: { type: Number, required: true },
    rateType: { type: String, enum: ["hour", "day", "fixed"], default: "hour", required: true },
    paymentTerms: { type: String, enum: ["15 days", "30 days", "60 days"], default: "30 days", required: true },
    status: { 
      type: String, 
      enum: ["Draft", "Active", "Completed", "Terminated", "On Hold"], 
      default: "Draft",
      required: true 
    },
    maxDaysPerYear: {
      type: Number,
      min: 1,      
      max: 366,   
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.models.Contract || mongoose.model("Contract", contractSchema);