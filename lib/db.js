import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/invoicing";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log("Using existing MongoDB connection ✅");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Connecting to MongoDB... ⏳");

    cached.promise = mongoose.connect(MONGODB_URI,{ serverSelectionTimeoutMS: 50000});

    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB ✅");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error ❌:", err);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
