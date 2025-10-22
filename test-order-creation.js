require('dotenv').config();
const MockPayOS = require('./lib/mock-payos');

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation Flow...\n');
  
  try {
    const mockPayOS = new MockPayOS();
    
    const testOrderData = {
      orderCode: '68f87ed1d5de57d16cb3d9b7', // Use real order ID
      amount: 495000,
      description: 'Test order creation',
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 495000,
        }
      ],
      returnUrl: 'http://localhost:5173/payment/68f87ed1d5de57d16cb3d9b7?payment=success',
      cancelUrl: 'http://localhost:5173/payment/68f87ed1d5de57d16cb3d9b7?payment=cancelled',
    };
    
    console.log('📋 Test Order Data:');
    console.log('- Order Code:', testOrderData.orderCode);
    console.log('- Amount:', testOrderData.amount);
    console.log('- Description:', testOrderData.description);
    console.log('- Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
    
    console.log('\n🔄 Creating payment link with MockPayOS...');
    
    const result = await mockPayOS.createPaymentLink(testOrderData);
    
    console.log('\n✅ Payment link created successfully!');
    console.log('🔗 Checkout URL:', result.checkoutUrl);
    console.log('📦 Order Code:', result.orderCode);
    
    // Verify URL format
    const expectedUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mock-payment/${testOrderData.orderCode}?amount=${testOrderData.amount}`;
    console.log('\n🔍 Expected URL:', expectedUrl);
    console.log('🔍 Actual URL:', result.checkoutUrl);
    console.log('✅ URLs match:', result.checkoutUrl === expectedUrl);
    
  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error('Error:', error.message);
  }
}

testOrderCreation().catch(console.error);
