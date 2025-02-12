import Feature from "../../models/Feature";
import logger from '../../utils/logger';

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
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
      })
    }
    
    res.status(200).json({
      success: true,
      data: images,
    })

  } catch (e) {
    logger.error("Error occured while getting image", e);
    res.status(500).json({
      success: false,
      message: "Some error encountered!",
    })
  }
} 
export { addFeatureImage, getFeatureImages };
