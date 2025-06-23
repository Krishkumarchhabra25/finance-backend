const dotenv = require("dotenv");

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env.production' });
}



const express = require("express");
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db");
const authRoutes = require("./routes/UserRoutes")
const walletAccountRoutes = require("./routes/walletAccountRoute")
const cardRoutes = require("./routes/CardRoutes")
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


const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ["https://finance-ai-magement.vercel.app"] // production frontend URL
  : ["http://localhost:5173"]; // dev frontend

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));



app.use("/auth" , authRoutes)
app.use("/wallet" , walletAccountRoutes)
app.use("/card" , cardRoutes)

app.get('/', (req, res) => {
  res.send('API is running...');
});