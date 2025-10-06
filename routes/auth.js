const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

const router = Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET || "fallback-secret-key-for-dev";
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    console.log("🚀 Register endpoint hit");
    console.log("🔑 JWT_SECRET exists:", !!process.env.JWT_SECRET);
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "email and password (min 6) required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });

    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: { _id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id.toString());
    res.json({ token, user: { _id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
