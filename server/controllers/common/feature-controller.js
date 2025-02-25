import { Feature } from "../../models/Feature.js";
import { imageUploadUtil, deleteImageFromCloudinary } from "../../helpers/cloudinary.js";
import logger from "../../utils/logger.js";

const addFeatureImage = async (req, res) => {
  try {
    // console.log("Received file:", req.file);

    if (!req.file) {
      logger.warn("No image file provided");
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    // console.log("Uploading image buffer...");
    const { url, publicId } = await imageUploadUtil(req.file.buffer);
    // console.log("Image uploaded successfully:", { url, publicId });

    // console.log("Saving image to database...");
    const featureImage = new Feature({
      imageUrl: url,
      imagePublicId: publicId,
    });

    await featureImage.save();
    // console.log("Image saved in DB:", featureImage);

    logger.info(`Feature image added successfully: ${featureImage._id}`);
    res.status(201).json({ success: true, data: featureImage });
  } catch (e) {
    // console.error("Error adding feature image:", e);
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

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      logger.warn("Invalid image id");
      return res.status(404).json({
        success: false,
        message: "Invalid image id",
      });
    }

    const featureImage = await Feature.findById(id);
    if (!image) {
      logger.warn("image does not exist");
      return res.status(404).json({
        success: false,
        message: "Image doesnot exist"
      })
    }

    if (image.imagePublicId) {
      await deleteImageFromCloudinary(featureImage.imagePublicId);
      logger.info(`image deleted from cloudinary with publicId:${imagePublicId} successfully`)
    }

    await Feature.findByIdAndDelete(id)
    logger.info(`Feature Image deleted successfully: ${id}`)
    res.status(200).json({
      success: true,
      message: "FeatureIMage deleted successfully"
    })
  } catch (error) {
    logger.error("Error occured while deleteing feature image", error);
    res.status(500).json({
      success: false,
      message: "Some error encountered while deleted feature image!",
    });
  }
};

export { addFeatureImage, getFeatureImages, deleteFeatureImage };
