const jwt = require('jsonwebtoken');
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // ✅ FIXED
      console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debug

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.data._id;

      req.user = await User.findById(id).select("-password");
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  }

  // If no token at all
  return res.status(401).json({ error: "Not authorized , no token" });
};

module.exports = { protect };
