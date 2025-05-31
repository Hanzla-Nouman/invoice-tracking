import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, 
    role: { type: String, enum: ["Admin", "Consultant"], default: "Consultant" },
    phone: { type: String },
    yearsOfExperience: { type: Number },
    bio: { type: String },
    status: { 
      type: String, 
      enum: ["Active", "On Leave", "Inactive"], 
      default: "Active" 
    },
    country: { type: String }, 
    address: { type: String }, 
    ratePerHour: { type: Number, default: 0 },
    ratePerDay: { type: Number, default: 0 },
    // Add these new fields
    baseSalary: { type: Number, default: 0 },          // Monthly base salary
    insuranceAmount: { type: Number, default: 0 },     // Monthly insurance amount

  },
  { timestamps: true }
);
const Users = mongoose.models.Users || mongoose.model("Users", UserSchema);
export default Users;