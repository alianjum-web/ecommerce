import express from 'express';
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeaturImage
} from "../../controllers/common/feature-controller.js";
import { upload } from '../../helpers/cloudinary.js';


const router = express.Router();

router.post("/add", upload.single("image"), addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("delete/:id", deleteFeaturImage)

export default router;
