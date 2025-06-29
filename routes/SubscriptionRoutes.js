const express = require("express");
const { body } = require("express-validator");
const { createSubscription, pauseSubscription, resumeSubscription, cancelSubscription, deleteSubscription, getAllSubscriptions, getSubscriptionSummary } = require("../controller/SubscriptionController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();


// ✅ Create a subscription
router.post(
  "/create-subscription",
  protect
  ,
  [
    body("name").notEmpty().withMessage("Subscription name is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("billingCycle").isIn(["monthly", "yearly"]).withMessage("Billing cycle must be monthly or yearly"),
    body("billingDay").isInt({ min: 1, max: 31 }).withMessage("Billing day must be between 1 and 31"),
    body("category").isIn([
      "Entertainment", "Productivity", "Health & Fitness", "Finance", "Education",
      "Cloud Storage", "News & Media", "Gaming", "Software Tools", "Utilities",
      "E-commerce", "Food & Delivery", "Travel", "Communication", "Other"
    ]).withMessage("Invalid category"),
    body("accountId").isMongoId().withMessage("Valid accountId is required")
  ],
  createSubscription
);

// ✅ Pause a subscription
router.patch("/pause-subscription/:id", protect, pauseSubscription);

// ✅ Resume a paused subscription
router.patch("/resume-subscription/:id", protect, resumeSubscription);

// ✅ Cancel a subscription
router.patch("/cancel-subscription/:id", protect, cancelSubscription);

// ✅ Delete a subscription
router.delete("/delete-subscription/:id", protect, deleteSubscription);

// ✅ Get all subscriptions for the logged-in user
router.get("/getall-subscriptions", protect, getAllSubscriptions);

// ✅ Get summary of subscriptions for the logged-in user
router.get("/get-subscription-summary", protect, getSubscriptionSummary);

module.exports = router