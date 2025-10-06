const axios = require("axios");

async function testAuth() {
  const BASE_URL = "http://localhost:4000/api";

  console.log("🧪 Testing Authentication...\n");

  try {
    // Test 1: Register
    console.log("1️⃣ Testing registration...");
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: "123456",
    };

    const registerResponse = await axios.post(
      `${BASE_URL}/auth/register`,
      registerData
    );
    console.log("✅ Registration successful:", registerResponse.data);

    // Test 2: Login with same credentials
    console.log("\n2️⃣ Testing login...");
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      registerData
    );
    console.log("✅ Login successful:", loginResponse.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Network error:", error.message);
    }
  }
}

testAuth();
