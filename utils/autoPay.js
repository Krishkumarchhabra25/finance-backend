// jobs/autoPayJob.js
const cron = require("node-cron");
const { autoPayEMI } = require("../controller/LoansAndDebtController"); // adjust path as needed

// Runs every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  console.log("🔄 Running AutoPay EMI Job - 2:00 AM");
  await autoPayEMI();
});
