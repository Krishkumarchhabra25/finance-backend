const Card = require("../models/CardModel");
const Wallet = require("../models/WalletModel");

exports.createCard = async (req, res) => {
  try {
    const {
      accountId,
      name,
      type,
      holderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      isActive
    } = req.body;

    if (!accountId || !name || !type || !holderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the account (wallet) and validate ownership
    const accountExists = await Wallet.findOne({ _id: accountId, userId: req.user?._id });
    if (!accountExists) {
      return res.status(400).json({ message: "Associated wallet account not found or access denied." });
    }

    // Card type allowed based on account type
    const allowedCardTypes = {
      Saving: ['Debit Card', 'ATM Card', 'RuPay Card'],
      Current: ['Debit Card', 'Credit Card', 'Business Credit Card'],
      Salary: ['Debit Card', 'Credit Card', 'RuPay Card'],
      NRI: ['Debit Card', 'Forex Card'],
      PMJDY: ['Debit Card', 'ATM Card', 'RuPay Card'],
      Credit: ['Credit Card']
    };

    const accountType = accountExists.type;

    if (!allowedCardTypes[accountType]?.includes(type)) {
      return res.status(400).json({
        message: `Card type '${type}' is not allowed for '${accountType}' account.`,
      });
    }

    // Check if card already exists for this account
    const existingCard = await Card.findOne({ accountId, userId: req.user?._id });
    if (existingCard) {
      return res.status(409).json({ message: "A card for this account already exists." });
    }

    const lastFourDigits = cardNumber.slice(-4);

    const newCard = new Card({
      userId: req.user?._id,
      accountId,
      name,
      type,
      holderName,
      cardNumber,
      lastFourDigits,
      expiryMonth,
      expiryYear,
      cvv,
      isActive: isActive ?? true,
    });

    const savedCard = await newCard.save();
    return res.status(201).json({ message: "Card created successfully", data: savedCard });

  } catch (error) {
    console.error("Create card error:", error);
    return res.status(500).json({ message: "Failed to create card.", details: error.message });
  }
};

exports.getAllCards = async(req,res)=>{
    try {
         const cards = await Card.find({ userId: req.user._id }).lean();
    return res.status(200).json({ message: "Cards fetched successfully.", count: cards.length, data: cards });
    } catch (error) {
        console.error("Get all cards error:", error);
    return res.status(500).json({ message: "Failed to fetch cards.", details: error.message });
    }
}

exports.getCardById = async(req,res)=>{
    try {
        const card = await Card.findOne({_id:req.params.id , userId:req.user._id});
        if(!card){
            return res.status(400).json({message:"card does no found"});
        }
        return res.status(200).json({message:"Card fetched succesfully" , data: card})
    } catch (error) {
        console.error("Get card by ID error:", error);
    return res.status(500).json({ message: "Failed to fetch card.", details: error.message });
    }
}

exports.getCardByAccount = async (req, res) => {
  try {
    const accountId = req.query.accountId; // ✅ Use query instead of params

    if (!accountId) {
      return res.status(400).json({ message: "accountId is required in query." });
    }

    const cards = await Card.find({ accountId, userId: req.user._id });
    return res.status(200).json({ message: "Cards linked to account fetched.", count: cards.length, data: cards });
  } catch (error) {
    console.error("Get cards by account error:", error);
    return res.status(500).json({ message: "Failed to fetch cards.", details: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const allowedFields = [
      "accountId", "name", "type", "holderName", "cardNumber", "expiryMonth", "expiryYear",
      "cvv", "isActive"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (!updates.accountId) {
      return res.status(400).json({ message: "accountId is required for validation." });
    }

    // Find the account (wallet)
    const accountExists = await Wallet.findOne({ _id: updates.accountId, userId: req.user?._id });
    if (!accountExists) {
      return res.status(400).json({ message: "Associated wallet account not found or access denied." });
    }

    // Validate card type against account type if 'type' is being updated
    if (updates.type) {
      const allowedCardTypes = {
        Saving: ['Debit Card', 'ATM Card', 'RuPay Card'],
        Current: ['Debit Card', 'Credit Card', 'Business Credit Card'],
        Salary: ['Debit Card', 'Credit Card', 'RuPay Card'],
        NRI: ['Debit Card', 'Forex Card'],
        PMJDY: ['Debit Card', 'ATM Card', 'RuPay Card'],
        Credit: ['Credit Card']
      };

      const accountType = accountExists.type;
      if (!allowedCardTypes[accountType]?.includes(updates.type)) {
        return res.status(400).json({
          message: `Card type '${updates.type}' is not allowed for '${accountType}' account.`,
        });
      }
    }

    if (updates.cardNumber) {
      updates.lastFourDigits = updates.cardNumber.slice(-4);
    }

    const updatedCard = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found or access denied." });
    }

    return res.status(200).json({ message: "Card updated successfully.", data: updatedCard });
  } catch (error) {
    console.error("Update card error:", error);
    return res.status(500).json({ message: "Failed to update card.", details: error.message });
  }
};


exports.deleteCard = async (req, res) => {
  try {
    const deleted = await Card.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Card not found or access denied." });

    return res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Delete card error:", error);
    return res.status(500).json({ message: "Failed to delete card.", details: error.message });
  }
};
