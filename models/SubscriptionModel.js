const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Entertainment",     // Netflix, Spotify, Prime Video
      "Productivity",      // Notion, Grammarly, Adobe
      "Health & Fitness",  // Gym, Headspace, MyFitnessPal
      "Finance",           // TradingView, Credit Services
      "Education",         // Udemy, Skillshare, Coursera
      "Cloud Storage",     // Google One, iCloud, Dropbox
      "News & Media",      // TOI+, NYTimes, Inshorts+
      "Gaming",            // Xbox Pass, PlayStation+
      "Software Tools",    // GitHub Copilot, Postman
      "Utilities",         // VPNs, 1Password, NordPass
      "E-commerce",        // Amazon Prime, Flipkart Plus
      "Food & Delivery",   // Swiggy One, Zomato Gold
      "Travel",            // IRCTC Prime, Airbnb+
      "Communication",     // Zoom, Slack, Discord Nitro
      "Other"
    ],
    default: "Other",
  },
  description: {
    type: String,
    default: ""
  },
  amount: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly",
  },
  billingDay: {
  type: Number,
  min: 1,
  max: 31,
  required: true,
},

  status: {
    type: String,
    enum: ["active", "paused", "cancelled"],
    default: "active",
  },
  nextBillingDate: {
    type: Date,
    required: true,
  },
  pauseDate: {
    type: Date,
  },
  cancelDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
