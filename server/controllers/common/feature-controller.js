import Feature from "../../models/Feature";
import { imageUploadUtil } from "../../helpers/cloudinary";
import logger from "../../utils/logger";

const addFeatureImage = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      logger.warn("No image file provided");
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }
    // Upload the image to cloudinary
    const { url, publicId } = await imageUploadUtil(req.file.buffer);
    // save the image URL and publicID to DB
    const featureImage = new Feature({
      imageUrl: url,
      imagePublicId: publicId,
    });

    await featureImage.save();
    // Return success response
    logger.info(`Feature image added successfully: ${featureImage._id}`);
    res.status(201).json({
      success: true,
      data: featureImage,
    });
  } catch (e) {
    logger.error("Error adding feature image:", error);
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
