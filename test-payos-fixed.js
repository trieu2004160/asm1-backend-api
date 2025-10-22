require('dotenv').config();
const axios = require('axios');

class PayOS {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID;
    this.apiKey = process.env.PAYOS_API_KEY;
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    this.baseUrl = 'https://api-merchant.payos.vn'; // Use production URL
  }

  generateChecksum(data) {
    const crypto = require('crypto');
    const sortedData = this.sortObjectKeys(data);
    const dataString = JSON.stringify(sortedData);
    return crypto.createHmac('sha256', this.checksumKey).update(dataString).digest('hex');
  }

  sortObjectKeys(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sorted[key] = this.sortObjectKeys(obj[key]);
      } else {
        sorted[key] = obj[key];
      }
    });
    return sorted;
  }

  async createPaymentLink(orderData) {
    try {
      const paymentData = {
        orderCode: orderData.orderCode,
        amount: orderData.amount,
        description: orderData.description,
        items: orderData.items,
        returnUrl: orderData.returnUrl,
        cancelUrl: orderData.cancelUrl,
        expiredAt: orderData.expiredAt || Math.floor(Date.now() / 1000) + (30 * 60),
      };

      const checksum = this.generateChecksum(paymentData);
      paymentData.checksum = checksum;

      console.log('🔗 Creating PayOS payment link:', {
        orderCode: orderData.orderCode,
        amount: orderData.amount,
        compress: '...'
      });

      const response = await axios.post(`${this.baseUrl}/v2/payment-requests`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
        },
        timeout: 30000,
      });

      const result = response.data;
      console.log('✅ PayOS API response:', JSON.stringify(result, null, 2));

      if (result.data && result.data.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: result.data.checkoutUrl,
          orderCode: result.data.orderCode,
        };
      } else if (result.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: result.checkoutUrl,
          orderCode: result.orderCode,
        };
      } else {
        throw new Error('Invalid PayOS response structure: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('❌ Error creating PayOS payment link:', error.response?.data || error.message);
      throw new Error(`PayOS API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

async function testPayOSFixed() {
  console.log('🧪 Testing Fixed PayOS Integration...\n');
  
  try {
    const payos = new PayOS();
    
    const testOrderData = {
      orderCode: Math.floor(Date.now() / 1000),
      amount: 100000,
      description: 'Test order - Thread Cart',
      items: [
        {
          name: 'Test Product',
          quantity: 1,
          price: 100000,
        }
      ],
      returnUrl: 'http://localhost:5173/payment/test?payment=success',
      cancelUrl: 'http://localhost:5173/payment/test?payment=cancelled',
    };
    
    console.log('📋 Test Order Data:');
    console.log('- Order Code:', testOrderData.orderCode);
    console.log('- Amount:', testOrderData.amount);
    console.log('- Description:', testOrderData.description);
    
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
    console.error('\n❌ PayOS Test Failed:');
    console.error('Error:', error.message);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check your PayOS credentials');
    console.log('2. Verify PayOS account is active');
    console.log('3. Check network connectivity');
    console.log('4. Try using production URL instead of sandbox');
  }
}

testPayOSFixed().catch(console.error);
