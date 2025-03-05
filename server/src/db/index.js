import { mongoose } from "mongoose";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10, // Number of connections in the pool
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
  connectTimeoutMS: 30000, // Timeout for initial connection
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  mongoose
    .connect(mongoURI, options)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log("MONGODB connection FAILED ", error));
};

export default connectDB;