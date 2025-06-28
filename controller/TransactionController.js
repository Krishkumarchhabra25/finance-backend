const Transaction = require("../models/TransactionModel");
const walletModel = require("../models/WalletModel")
const Card = require("../models/CardModel");
const { isIrreversible } = require('../utils/transactionUtils');

exports.createTransaction = async (req, res) => {
  try {
    const { cardId, type, category, description, amount, status, merchant } = req.body;

    if (!cardId || !type || !description || !category || !amount || !status || !merchant) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Find the card and ensure it belongs to the user
    const card = await Card.findOne({ _id: cardId, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: "Card not found or unauthorized" });
    }

    // 2. Find the wallet (account) linked to this card
    const wallet = await walletModel.findOne({ _id: card.accountId, userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found or unauthorized" });
    }

    // 3. Check if the wallet has sufficient balance
    if (wallet.balances < amount) {
      return res.status(400).json({ message: "Insufficient account balance" });
    }

    // 4. Deduct the amount from the wallet balance
    wallet.balances -= amount;
    await wallet.save();

    // 5. Create the transaction
    const newTransaction = await Transaction.create({
      userId: req.user.id,
      cardId,
      type,
      category,
      description,
      amount,
      status,
      merchant,
    });

    res.status(201).json({ message: "Transaction created successfully", data: newTransaction });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({message:"Fetched successully" , data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.updateTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cardId, type, category, description, amount, status, merchant,
    } = req.body;

    const requiredFields = { cardId, type, category, description, amount, status, merchant };
    const missing = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }   

    const originalTransaction = await Transaction.findById(id);
    if (!originalTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // ✅ Restrict update if irreversible
    if (isIrreversible(originalTransaction.type, originalTransaction.category)) {
      return res.status(403).json({
        message: "This transaction cannot be updated (final transaction)."
      });
    }

    // Refund old amount
    const oldCard = await Card.findOne({ _id: originalTransaction.cardId, userId: req.user.id });
    const oldWallet = await walletModel.findOne({ _id: oldCard.accountId, userId: req.user.id });

    oldWallet.balances += originalTransaction.amount;
    await oldWallet.save();

    // Deduct new amount from updated wallet
    const newCard = await Card.findOne({ _id: cardId, userId: req.user.id });
    const newWallet = await walletModel.findOne({ _id: newCard.accountId, userId: req.user.id });

    if (newWallet.balances < amount) {
      return res.status(400).json({ message: "Insufficient balance in updated wallet" });
    }

    newWallet.balances -= amount;
    await newWallet.save();

    // Save updated transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { cardId, type, category, description, amount, status, merchant },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction
    });

  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id
    }).populate('cardId');

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    res.status(200).json({ data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    if (isIrreversible(transaction.type, transaction.category)) {
      return res.status(403).json({
        message: "This transaction cannot be deleted (final transaction)."
      });
    }

    const card = await Card.findOne({ _id: transaction.cardId, userId: req.user.id });
    const wallet = await walletModel.findOne({ _id: card.accountId, userId: req.user.id });

    wallet.balances += transaction.amount;
    await wallet.save();

    await Transaction.findByIdAndDelete(id);

    res.status(200).json({ message: "Transaction deleted and balance restored." });

  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
