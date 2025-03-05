import { mongoose } from "mongoose";

const options = {
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  connectTimeoutMS: 30000, // Timeout for initial connection
}

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI,options);
    console.log("MongoDB connected");

    // Event listeners for connection status
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      mongoose.connection.close(() => {
        console.log("Mongoose connection closed due to application termination");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("MongoDB connection FAILED:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

export default connectDB;