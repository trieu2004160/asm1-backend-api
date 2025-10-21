const axios = require("axios");

// Test order creation API
async function testOrderAPI() {
  try {
    console.log("🧪 Testing Order API...");

    // First, let's test if server is running
    try {
      const healthResponse = await axios.get(
        "http://localhost:4000/api/health"
      );
      console.log("✅ Server is running:", healthResponse.data);
    } catch (error) {
      console.error("❌ Server is not running or not accessible");
      console.error("Error:", error.message);
      return;
    }

    // Test authentication first
    console.log("🔐 Testing authentication...");
    const loginResponse = await axios.post(
      "http://localhost:4000/api/auth/login",
      {
        email: "newtest@example.com",
        password: "password123",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Authentication successful");

    // Test order creation
    console.log("📦 Testing order creation...");
    const orderData = {
      products: [
        {
          productId: "68e52b64f85783ec4efb964b", // Real product ID from database
          quantity: 2,
        },
      ],
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "0123456789",
        address: "123 Test Street",
        city: "Test City",
        postalCode: "10000",
      },
      paymentMethod: "cash_on_delivery",
    };

    console.log("📝 Order data:", orderData);

    const orderResponse = await axios.post(
      "http://localhost:4000/api/orders",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Order created successfully:", orderResponse.data);
  } catch (error) {
    console.error("❌ API test failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testOrderAPI();
