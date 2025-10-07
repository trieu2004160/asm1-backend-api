const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../src/models/User");

const router = Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// POST /api/auth/google
router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Invalid Google credential" });
    }

    const { email, name, picture } = payload;

    // Check if user exists, if not create one
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        googleId: payload.sub,
        profilePicture: picture,
        // No password hash for Google users
        passwordHash: null,
      });
    }

    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(401).json({ message: "Invalid Google credential" });
  }
});

module.exports = router;
