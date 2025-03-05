import express from 'express';

import { authMiddleware } from '../../controllers/auth/auth-controller.js'
import { authorizeRoles } from '../../Middleware/auth.js';
import {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} from "../../controllers/admin/products-controller.js";

import { upload } from "../../helpers/cloudinary.js";

const router = express.Router();

router.post("/upload-image", authMiddleware, authorizeRoles, upload.single("image"), handleImageUpload);
router.post("/add", authMiddleware, authorizeRoles, addProduct);
router.put("/edit/:id", authMiddleware, authorizeRoles, editProduct);
router.delete("/delete/:id", authMiddleware, authorizeRoles, deleteProduct);
router.get("/get", authMiddleware, authorizeRoles, fetchAllProducts);

export default router;
