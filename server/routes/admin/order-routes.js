import express from "express";

import {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} from "../../controllers/admin/order-controller";

const router = express.Router();

router.get("/get", getAllOrders);
router.get("/details/:id", getOrderDetails);
router.get("/update/:id", updateOrderStatus);

export default router;
