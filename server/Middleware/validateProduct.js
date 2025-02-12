import { body } from "express-validator";

export const validateProduct = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("brand").notEmpty().withMessage("Brand is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("salesPrice")
    .optional()
    .isNumeric()
    .withMessage("Sale price must be a number"),
  body("totalStock")
    .notEmpty()
    .withMessage("totalStock must be required")
    .isNumeric()
    .withMessage("Total Stoack must be a number"),
  body("averageReview")
    .optional()
    .isNumeric()
    .withMessage("Average review must be a number"),
];
// .notEmpty() should come before .isNumeric(), otherwise, .isNumeric() will try to validate an empty string, which may cause issues.
