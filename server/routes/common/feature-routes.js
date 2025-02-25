import express from 'express';
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage
} from "../../controllers/common/feature-controller.js";
import { upload } from '../../helpers/cloudinary.js';


const router = express.Router();

router.post("/add", upload.single("image"), addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", deleteFeatureImage)

export default router;
