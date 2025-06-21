const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createAccountWallet, getAllWalletsAccount, editWalletAccount, getWalletDetails, deleteWalletAccount } = require('../controller/WalletControler');

const router = express.Router();

router.post("/createWallet-account", protect, createAccountWallet);
router.get("/getAllWallet-account", protect, getAllWalletsAccount);
router.put("/editWallet-account/:id", protect, editWalletAccount);
router.get("/detailsWallet-account/:id", protect, getWalletDetails);
router.delete("/deleteWallet-account/:id", protect, deleteWalletAccount);

module.exports = router;