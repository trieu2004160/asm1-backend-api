const mongoose = require("mongoose");

let isConnected = false;

async function initDb() {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("❌ MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri, {
      ssl: true, // quan trọng khi connect từ Render/Vercel
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
}

async function closeDb() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log("🔌 MongoDB connection closed");
  }
}

module.exports = { initDb, closeDb, mongoose };
