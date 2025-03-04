import { body } from 'express-validator';

export const validateReview = [
  body("reviewValue")
    .isInt({ min: 1, max: 5 })
    .withMessage("Review value must be between 1 and 5."),
  body("reviewMessage")
    .isString()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Review message must be at least 5 characters long."),

];

