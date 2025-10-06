const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

async function testSimple() {
  console.log("🧪 Testing simple API calls...\n");

  try {
    // Test 1: Get all products
    console.log("1️⃣ Getting all products...");
    const getResponse = await axios.get(`${BASE_URL}/products`);
    console.log("✅ Products found:", getResponse.data.length);

    if (getResponse.data.length > 0) {
      const firstProduct = getResponse.data[0];
      const productId = firstProduct._id;
      console.log("📝 First product ID:", productId);
      console.log("📝 First product name:", firstProduct.name);

      // Test 2: Update the first product
      console.log("\n2️⃣ Updating first product...");
      const updateData = {
        name: firstProduct.name + " - UPDATED",
        description: firstProduct.description + " - UPDATED",
        price: firstProduct.price + 100,
        image: firstProduct.image,
      };

      console.log("🔄 Update data:", updateData);
      const updateResponse = await axios.put(
        `${BASE_URL}/products/${productId}`,
        updateData
      );
      console.log("✅ Update successful:", updateResponse.data.name);

      // Test 3: Get the updated product
      console.log("\n3️⃣ Getting updated product...");
      const getUpdatedResponse = await axios.get(
        `${BASE_URL}/products/${productId}`
      );
      console.log("✅ Updated product:", getUpdatedResponse.data.name);

      // Test 4: Delete the product
      console.log("\n4️⃣ Deleting product...");
      const deleteResponse = await axios.delete(
        `${BASE_URL}/products/${productId}`
      );
      console.log("✅ Delete successful, status:", deleteResponse.status);

      // Test 5: Verify deletion
      console.log("\n5️⃣ Verifying deletion...");
      const getAfterDeleteResponse = await axios.get(`${BASE_URL}/products`);
      console.log(
        "✅ Products after deletion:",
        getAfterDeleteResponse.data.length
      );
    } else {
      console.log("❌ No products found to test with");
    }
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testSimple();

