import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Hashed password
    role: { type: String, enum: ["Admin", "Consultant"], default: "Consultant" },
    phone: { type: String }, // Optional contact phone number
    yearsOfExperience: { type: Number }, // Number of years as consultant
    bio: { type: String }, // Short bio/description
    status: { 
      type: String, 
      enum: ["Active", "On Leave", "Inactive"], 
      default: "Active" 
    },
    country: { type: String }, // Optional
    address: { type: String }, // Optional
  },
  { timestamps: true }
);

const Users = mongoose.models.Users || mongoose.model("Users", UserSchema);
export default Users;