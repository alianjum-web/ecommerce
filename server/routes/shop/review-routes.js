import express from 'express';

import { authMiddleware } from '../../controllers/auth/auth-controller.js';
import { validateReview } from '../../Middleware/validateReview.js';
import { handleValidationErrors } from '../../Middleware/handleValidationError.js';
import{
  addProductReview,
  getProductReviews,
} from "../../controllers/shop/product-review-controller.js";

const router = express.Router();

router.post("/add/:productId", authMiddleware, validateReview, handleValidationErrors, addProductReview);
router.get("/:productId", getProductReviews);

export default router;
