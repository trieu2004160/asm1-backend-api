// Simple test without requiring server restart
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

console.log("🔍 Environment check:");
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✅ Found" : "❌ Not found"
);
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Found" : "❌ Not found"
);

// Test JWT signing
try {
  const secret = process.env.JWT_SECRET || "fallback-secret";
  const token = jwt.sign({ sub: "test-user-id" }, secret, { expiresIn: "7d" });
  console.log("✅ JWT signing works, token:", token.substring(0, 20) + "...");
} catch (error) {
  console.error("❌ JWT signing failed:", error.message);
}

// Test bcrypt
async function testBcrypt() {
  try {
    const hash = await bcrypt.hash("test123", 10);
    const valid = await bcrypt.compare("test123", hash);
    console.log(
      "✅ Bcrypt works:",
      valid ? "Password verified" : "Password failed"
    );
  } catch (error) {
    console.error("❌ Bcrypt failed:", error.message);
  }
}

testBcrypt();
