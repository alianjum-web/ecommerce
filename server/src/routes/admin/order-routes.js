import express from "express";

import { authMiddleware } from "../../controllers/auth/auth-controller.js";
import { authorizeRoles } from "../../Middleware/auth.js";
import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} from "../../controllers/admin/order-controller.js";

const router = express.Router();

router.get("/get", authMiddleware, authorizeRoles, getAllOrders);
router.get("/details/:id", authMiddleware, authorizeRoles, getOrderDetails);
router.put("/update/:id", authMiddleware, authorizeRoles, updateOrderStatus);

export default router;
