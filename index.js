const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
const authRoutes = require("./routes/UserRoutes")
const walletAccountRoutes = require("./routes/walletAccountRoute")
const cardRoutes = require("./routes/CardRoutes")
const TransactionRoutes = require("./routes/TransactionRoutes")
const BillsEmiRoutes = require("./routes/BillsEmiRoutes")

require("./utils/autoPay");

const cors = require('cors')
dotenv.config();

connectDB();

const app = express();

app.use(express.json())
app.use(cookieParser())

/* const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: false
}; */


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/auth" , authRoutes)
app.use("/wallet" , walletAccountRoutes)
app.use("/card" , cardRoutes)
app.use("/transaction" , TransactionRoutes)
app.use("/billemi" , BillsEmiRoutes)
app.listen(
    process.env.PORT || 5000,
      console.log(`Server running mode on port ${process.env.PORT || 5000}`)

)