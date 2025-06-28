const Account = require("../models/WalletModel");
const moment = require("moment");
const Loan = require("../models/LoansAndDebtModel");


exports.createLoan = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      loanType, principal, outstanding, interestRate,
      emi, startDate, remainingMonths, accountId,
      dueDay, autoPay = true
    } = req.body;

    if (outstanding > principal) {
      return res.status(400).json({ message: "Outstanding cannot exceed principal" });
    }

    const repaidPercentage = ((principal - outstanding) / principal) * 100;
    const nextDueDate = moment(startDate).date(dueDay).startOf("day").toDate();

    const loan = await Loan.create({
      userId,
      loanType,
      principal,
      outstanding,
      interestRate,
      emi,
      startDate,
      remainingMonths,
      accountId,
      dueDay,
      nextDueDate,
      autoPay,
      repaidPercentage
    });

    res.status(201).json({ message: "Loan created", loan });
  } catch (err) {
    res.status(500).json({ message: "Create loan failed", error: err.message });
  }
};


// ✅ Update Loan
exports.updateLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (loan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      principal, outstanding, interestRate, emi,
      remainingMonths, dueDay, autoPay, status
    } = req.body;

    if (outstanding > principal) {
      return res.status(400).json({ message: "Outstanding cannot exceed principal" });
    }

    loan.principal = principal ?? loan.principal;
    loan.outstanding = outstanding ?? loan.outstanding;
    loan.interestRate = interestRate ?? loan.interestRate;
    loan.emi = emi ?? loan.emi;
    loan.remainingMonths = remainingMonths ?? loan.remainingMonths;
    loan.dueDay = dueDay ?? loan.dueDay;
    loan.autoPay = autoPay ?? loan.autoPay;

    if (status === "CLOSED") {
      loan.status = "CLOSED";
      loan.outstanding = 0;
      loan.repaidPercentage = 100;
    } else {
      loan.repaidPercentage = ((loan.principal - loan.outstanding) / loan.principal) * 100;
    }

    await loan.save();
    res.status(200).json({ message: "Loan updated", loan });
  } catch (err) {
    res.status(500).json({ message: "Update loan failed", error: err.message });
  }
};


// ✅ Delete Loan
exports.deleteLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (loan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await loan.remove();
    res.status(200).json({ message: "Loan deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete loan failed", error: err.message });
  }
};


// ✅ Get Loan Details
exports.getLoanDetails = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findById(loanId).populate("accountId", "name type");
    if (!loan || loan.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Loan not found or unauthorized" });
    }

    res.status(200).json(loan);
  } catch (err) {
    res.status(500).json({ message: "Fetch loan failed", error: err.message });
  }
};


// ✅ Get All Loans
exports.getAllLoans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { loanType, status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (loanType) query.loanType = loanType;
    if (status) query.status = status;

    const loans = await Loan.find(query)
      .populate("accountId", "name type")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Loan.countDocuments(query);
    res.status(200).json({ page: Number(page), totalCount, loans });
  } catch (err) {
    res.status(500).json({ message: "Fetch loans failed", error: err.message });
  }
};


// ✅ Get Loan Dashboard Summary
exports.getLoanSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({ userId, status: "ACTIVE" });

    const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);
    const totalEMI = loans.reduce((sum, loan) => sum + loan.emi, 0);
    const activeLoans = loans.length;

    res.status(200).json({
      totalOutstanding,
      totalEMI,
      activeLoans
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
};


exports.autoPayEMI = async () => {
  const pLimit = (await import("p-limit")).default; // ✅ Dynamic ESM import
  const limit = pLimit(20);

  const today = moment().startOf("day").toDate();
  const loans = await Loan.find({ autoPay: true, status: "ACTIVE", nextDueDate: today });

  await Promise.all(
    loans.map((loan) =>
      limit(async () => {
        try {
          const account = await Account.findById(loan.accountId);

          if (!account) {
            console.log(`❌ No account found for loan ${loan._id}`);
            return;
          }

          if (account.balances < loan.emi) {
            console.log(`⚠️ AutoPay failed for loan ${loan._id} due to insufficient balance`);

            loan.status = "OVERDUE";
            const lateFine = 100;
            loan.outstanding += lateFine;
            loan.nextDueDate = moment(loan.nextDueDate).add(1, "month").startOf("day").toDate();
            await loan.save();
            return;
          }

          account.balances -= loan.emi;
          await account.save();

          loan.outstanding -= loan.emi;
          loan.remainingMonths -= 1;

          if (loan.outstanding <= 0 || loan.remainingMonths <= 0) {
            loan.status = "CLOSED";
            loan.outstanding = 0;
            loan.repaidPercentage = 100;
          } else {
            loan.repaidPercentage = ((loan.principal - loan.outstanding) / loan.principal) * 100;
            loan.status = "ACTIVE";
          }

          loan.nextDueDate = moment(loan.nextDueDate).add(1, "month").startOf("day").toDate();
          await loan.save();

          console.log(`✅ AutoPay success for loan ${loan._id}`);
        } catch (err) {
          console.error(`❌ Error processing loan ${loan._id}:`, err.message);
        }
      })
    )
  );
};