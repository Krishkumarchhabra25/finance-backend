const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    loanType: {
      type: String,
      enum: [
        "Home Loan",
        "Car Loan",
        "Personal Loan",
        "Education Loan",
        "Other",
      ],
      required: true,
    },

    principal: { type: Number, required: true },
    outstanding: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    emi: { type: Number, required: true },

    startDate: { type: Date, required: true },
    remainingMonths: { type: Number, required: true },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    dueDay: { type: Number, required: true }, // e.g. 5th of every month
    nextDueDate: { type: Date, required: true }, // e.g. 2025-07-05

    repaidPercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE",
    },

    autoPay: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
