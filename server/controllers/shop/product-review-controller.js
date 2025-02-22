import {Order} from "../../models/Order.js";
import {Product} from "../../models/Product.js";
import {ProductReview} from "../../models/Review.js";
import logger from "../../utils/logger.js";
import mongoose from "mongoose";

const addProductReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // startSession, startTransaction): Ensures all operations succeed together or fail together.
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;
    // Validate input
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or user ID.",
      });
    }

    //check if the user has purchased the order
    const order = await Order.findOne({
      userId,
      "cartItem.productId": productId,
      orderStatus: { $in: ["confirmed", "delivered"] }, // Only allow reviews for confirmed or delivered orders.
    }).session(session);

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase the product to review it",
      });
    }
    // check if user already reviewd the product
    const existingReview = await ProductReview.findOne({
      productId,
      userId,
    }).session(session);

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Create a new review
    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });
    await newReview.save({ session });

    // Calculare teh new average review for hte product
    const reviews = await ProductReview.find({ productId }).session(session);
    const totalReviews = reviews.length;
    const averageReview =
      reviews.reduce((sum, review) => sum + review.reviewValue, 0) /
      totalReviews;

    //Update teh product average review
    await Product.findByIdAndUpdate(productId, { averageReview }, { session });

    // commit the transaction
    await session.commitTransaction();
    session.endSession();
    // Return success response
    logger.info(`Review added successfully for product: ${productId}`);
    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    // Rollback the transaction if error occured
    await session.abortTransaction();
    session.endSession();

    logger.error("Error adding product review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Fetch reviews for the product
    const reviews = await ProductReview.find({ productId });

    // Return success response
    logger.info(`Fetched reviews for product: ${productId}`);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    logger.error("Error fetching product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addProductReview, getProductReviews };
