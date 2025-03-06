import mongoose from "mongoose";

const options = {
  // serverSelectionTimeoutMS: 10000,  // Timeout for selecting a server
  socketTimeoutMS: 45000,          // Timeout for socket operations
  connectTimeoutMS: 30000,         // Timeout for initial connection
};

const mongoURI = process.env.MONGODB_URI || "your_fallback_mongodb_uri"; // Ensure a fallback

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
    mongoose.connection.on("error", (err) => console.error("❌ Mongoose connection error:", err));
    mongoose.connection.on("disconnected", () => console.log("⚠️ Mongoose disconnected"));

    await mongoose.connect(mongoURI, options);
  } catch (error) {
    console.error("🚨 MongoDB connection FAILED:", error);
    process.exit(1); // Exit with failure
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔴 Closing MongoDB connection...");
  await mongoose.disconnect();
  console.log("🔴 MongoDB connection closed.");
  process.exit(0);
});

export default connectDB;
