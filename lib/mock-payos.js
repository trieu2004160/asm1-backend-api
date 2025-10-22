const crypto = require('crypto');

class MockPayOS {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID || 'mock-client-id';
    this.apiKey = process.env.PAYOS_API_KEY || 'mock-api-key';
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY || 'mock-checksum-key';
    this.baseUrl = 'https://mock-payos.vn';
  }

  /**
   * Tạo payment link giả lập cho testing
   */
  async createPaymentLink(orderData) {
    try {
      console.log('🎭 Mock PayOS: Creating payment link for testing');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock payment URL that redirects to our mock payment page
      const mockOrderCode = orderData.orderCode || Math.floor(Date.now() / 1000);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const mockPaymentUrl = `${frontendUrl}/mock-payment/${mockOrderCode}?amount=${orderData.amount}`;
      
      console.log('✅ Mock PayOS: Payment link created:', mockPaymentUrl);
      
      return {
        success: true,
        checkoutUrl: mockPaymentUrl,
        orderCode: mockOrderCode,
      };
    } catch (error) {
      console.error('❌ Mock PayOS error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook (always return true for testing)
   */
  verifyWebhook(webhookData) {
    console.log('🎭 Mock PayOS: Verifying webhook (always valid for testing)');
    return true;
  }

  /**
   * Get payment request info (mock)
   */
  async getPaymentRequestInfo(orderCode) {
    console.log('🎭 Mock PayOS: Getting payment info for order:', orderCode);
    
    return {
      data: {
        orderCode: orderCode,
        status: 'PENDING',
        amount: 100000,
        description: 'Mock payment for testing'
      }
    };
  }

  /**
   * Cancel payment request (mock)
   */
  async cancelPaymentRequest(orderCode) {
    console.log('🎭 Mock PayOS: Cancelling payment for order:', orderCode);
    
    return {
      success: true,
      message: 'Payment cancelled successfully'
    };
  }
}

module.exports = MockPayOS;
