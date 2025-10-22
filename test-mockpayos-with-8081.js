require('dotenv').config();
const MockPayOS = require('./lib/mock-payos');

async function testMockPayOSWith8081() {
  console.log('🧪 Testing MockPayOS with Port 8081...\n');
  
  try {
    const mockPayOS = new MockPayOS();
    
    // Override frontend URL to use port 8081
    process.env.FRONTEND_URL = 'http://localhost:8081';
    
    const testData = {
      orderCode: '68f883d887e668dcc0ed2789',
      amount: 495000,
      description: 'Test order with port 8081',
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 495000,
        }
      ],
      returnUrl: 'http://localhost:8081/payment/68f883d887e668dcc0ed2789?payment=success',
      cancelUrl: 'http://localhost:8081/payment/68f883d887e668dcc0ed2789?payment=cancelled',
    };
    
    console.log('📋 Test Data:');
    console.log('- Order Code:', testData.orderCode);
    console.log('- Amount:', testData.amount);
    console.log('- Frontend URL:', process.env.FRONTEND_URL);
    
    console.log('\n🔄 Calling MockPayOS.createPaymentLink...');
    
    const result = await mockPayOS.createPaymentLink(testData);
    
    console.log('\n✅ Result:');
    console.log('- Success:', result.success);
    console.log('- Checkout URL:', result.checkoutUrl);
    console.log('- Order Code:', result.orderCode);
    
    // Check if URL is correct
    const expectedUrl = `${process.env.FRONTEND_URL}/mock-payment/68f883d887e668dcc0ed2789?amount=495000`;
    console.log('\n🔍 URL Check:');
    console.log('- Expected:', expectedUrl);
    console.log('- Actual:', result.checkoutUrl);
    console.log('- Match:', result.checkoutUrl === expectedUrl);
    
    if (result.checkoutUrl === expectedUrl) {
      console.log('\n✅ SUCCESS: MockPayOS is working correctly with port 8081!');
      console.log('🎯 This URL should work with your frontend running on port 8081');
    } else {
      console.log('\n❌ ERROR: MockPayOS URL format is incorrect!');
    }
    
  } catch (error) {
    console.error('\n❌ MockPayOS Test Failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMockPayOSWith8081().catch(console.error);
