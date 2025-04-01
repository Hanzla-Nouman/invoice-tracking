import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
    description: { type: String },
    source: { 
      type: String, 
      enum: ["Facebook", "Advertisement", "Referral", "Website", "Other"], 
      required: true 
    },
  },
  { timestamps: true } 
);

export default mongoose.models.Lead || mongoose.model("Lead", leadSchema);
