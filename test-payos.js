require('dotenv').config();
const PayOS = require('./lib/payos');

async function testPayOS() {
  console.log('🧪 Testing PayOS Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('PAYOS_CLIENT_ID:', process.env.PAYOS_CLIENT_ID ? '✅ Set' : '❌ Missing');
  console.log('PAYOS_API_KEY:', process.env.PAYOS_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('PAYOS_CHECKSUM_KEY:', process.env.PAYOS_CHECKSUM_KEY ? '✅ Set' : '❌ Missing');
  console.log('PAYOS_BASE_URL:', process.env.PAYOS_BASE_URL || 'https://api-merchant.payos.vn');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
  
  if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    console.log('\n❌ PayOS configuration is incomplete!');
    console.log('Please check your .env file and ensure all PayOS credentials are set.');
    return;
  }
  
  console.log('\n✅ All PayOS environment variables are set!');
  
  // Test PayOS instance creation
  try {
    const payos = new PayOS();
    console.log('✅ PayOS instance created successfully');
    
    // Test checksum generation
    const testData = {
      orderCode: 123456,
      amount: 100000,
      description: 'Test order'
    };
    
    const checksum = payos.generateChecksum(testData);
    console.log('✅ Checksum generation works:', checksum.substring(0, 20) + '...');
    
    console.log('\n🎉 PayOS configuration test passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your PayOS credentials are correct');
    console.log('2. Test with a real payment request');
    console.log('3. Configure webhook URL in PayOS dashboard');
    
  } catch (error) {
    console.log('\n❌ PayOS test failed:', error.message);
  }
}

testPayOS().catch(console.error);

