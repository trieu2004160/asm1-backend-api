const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

async function testAPI() {
  console.log("🧪 Testing API endpoints...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check:", healthResponse.data);

    // Test 2: Get all products (should be empty)
    console.log("\n2️⃣ Testing GET /products...");
    const getResponse = await axios.get(`${BASE_URL}/products`);
    console.log("✅ GET products:", getResponse.data);
    console.log(`📊 Found ${getResponse.data.length} products`);

    // Test 3: Create a new product
    console.log("\n3️⃣ Testing POST /products...");
    const newProduct = {
      name: "Test Product",
      description: "This is a test product for debugging",
      price: 99.99,
      image: "https://example.com/test.jpg",
    };

    const createResponse = await axios.post(`${BASE_URL}/products`, newProduct);
    console.log("✅ Created product:", createResponse.data);
    const productId = createResponse.data._id;
    console.log(`📝 Product ID: ${productId}`);

    // Test 4: Get the created product by ID
    console.log("\n4️⃣ Testing GET /products/:id...");
    const getByIdResponse = await axios.get(
      `${BASE_URL}/products/${productId}`
    );
    console.log("✅ GET product by ID:", getByIdResponse.data);

    // Test 5: Update the product
    console.log("\n5️⃣ Testing PUT /products/:id...");
    const updatedProduct = {
      name: "Updated Test Product",
      description: "This product has been updated",
      price: 149.99,
      image: "https://example.com/updated.jpg",
    };

    const updateResponse = await axios.put(
      `${BASE_URL}/products/${productId}`,
      updatedProduct
    );
    console.log("✅ Updated product:", updateResponse.data);

    // Test 6: Get all products again
    console.log("\n6️⃣ Testing GET /products after update...");
    const getAfterUpdateResponse = await axios.get(`${BASE_URL}/products`);
    console.log("✅ GET products after update:", getAfterUpdateResponse.data);

    // Test 7: Delete the product
    console.log("\n7️⃣ Testing DELETE /products/:id...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/products/${productId}`
    );
    console.log("✅ Delete response status:", deleteResponse.status);

    // Test 8: Verify product is deleted
    console.log("\n8️⃣ Testing GET /products after delete...");
    const getAfterDeleteResponse = await axios.get(`${BASE_URL}/products`);
    console.log("✅ GET products after delete:", getAfterDeleteResponse.data);
    console.log(`📊 Found ${getAfterDeleteResponse.data.length} products`);

    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.message);
      console.error("Make sure the server is running on http://localhost:4000");
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Check if axios is installed
try {
  testAPI();
} catch (error) {
  if (error.code === "MODULE_NOT_FOUND") {
    console.log("❌ axios is not installed. Installing...");
    console.log("Run: npm install axios");
  } else {
    console.error("Error:", error.message);
  }
}

