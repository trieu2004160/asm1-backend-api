require('dotenv').config();

function testNewURL() {
  console.log('🧪 Testing New URL Format...\n');
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
  const orderId = '68f883d887e668dcc0ed2789';
  const amount = 495000;
  
  // Test the URL format that should be generated now
  const correctUrl = `${frontendUrl}/mock-payment/${orderId}?amount=${amount}`;
  
  console.log('📋 New URL Format Test:');
  console.log('- Frontend URL:', frontendUrl);
  console.log('- Order ID:', orderId);
  console.log('- Amount:', amount);
  
  console.log('\n🔍 Expected URL:');
  console.log('- URL:', correctUrl);
  
  console.log('\n✅ Expected behavior:');
  console.log('- MockPayOS should generate:', correctUrl);
  console.log('- This URL should work with frontend running on port 8081');
  
  console.log('\n🎯 Test Result:');
  console.log('- If you see this URL when creating an order, it should work!');
  console.log('- The URL will redirect to MockPayment page in your frontend');
}

testNewURL();
