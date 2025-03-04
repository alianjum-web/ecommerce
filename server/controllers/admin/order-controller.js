import {Order} from "../../models/Order.js";
import logger from "../../utils/logger.js";

/**
 * Get all orders for admin
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      logger.warn("No orders found in the database");
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    logger.info(`Fetched ${orders.length} orders successfully`);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders. Please try again later.",
    });
  }
};

/**
 * Get order details by ID for admin
 */
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      logger.warn(`Order not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    logger.info(`Order found with ID: ${id}`);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error(`Error fetching order details for ID: ${id}`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details. Please try again later.",
    });
  }
};

/**
 * Update order status by ID
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    // Validate orderStatus
    if (!orderStatus) {
      logger.warn("Order status is required");
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      logger.warn(`Order not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // Update order status
    order.orderStatus = orderStatus;
    await order.save();

    logger.info(`Order status updated for ID: ${id}. New status: ${orderStatus}`);
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error updating order status `, error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status. Please try again later.",
    });
  }
};

export { getAllOrders, getOrderDetails, updateOrderStatus };