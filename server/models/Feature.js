import mongoose from "mongoose";

const FeatureSchema = new Schema(
  {
    image: String
  },
  { timestamps: true }
);

export const Feature = mongoose.model("Feature", FeatureSchema);