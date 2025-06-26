const { body } = require("express-validator");

exports.createTransactionValidator = [
  body("cardId").notEmpty().withMessage("cardId is required"),
  body("type").isIn(['transfer', 'deposit', 'withdrawal', 'payment', 'refund', 'fee']).withMessage("Invalid transaction type"),
  body("category").isIn(['food', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'salary', 'investment', 'other']).withMessage("Invalid category"),
  body("description").notEmpty().withMessage("description is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("amount must be a number greater than 0"),
  body("status").isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage("Invalid status"),
  body("merchant").notEmpty().withMessage("merchant is required"),
];

exports.updateTransactionValidator = [
  body("type").optional().isIn(['transfer', 'deposit', 'withdrawal', 'payment', 'refund', 'fee']),
  body("category").optional().isIn(['food', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'salary', 'investment', 'other']),
  body("description").optional().notEmpty(),
  body("amount").optional().isFloat({ gt: 0 }),
  body("status").optional().isIn(['pending', 'completed', 'failed', 'cancelled']),
  body("merchant").optional().notEmpty(),
];