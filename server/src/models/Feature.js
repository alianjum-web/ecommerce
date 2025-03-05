import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // Cloudinary image URL
  imagePublicId: { type: String, required: true }, // Cloudinary public ID
}, { timestamps: true });

export const Feature = mongoose.model("Feature", FeatureSchema);