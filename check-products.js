const mongoose = require("mongoose");
require("dotenv").config();

async function checkProducts() {
  try {
    console.log("🔍 Checking products in database...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Product = require("./src/models/Product");
    const products = await Product.find({});

    console.log(`📦 Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - ID: ${product._id} - Price: ${
          product.price
        }`
      );
    });

    if (products.length === 0) {
      console.log("⚠️ No products found. Creating a test product...");

      const testProduct = new Product({
        name: "Test Product",
        description: "A test product for order testing",
        price: 100000,
        image: "https://via.placeholder.com/300x300",
        category: "test",
      });

      const savedProduct = await testProduct.save();
      console.log("✅ Test product created:", savedProduct._id);
    }

    await mongoose.disconnect();
    console.log("✅ Check completed");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkProducts();



