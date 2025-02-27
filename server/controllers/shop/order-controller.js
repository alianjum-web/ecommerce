import {
  createPayPalPayment,
  getPayPalApprovalURL,
} from "../../helpers/paypal.js";
import {Order} from "../../models/Order.js";
import {Cart} from "../../models/Cart.js";
import {Product} from "../../models/Product.js";
import { validationResult } from "express-validator";
import logger from "../../utils/logger.js";
import mongoose from "mongoose";

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
    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required.",
      });
    }

    // Fetch orders using aggregation
    const orders = await Order.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } }, // Match orders by userId
      {
        $lookup: {
          from: 'products', // Join with the products collection
          let: { cartItems: '$cartItems' }, // Define variables for the pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$cartItems.productId'], // Match products in cartItems
                },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                price: 1,
                salePrice: 1,
                image: 1,
              },
            },
          ],
          as: 'productDetails', // Store the result in productDetails
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          cartId: 1,
          cartItems: {
            $map: {
              input: '$cartItems',
              as: 'item',
              in: {
                productId: '$$item.productId',
                quantity: '$$item.quantity',
                productDetails: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$productDetails',
                        as: 'product',
                        cond: { $eq: ['$$product._id', '$$item.productId'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
          addressInfo: 1,
          orderStatus: 1,
          paymentStatus: 1,
          totalAmount: 1,
          paymentId: 1,
          payerId: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user.",
      });
    }
    // Return success response
    logger.info("The orders are");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error("error fetching orders", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while capturing the payment.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
// Validate for the id
if (!id || !mongoose.Types.ObjectId.isValid(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid order ID.",
  });
}

const order = await Order.aggregate([
  { $match: { _id: mongoose.Types.ObjectId(id) } }, //match order by id
  { $unwind: "$cartItems" }, // Unwind the artItems array
  {
    $lookup: {
      form: "produts", // Join with products collection
      localFeild: "cartItems.productId",
      foreignField: "_id",
      as: "productDetails",
    },
  },
  { $unwind: "$productDetails" },
  {
    $group: {
      _id: "$_id",
      userId: { $first: "$userId" },
      cartId: { $first: "$cartId" },
      addressInfo: { $first: "$addressInfo" },
      orderStatus: { $first: "$orderStatus" },
      paymentStatus: { $first: "$paymentStatus" },
      totalAmount: { $first: "$totalAmount" },
      paymentId: { $first: "$paymentId" },
      payerId: { $first: "$payerId" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
      cartItems: {
        $push: {
          productId: "$cartItems.productId",
          quantity: "$cartItems.quantity",
          productDetails: "$productDetails",
        },
      },
    },
  },
])
  
if (!order.length) {
  return res.status(404).json({
    success: false,
    message: "Order not found.",
  });
}

// Return success response
res.status(200).json({
  success: true,
  data: order[0],
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
