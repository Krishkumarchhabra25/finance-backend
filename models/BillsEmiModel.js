const mongoose = require("mongoose");

const billEmiSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  billName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
 category: {
  type: String,
  enum: [
    "Utility",
    "EMI",
    "Subscription",
    "Insurance",
    "Credit Card",
    "Rent",
    "Internet",
    "Mobile",
    "Education",
    "Health",
    "Shopping",
    "Transport",
    "Loan",
    "Other"
  ],
  required: true,
},
  status: {
    type: String,
    enum: ["PENDING", "PAID", "OVERDUE" , "COMPLETED"],
    default: "PENDING",
  },
  autoPay: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("BillEmi", billEmiSchema);
