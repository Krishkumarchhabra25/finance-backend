const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
const authRoutes = require("./routes/UserRoutes")
const walletAccountRoutes = require("./routes/walletAccountRoute")
const cardRoutes = require("./routes/CardRoutes")
const TransactionRoutes = require("./routes/TransactionRoutes")
const BillsEmiRoutes = require("./routes/BillsEmiRoutes")
const SubscriptionRoutes = require("./routes/SubscriptionRoutes")
require("./utils/autoPay");

const cors = require('cors')
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
});

connectDB();

const app = express();

app.use(express.json())
app.use(cookieParser())

 const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: false
}; 

app.use(cors(corsOptions));

app.use("/auth" , authRoutes)
app.use("/wallet" , walletAccountRoutes)
app.use("/card" , cardRoutes)
app.use("/transaction" , TransactionRoutes)
app.use("/billemi" , BillsEmiRoutes)
app.use("/subscription"  ,SubscriptionRoutes )

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>FinanceAI Backend</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(to right, #00b4db, #0083b0);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 1.25rem;
          }
        </style>
      </head>
      <body>
        <div>
          <h1>🚀 FinanceAI Backend</h1>
          <p>Server is running successfully on <strong>PORT ${process.env.PORT || 5000}</strong></p>
          <p>Made with ❤️ by Krish</p>
        </div>
      </body>
    </html>
  `);
});