import { body } from "express-validator";

// ✅ Order Validation Rules
export const validateOrder = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("payerId").isMongoId().withMessage("Invalid payer ID"),
  body("cartItems").isArray({ min: 1 }).withMessage("Cart cannot be empty"),
  body("cartItems.*.productId").isMongoId().withMessage("Invalid product ID"),
  body("cartItems.*.title").isString().notEmpty().withMessage("Title is required"),
  body("cartItems.*.image").isString().notEmpty().withMessage("Image is required"),
  body("cartItems.*.price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("cartItems.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("addressInfo.addressId").isString().notEmpty().withMessage("Address ID is required"),
  body("addressInfo.address").isString().notEmpty().withMessage("Address is required"),
  body("addressInfo.city").isString().notEmpty().withMessage("City is required"),
  body("addressInfo.pincode").isString().notEmpty().withMessage("Pincode is required"),
  body("addressInfo.phone").isString().notEmpty().withMessage("Phone number is required"),
  body("orderStatus")
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
  body("paymentMethod")
    .isIn(["credit_card", "paypal", "bank_transfer", "cash_on_delivery"])
    .withMessage("Invalid payment method"),
  body("paymentStatus").isIn(["pending", "paid", "failed"]).withMessage("Invalid payment status"),
  body("totalAmount").isFloat({ gt: 0 }).withMessage("Total amount must be greater than 0"),
  body("paymentId")
    .optional()
    .isString()
    .custom((value, { req }) => {
      if (req.body.paymentStatus === "paid" && !value) {
        throw new Error("Payment ID is required when payment status is 'paid'");
      }
      return true;
    }),
];
