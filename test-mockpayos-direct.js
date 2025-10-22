require('dotenv').config();
const MockPayOS = require('./lib/mock-payos');

async function testMockPayOSDirect() {
  console.log('🧪 Testing MockPayOS Direct...\n');
  
  try {
    const mockPayOS = new MockPayOS();
    
    // Test with the exact data that would be passed from routes
    const testData = {
      orderCode: '68f880894694f9ffa141ac7c',
      amount: 495000,
      description: 'Đơn hàng #141ac7c - 1 sản phẩm',
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 495000,
        }
      ],
      returnUrl: 'http://localhost:5173/payment/68f880894694f9ffa141ac7c?payment=success',
      cancelUrl: 'http://localhost:5173/payment/68f880894694f9ffa141ac7c?payment=cancelled',
    };
    
    console.log('📋 Test Data:');
    console.log('- Order Code:', testData.orderCode);
    console.log('- Amount:', testData.amount);
    console.log('- Description:', testData.description);
    console.log('- Items:', testData.items);
    console.log('- Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
    
    console.log('\n🔄 Calling MockPayOS.createPaymentLink...');
    
    const result = await mockPayOS.createPaymentLink(testData);
    
    console.log('\n✅ Result:');
    console.log('- Success:', result.success);
    console.log('- Checkout URL:', result.checkoutUrl);
    console.log('- Order Code:', result.orderCode);
    
    // Check if URL is correct
    const expectedUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mock-payment/68f880894694f9ffa141ac7c?amount=495000`;
    console.log('\n🔍 URL Check:');
    console.log('- Expected:', expectedUrl);
    console.log('- Actual:', result.checkoutUrl);
    console.log('- Match:', result.checkoutUrl === expectedUrl);
    
    if (result.checkoutUrl === expectedUrl) {
      console.log('\n✅ SUCCESS: MockPayOS is working correctly!');
      console.log('🎯 The issue is likely in the routes logic, not MockPayOS itself');
    } else {
      console.log('\n❌ ERROR: MockPayOS URL format is incorrect!');
    }
    
  } catch (error) {
    console.error('\n❌ MockPayOS Test Failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMockPayOSDirect().catch(console.error);
