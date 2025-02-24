import {Feature} from "../../models/Feature.js";
import { imageUploadUtil } from "../../helpers/cloudinary.js";
import logger from "../../utils/logger.js";

const addFeatureImage = async (req, res) => {
  try {
    console.log("Received file:", req.file);

    if (!req.file) {
      logger.warn("No image file provided");
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    console.log("Uploading image buffer...");
    const { url, publicId } = await imageUploadUtil(req.file.buffer);
    console.log("Image uploaded successfully:", { url, publicId });

    console.log("Saving image to database...");
    const featureImage = new Feature({ imageUrl: url, imagePublicId: publicId });

    await featureImage.save();
    console.log("Image saved in DB:", featureImage);

    logger.info(`Feature image added successfully: ${featureImage._id}`);
    res.status(201).json({ success: true, data: featureImage });

  } catch (e) {
    console.error("Error adding feature image:", e);
    logger.error("Error adding feature image:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});
    if (!images) {
      logger.warn("No image found");
      res.status(400).json({
        success: false,
        message: "image not found in db",
      });
    }

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    logger.error("Error occured while getting image", e);
    res.status(500).json({
      success: false,
      message: "Some error encountered!",
    });
  }
};
export { addFeatureImage, getFeatureImages };
