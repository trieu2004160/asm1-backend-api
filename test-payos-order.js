require('dotenv').config();
const PayOS = require('./lib/payos');

async function testPayOSOrder() {
  console.log('🧪 Testing PayOS Order Creation...\n');
  
  try {
    const payos = new PayOS();
    
    // Test data - following PayOS API v2 format
    const testOrderData = {
      orderCode: Math.floor(Date.now() / 1000), // Use timestamp as order code
      amount: 100000, // 100,000 VND
      description: 'Test order - Thread Cart',
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 100000,
        }
      ],
      returnUrl: 'http://localhost:5173/orders/test?payment=success',
      cancelUrl: 'http://localhost:5173/orders/test?payment=cancelled',
      expiredAt: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    };
    
    console.log('📋 Test Order Data:');
    console.log('- Order Code:', testOrderData.orderCode);
    console.log('- Amount:', testOrderData.amount);
    console.log('- Description:', testOrderData.description);
    console.log('- Items:', testOrderData.items.length);
    
    console.log('\n🔄 Creating payment link...');
    
    const result = await payos.createPaymentLink(testOrderData);
    
    console.log('\n✅ Payment link created successfully!');
    console.log('🔗 Checkout URL:', result.checkoutUrl);
    console.log('📦 Order Code:', result.orderCode);
    
    console.log('\n📝 Next steps:');
    console.log('1. Copy the checkout URL and test in browser');
    console.log('2. Use test card: 9704 0000 0000 0018');
    console.log('3. CVV: 123, Expiry: any future date');
    
  } catch (error) {
    console.error('\n❌ PayOS Order Creation Failed:');
    console.error('Error:', error.message);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check your PayOS credentials in .env file');
    console.log('2. Verify PayOS account is active');
    console.log('3. Check network connectivity');
    console.log('4. Ensure PayOS API endpoint is accessible');
  }
}

testPayOSOrder().catch(console.error);
