const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createTransaction, updateTransactions, getTransactionById, deleteTransaction, getAllTransactions } = require('../controller/TransactionController');
const { validateRequest } = require("../middleware/validateRequest");
const {
  createTransactionValidator,
  updateTransactionValidator
} = require("../validators/transactionValidators");


const router = express.Router();

router.post("/createTransaction" , protect ,createTransactionValidator, validateRequest , createTransaction)
router.get("/getAll-transaction" , protect , getAllTransactions)
router.put("/updateTransaction/:id" , protect ,updateTransactionValidator, validateRequest , updateTransactions)
router.get("/getTransactionDetails/:id" , protect , getTransactionById)
router.delete("/deleteTransaction/:id" , protect , deleteTransaction)


module.exports = router;
