import mongoose, { Schema } from 'mongoose';


const ProductSchema = new Schema(
  {
    image: {
      type: String,
      required: true, // ✅ Ensure every product has an image
    },
    title: {
      type: String,
      required: true,
      unique: true, // ✅ Prevent duplicate product titles
      trim: true,
    },
    description: {
      type: String,
      required: true, // ✅ Ensure every product has a description
    },
    category: {
      type: String,
      required: true, // ✅ Products should have a category
      trim: true,
    },
    brand: {
      type: String,
      required: true, // ✅ Specify the brand (especially in marketplaces)
      trim: true,
    },
    price: {
      type: Number,
      required: true, // ✅ Every product must have a price
      min: 0, // 🔹 Prevent negative prices
    },
    salePrice: {
      type: Number,
      min: 0, // 🔹 Prevent negative discount prices
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: "Sale price must be less than the original price.",
      }
    },
    totalStock: {
      type: Number,
      required: true, // ✅ Ensure stock quantity is defined
      min: 0, // 🔹 Prevent negative stock values
    },
    averageReview: {
      type: Number,
      min: 1,
      max: 5, // ✅ Keep review scores between 1-5
      default: 0, // 🔹 Start with 0 reviews
    },
  },
  { timestamps: true }
);
 
export const Product= mongoose.model("Product", ProductSchema);
