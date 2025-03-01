import express from 'express';
import {addToCartLimiter} from "../../utils/limiter.js";

import {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} from "../../controllers/shop/cart-controller.js";
import { authMiddleware } from '../../controllers/auth/auth-controller.js';

const router = express.Router();

router.post("/add/:productId", authMiddleware, addToCartLimiter, addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update-cart/:productId", authMiddleware, updateCartItemQty);
router.delete("/:productId", authMiddleware, deleteCartItem);

export default router;