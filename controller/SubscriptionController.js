const moment = require("moment");
const Subscription = require("../models/SubscriptionModel");
const Account = require("../models/WalletModel");


// Utility to calculate the next billing date
const getNextBillingDate = (billingDay) => {
  const today = moment();
  const thisMonthBilling = moment().date(billingDay).startOf('day');

  if (thisMonthBilling.isSameOrAfter(today, 'day')) {
    return thisMonthBilling.toDate();
  } else {
    return thisMonthBilling.add(1, "month").toDate();
  }
};



exports.createSubscription = async (req, res) => {
  try {
    const { accountId, name, amount, billingCycle, category, description, billingDay } = req.body;

    const userId = req.user.id; // from protect middleware

    if (!accountId || !name || !amount || !billingCycle || !billingDay) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ message: "Invalid billing cycle." });
    }

    if (billingDay < 1 || billingDay > 31) {
      return res.status(400).json({ message: "Invalid billing day." });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    const nextBillingDate = getNextBillingDate(billingDay);

    const newSub = await Subscription.create({
      userId,
      accountId,
      name,
      category,
      description,
      amount,
      billingCycle,
      billingDay,
      status: "active",
      nextBillingDate,
    });

    res.status(201).json({ message: "Subscription created successfully", data: newSub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id; // comes from protect middleware

    const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });
    res.json({message: "Fetched all subcription sucessfully" , data:subscriptions});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubscriptionSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.find({ userId });

    let monthlyTotal = 0;
    let yearlyTotal = 0;
    let counts = {
      active: 0,
      paused: 0,
      cancelled: 0,
    };

    subscriptions.forEach(sub => {
      if (sub.status === "active") counts.active++;
      if (sub.status === "paused") counts.paused++;
      if (sub.status === "cancelled") counts.cancelled++;

      if (sub.status !== "cancelled") {
        if (sub.billingCycle === "monthly") {
          monthlyTotal += sub.amount;
          yearlyTotal += sub.amount * 12;
        } else {
          yearlyTotal += sub.amount;
        }
      }
    });

    res.json({
        message: "Subscription summary fetched successfully",
      monthlyTotal,
      yearlyTotal,
      counts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found." });
    if (sub.status !== "active") return res.status(400).json({ message: "Only active subscriptions can be paused." });

    const account = await Account.findById(sub.accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });

    account.balances += sub.amount;
    await account.save();

    sub.status = "paused";
    sub.pauseDate = moment().toDate();
    await sub.save();

    res.json({ message: "Subscription paused and amount refunded.", data: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found." });

    if (!["paused", "cancelled"].includes(sub.status)) {
      return res.status(400).json({ message: "Only paused or cancelled subscriptions can be resumed." });
    }

    const account = await Account.findById(sub.accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });

    if (account.balances < sub.amount) {
      return res.status(400).json({ message: "Insufficient balance to resume subscription." });
    }

    // Deduct payment
    account.balances -= sub.amount;
    await account.save();

    // Update subscription
    sub.status = "active";
    sub.pauseDate = null;
    sub.cancelDate = null;

    if (!sub.billingDay) {
      return res.status(400).json({ message: "Missing billingDay in subscription." });
    }

    sub.nextBillingDate = getNextBillingDate(sub.billingDay);
    await sub.save();

    res.json({ message: "Subscription resumed and payment processed.", data: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found." });
    if (sub.status === "cancelled") return res.status(400).json({ message: "Subscription already cancelled." });

    const account = await Account.findById(sub.accountId);
    if (!account) return res.status(404).json({ message: "Account not found." });

    account.balances += sub.amount;
    await account.save();

    sub.status = "cancelled";
    sub.cancelDate = moment().toDate();
    await sub.save();

    res.json({ message: "Subscription cancelled and amount refunded.", data: sub });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ message: "Subscription not found." });

    await Subscription.findByIdAndDelete(id);
    res.json({ message: "Subscription deleted permanently." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
