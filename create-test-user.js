const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createTestUser() {
  try {
    console.log("👤 Creating test user...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = require("./src/models/User");

    // Check if user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("✅ Test user already exists:", existingUser.email);
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash("password123", 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log("✅ Password updated for test user");
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = new User({
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
    });

    const savedUser = await testUser.save();
    console.log("✅ Test user created:", savedUser.email);

    await mongoose.disconnect();
    console.log("✅ User creation completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createTestUser();
