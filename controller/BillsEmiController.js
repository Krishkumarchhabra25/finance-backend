const Account = require("../models/WalletModel");
const BillEmi = require("../models/BillsEmiModel");
const moment = require("moment");


exports.createBill = async (req, res) => {
  try {
    const { billName, amount, dueDate, category, cardId, accountId, autoPay } = req.body;
    const userId = req.user.id;

    const bill = new BillEmi({ userId, billName, amount, dueDate, category, cardId, accountId, autoPay });
    await bill.save();

    res.status(201).json({ message: "Bill created", bill });
  } catch (err) {
    res.status(500).json({ message: "Create bill failed", error: err.message });
  }
};

exports.getAllBillsFiltered = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      month,
      year,
      category,
      status,
      sortBy = "dueDate",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId };

    if (category) query.category = category;
    if (status) query.status = status;

    if (month && year) {
      // Create moment start and end of the month
      const start = moment(`${year}-${month}-01`).startOf("month").toDate();
      const end = moment(`${year}-${month}-01`).endOf("month").toDate();
      query.dueDate = { $gte: start, $lte: end };
    }

    const bills = await BillEmi.find(query)
      .populate("cardId", "name type")
      .populate("accountId", "name type")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await BillEmi.countDocuments(query);

    res.status(200).json({ page: Number(page), totalCount, bills });
  } catch (err) {
    res.status(500).json({ message: "Fetch bills failed", error: err.message });
  }
};

// ✅ Get One Bill
exports.getBillById = async (req, res) => {
  try {
    const bill = await BillEmi.findOne({ _id: req.params.billId, userId: req.user.id })
      .populate("cardId", "name")
      .populate("accountId", "name");

    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Failed to get bill", error: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await BillEmi.findOne({ _id: req.params.billId, userId: req.user.id });
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.status !== "PENDING") {
      return res.status(403).json({ message: "Only PENDING bills can be updated" });
    }

    const updateFields = ["billName", "amount", "dueDate", "category", "cardId", "accountId", "autoPay"];
    const updateData = {};

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const updatedBill = await BillEmi.findByIdAndUpdate(bill._id, updateData, { new: true });

    res.json({ message: "Bill updated", bill: updatedBill });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};



exports.deleteBill = async (req, res) => {
  try {
    const bill = await BillEmi.findOne({ _id: req.params.billId, userId: req.user.id });

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.status !== "PENDING") {
      return res.status(403).json({ message: "Only PENDING bills can be deleted" });
    }

    await bill.deleteOne();
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};



exports.markAsPaid = async (req, res) => {
  try {
    const bill = await BillEmi.findOne({ _id: req.params.billId, userId: req.user.id });
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (bill.status !== "PENDING" && bill.status !== "OVERDUE") {
      return res.status(403).json({ message: "Only PENDING or OVERDUE bills can be marked as paid" });
    }

    const account = await Account.findById(bill.accountId);
    if (!account || account.balances < bill.amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    account.balances -= bill.amount;
    bill.status = "PAID";

    await account.save();
    await bill.save();

    res.json({ message: "Bill marked as PAID", bill });
  } catch (err) {
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
};
