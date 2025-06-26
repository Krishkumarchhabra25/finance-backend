const Transaction = require("../models/TransactionModel");
const Card = require("../models/CardModel");


exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({message:"Fetched successully" , data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.createTransaction = async (req,res)=>{
    try {
        const {cardId , type , category , description , amount , status , transaction , merchant} = req.body

        if(!cardId || !type || !description || !category || !amount || !status || !transaction , !merchant){
            return res.status(400).json({message: "Missing requuired fields"})
        };

    
    const card = await Card.findOne({ _id: cardId, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: "Card not found or unauthorized" });
    }
     // ✅ Create the transaction
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


    res.status(201).json({ message: "Transaction created successfully" ,data:newTransaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }

  }

exports.updateTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cardId,
      type,
      category,
      description,
      amount,
      status,
      merchant,
    } = req.body;

  
    const requiredFields = { cardId, type, category, description, amount, status, merchant };
    const missing = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Check if transaction exists
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if card belongs to user
    const card = await Card.findOne({ _id: cardId, userId: req.user.id });
    if (!card) {
      return res.status(403).json({ message: "Unauthorized: Card does not belong to user" });
    }

    // Build update object
    const updateFields = {
      cardId,
      type,
      category,
      description,
      amount,
      status,
      merchant,
      
    };

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const fieldErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: fieldErrors
      });
    }

    console.error("Error in update:", error);
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

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
