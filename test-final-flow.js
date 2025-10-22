require('dotenv').config();

function testFinalFlow() {
  console.log('🧪 Testing Final Payment Flow...\n');
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
  const orderId = '68f883d887e668dcc0ed2789';
  const amount = 495000;
  
  console.log('📋 Final Flow Test:');
  console.log('- Frontend URL:', frontendUrl);
  console.log('- Order ID:', orderId);
  console.log('- Amount:', amount);
  
  console.log('\n🔍 Expected URL:');
  const expectedUrl = `${frontendUrl}/mock-payment/${orderId}?amount=${amount}`;
  console.log('- URL:', expectedUrl);
  
  console.log('\n✅ What should happen:');
  console.log('1. User creates order with PayOS payment method');
  console.log('2. Server creates order and generates payment URL');
  console.log('3. Payment URL should be:', expectedUrl);
  console.log('4. User clicks "Thanh toán ngay" button');
  console.log('5. Browser redirects to MockPayment page');
  console.log('6. User can test payment success/failure');
  
  console.log('\n🎯 Test Result:');
  console.log('- If you see this URL when creating an order, it should work!');
  console.log('- The URL will redirect to MockPayment page in your frontend');
  console.log('- Frontend is running on port 8081, so this should work correctly');
  
  console.log('\n🚀 Ready to test!');
  console.log('- Create a new order with PayOS payment method');
  console.log('- Check if the payment URL matches the expected format');
  console.log('- Click "Thanh toán ngay" to test the flow');
}

testFinalFlow();
