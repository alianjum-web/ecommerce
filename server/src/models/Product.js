import mongoose, { Schema } from "mongoose";
import  logger from "../utils/logger.js";
// Product Schema
const ProductSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    title: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Sale price must be less than the original price.",
      },
    },
    totalStock: { type: Number, required: true, min: 0 },
    averageReview: { type: Number, min: 1, max: 5, default: 0 },
  },
  { timestamps: true }
);

// Ensure the full-text index exists
ProductSchema.index({ title: "text", description: "text", category: "text", brand: "text" });

// Create the model
const Product = mongoose.model("Product", ProductSchema);

// 🔹 Function to automatically create indexes at startup
const ensureIndexes = async () => {
  try {
    await Product.syncIndexes(); // Ensures all indexes exist
    console.log(" MongoDB Indexes Created Successfully!");
  } catch (error) {
    console.error(" Error Creating MongoDB Indexes:", error);
  }
};

// Call the function to create indexes when the server starts
ensureIndexes();

export { Product }; 
