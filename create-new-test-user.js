const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createNewTestUser() {
  try {
    console.log("👤 Creating new test user...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = require("./src/models/User");

    // Delete existing test user if exists
    await User.deleteOne({ email: "newtest@example.com" });
    console.log("🗑️ Deleted existing test user if any");

    // Create new test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = new User({
      email: "newtest@example.com",
      passwordHash: hashedPassword,
      name: "New Test User",
    });

    const savedUser = await testUser.save();
    console.log("✅ New test user created:", savedUser.email);
    console.log("📧 Email: newtest@example.com");
    console.log("🔑 Password: password123");

    await mongoose.disconnect();
    console.log("✅ User creation completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createNewTestUser();
