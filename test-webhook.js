require('dotenv').config();
const axios = require('axios');

async function testWebhook() {
  console.log('🧪 Testing PayOS Webhook...\n');
  
  const webhookUrl = `${process.env.FRONTEND_URL || 'http://localhost:4000'}/api/orders/payos/webhook`;
  console.log('🔗 Webhook URL:', webhookUrl);
  
  // Test webhook data
  const testWebhookData = {
    orderCode: '123456789',
    status: 'PAID',
    amount: 100000,
    description: 'Test payment',
    checksum: 'test-checksum'
  };
  
  try {
    console.log('📤 Sending webhook data:', JSON.stringify(testWebhookData, null, 2));
    
    const response = await axios.post(webhookUrl, testWebhookData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('✅ Webhook response:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ Webhook test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWebhook().catch(console.error);
