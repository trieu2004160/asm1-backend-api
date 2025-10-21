const mongoose = require("mongoose");
require("dotenv").config();

async function checkUsers() {
  try {
    console.log("👥 Checking users in database...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = require("./src/models/User");
    const users = await User.find({});

    console.log(`👤 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ID: ${user._id}`);
    });

    await mongoose.disconnect();
    console.log("✅ Check completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUsers();

