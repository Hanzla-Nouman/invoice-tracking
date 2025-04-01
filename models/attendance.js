import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
