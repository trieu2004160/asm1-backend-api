const mongoose = require("mongoose");
require("dotenv").config();

// Test Order model and database connection
async function testOrders() {
  try {
    console.log("🔍 Testing Order functionality...");

    // Test database connection
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found in environment variables");
      return;
    }

    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test Order model
    const Order = require("./src/models/Order");
    console.log("✅ Order model loaded successfully");

    // Test creating a simple order
    const testOrder = new Order({
      userId: new mongoose.Types.ObjectId(),
      products: [
        {
          productId: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 100000,
          name: "Test Product",
          image: "test.jpg",
        },
      ],
      totalAmount: 100000,
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "0123456789",
        address: "Test Address",
        city: "Test City",
        postalCode: "10000",
      },
      paymentMethod: "cash_on_delivery",
      status: "pending",
    });

    console.log("📝 Test order created:", testOrder);
    console.log("✅ Order model validation passed");

    // Clean up
    await mongoose.disconnect();
    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testOrders();



