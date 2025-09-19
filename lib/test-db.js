require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

async function testMongoConnection() {
  try {
    console.log("🔗 Đang kết nối MongoDB Atlas...");

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Kết nối MongoDB Atlas thành công!");

    // Test query
    const db = mongoose.connection.db;
    const result = await db.admin().ping();
    console.log("🏓 Ping result:", result);

    // Get database info
    const dbStats = await db.stats();
    console.log("📊 Database name:", db.databaseName);
    console.log("📊 Collections count:", dbStats.collections);
  } catch (error) {
    console.error("❌ Kết nối thất bại:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối MongoDB");
  }
}

testMongoConnection();
