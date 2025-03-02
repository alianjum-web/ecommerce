import express from 'express';
import { authMiddleware } from "../../controllers/auth/auth-controller.js"
import  { validateOrder }  from '../../Middleware/validatetOrder.js';

import {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} from "../../controllers/shop/order-controller.js";

const router = express.Router();

router.post("/create/:userId", authMiddleware, validateOrder, createOrder);
router.post("/capture", authMiddleware, capturePayment);
router.get("/list/:userId", authMiddleware, getAllOrdersByUser);
router.get("/details/:id", authMiddleware, getOrderDetails);

export default router;
