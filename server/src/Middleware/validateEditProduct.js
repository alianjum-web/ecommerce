import { body, validationResult } from "express-validator";

// Validation rules for editing a product
export const validateEditProduct = [
  body("title")
    .optional() // Title is optional during editing
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),
  body("description")
    .optional() // Description is optional during editing
    .trim()
    .isString()
    .withMessage("Description must be a string"),

  body("price")
    .optional() // Price is optional during editing
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body('salePrice')
    .optional() // Sale price is optional during editing
    .isFloat({ gt: 0 })
    .withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error('Sale price must be less than the regular price');
      }
      return true;
    }),
  body("category")
    .optional() // Category is optional during editing
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isString()
    .withMessage("Category must be a string"),

  body("brand")
    .optional() // Brand is optional during editing
    .trim()
    .isString()
    .withMessage("Brand must be a string"),

  body("totalStock")
    .optional() // Total stock is optional during editing
    .isInt({ min: 0 })
    .withMessage("Total stock must be a non-negative integer"),

  body("averageReview")
    .optional() // Average review is optional during editing
    .isFloat({ min: 0, max: 5 }) // floating(decimel) number
    .withMessage("Average review must be a number between 0 and 5"),
];
