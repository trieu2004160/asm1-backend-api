require('dotenv').config();
const axios = require('axios');

async function testFullOrderFlow() {
  console.log('🧪 Testing Full Order Creation Flow...\n');
  
  const baseUrl = 'http://localhost:3001';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
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
    console.log('- Frontend URL:', frontendUrl);
    
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
    
    // Verify payment URL format
    const expectedUrlPattern = `${frontendUrl}/mock-payment/`;
    const isCorrectUrl = response.data.paymentUrl && response.data.paymentUrl.includes(expectedUrlPattern);
    
    console.log('\n🔍 Payment URL Analysis:');
    console.log('- Expected pattern:', expectedUrlPattern);
    console.log('- Actual URL:', response.data.paymentUrl);
    console.log('- URL format correct:', isCorrectUrl);
    
    if (isCorrectUrl) {
      console.log('\n✅ SUCCESS: Payment URL is correctly formatted!');
      console.log('🎯 User can now click "Thanh toán ngay" to go to mock payment page');
    } else {
      console.log('\n❌ ERROR: Payment URL format is incorrect!');
      console.log('🔧 Check server logs for more details');
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

testFullOrderFlow().catch(console.error);
