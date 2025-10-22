require('dotenv').config();
const axios = require('axios');

async function testOrderCreationDebug() {
  console.log('🧪 Testing Order Creation with Debug Logging...\n');
  
  const baseUrl = 'http://localhost:4000';
  
  try {
    // Test data
    const testOrder = {
      products: [
        {
          product: '507f1f77bcf86cd799439011', // Valid product ID
          quantity: 2
        }
      ],
      shippingInfo: {
        fullName: 'Nguyễn Văn Test',
        phone: '0123456789',
        address: '123 Test Street',
        city: 'Hồ Chí Minh',
        postalCode: '700000'
      },
      paymentMethod: 'payos'
    };
    
    console.log('📋 Test Order Data:');
    console.log('- Products:', testOrder.products);
    console.log('- Payment Method:', testOrder.paymentMethod);
    console.log('- Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
    
    // Create order
    console.log('\n🔄 Creating order...');
    const response = await axios.post(`${baseUrl}/api/orders`, testOrder, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MzUxNzY4MDAsImV4cCI6MTczNTE4MDQwMH0.test'
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('📦 Order ID:', response.data._id);
    console.log('🔗 Payment URL:', response.data.paymentUrl);
    console.log('💰 Total Amount:', response.data.totalAmount);
    
    // Check if URL has &mock=true
    const hasMockTrue = response.data.paymentUrl && response.data.paymentUrl.includes('&mock=true');
    const hasCorrectFormat = response.data.paymentUrl && response.data.paymentUrl.includes('/mock-payment/');
    
    console.log('\n🔍 Payment URL Analysis:');
    console.log('- Has &mock=true:', hasMockTrue);
    console.log('- Has correct format:', hasCorrectFormat);
    console.log('- Full URL:', response.data.paymentUrl);
    
    if (hasMockTrue) {
      console.log('\n❌ ERROR: URL still contains &mock=true - MockPayOS failed and fallback was used');
    } else if (hasCorrectFormat) {
      console.log('\n✅ SUCCESS: URL format is correct - MockPayOS worked!');
    } else {
      console.log('\n⚠️ WARNING: URL format is unexpected');
    }
    
  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOrderCreationDebug().catch(console.error);
