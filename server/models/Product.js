import mongoose, { Schema } from "mongoose";
// Product Schema
const ProductSchema = new Schema(
  {
    imageUrl: { type: String, required: true },  // cloudinary imageurl
    imagePublicId: { type: String, required: true }, // cloudinary publicid
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
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
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },
    averageReview: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchema);
