const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createBill, getAllBillsFiltered, getBillById, updateBill, deleteBill, markAsPaid } = require("../controller/BillsEmiController");
const router = express.Router();
const { body } = require("express-validator");


// ✅ Create a new Bill or EMI
router.post(
  "/Createbill-emi",
  [
    body("billName").notEmpty().withMessage("Bill name is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("dueDate").isISO8601().withMessage("Invalid due date"),
    body("category").isIn(["Utility", "EMI", "Subscription", "Insurance"]).withMessage("Invalid category"),
    body("cardId").isMongoId().withMessage("Invalid card ID"),
    body("accountId").isMongoId().withMessage("Invalid account ID"),
    body("autoPay").optional().isBoolean().withMessage("autoPay must be a boolean"),
  ],
  protect,
  createBill
);

// ✅ Get all bills & EMIs with filters
router.get("/getall-bill-emi", protect ,  getAllBillsFiltered);


// ✅ Get a single bill/emi by ID
router.get(
  "/getBillEmiById/:billId",
  protect,
 getBillById
);

// ✅ Update a bill/emi
router.patch(
  "/Update-bill-emi/:billId",
  [
    body("billName").optional().notEmpty(),
    body("amount").optional().isFloat({ gt: 0 }),
    body("dueDate").optional().isISO8601(),
    body("category").optional().isIn(["Utility", "EMI", "Subscription", "Insurance"]),
    body("cardId").optional().isMongoId(),
    body("accountId").optional().isMongoId(),
    body("autoPay").optional().isBoolean(),
  ],
  protect,
  updateBill
);

// ✅ Delete a bill/emi
router.delete(
  "/Delete-bill-emi/:billId",
  protect,
  deleteBill
);

// ✅ Mark a bill/emi as paid
router.post(
  "/MarkAsPaid-bill-emi/:billId/pay",
  protect,
  markAsPaid
);

module.exports = router;