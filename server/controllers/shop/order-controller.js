import {
  createPayPalPayment,
  getPayPalApprovalURL,
} from "../../helpers/paypal";
import Order from "../../models/Order";
import Cart from "../../models/Cart";
import Product from "../../models/Product";
import { validationResult } from "express-validator";
import logger from "../../utils/logger";
import { capturePayment } from "@/store/shop/order-slice";
import { UserCartItemsContent } from "@/components/shopping-view/cart-items-content";

const createOrder = async (req, res) => {
  try {
    //Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validate errorrs:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
    } = req.body;

    // Prepare Paypal payment data
    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transaction: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "Payment for order",
        },
      ],
    };

    // Create paypal payment using service
    const paymentInfo = await createPayPalPayment(paymentData);

    // Create order in database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: "pending",
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: paymentInfo.id,
      payerId,
    });

    await newlyCreatedOrder.save();
    // Get PayPal approval URL
    const approvalURL = getPayPalApprovalURL(paymentInfo);
    // Return success response
    logger.info(`Order created successfully: ${newlyCreatedOrder._id}`);
    res.status(201).json({
      success: true,
      approvalURL,
      orderId: newlyCreatedOrder._id,
    });

    res.status(200).json({
      success: true,
      approvalURL,
    });
  } catch (error) {
    logger.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;
    // Validate input
    if (!paymentId || !payerId || !orderId) {
      logger.error("invalid inout data");
      return res.status(400).json({
        success: false,
        message: "payementId, payerId, and orderId are required.",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn("Ordernot found");
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    //Update order details and payment details
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    //Uppdate product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        logger.error("Product not found");
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.totalStock < item.quantity) {
        logger.warn("Not enough dtock for product: ", product.title);
        return res.status(400).json({
          success: false,
          message: `Not eough stcok for product: ${product.title}`,
        });
      }

      // Product stock
      product.totalStock -= item.quantity;
      await product.save();
    }

    // Deelete the cart
    await Cart.findByIdAndDelete(order.cartId);

    // save the updated order
    await order.save();

    logger.warn("Order confirmed successfully");
    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: order,
    });
  } catch (error) {
    logger.error(`Error capturing payment ${error}`);
    res.status(500).json({
      success: false,
      message: "An error occurred while capturing the payment.",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails };
