import mongoose, { Schema } from "mongoose";
// Product Schema
const ProductSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    }, // Indexed for faster sorting
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true }, // Indexed for filtering
    brand: { type: String, required: true, trim: true, index: true }, // Indexed for filtering
    price: { type: Number, required: true, min: 0, index: true }, // Indexed for sorting
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

// Create model
export const Product = mongoose.model("Product", ProductSchema);