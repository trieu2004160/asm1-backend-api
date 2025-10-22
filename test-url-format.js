require('dotenv').config();

function testURLFormat() {
  console.log('🧪 Testing URL Format...\n');
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const orderId = '68f880894694f9ffa141ac7c';
  const amount = 495000;
  
  // Test the URL format that should be generated
  const correctUrl = `${frontendUrl}/mock-payment/${orderId}?amount=${amount}`;
  const incorrectUrl = `${frontendUrl}/mock-payment/${orderId}?amount=${amount}&mock=true`;
  
  console.log('📋 URL Format Test:');
  console.log('- Frontend URL:', frontendUrl);
  console.log('- Order ID:', orderId);
  console.log('- Amount:', amount);
  
  console.log('\n🔍 URL Comparison:');
  console.log('- Correct URL (should be generated):', correctUrl);
  console.log('- Incorrect URL (with &mock=true):', incorrectUrl);
  
  console.log('\n✅ Expected behavior:');
  console.log('- MockPayOS should generate:', correctUrl);
  console.log('- Fallback should NOT add &mock=true anymore');
  
  console.log('\n🎯 Test Result:');
  console.log('- If you see the correct URL, MockPayOS is working!');
  console.log('- If you see &mock=true, there\'s still an issue with the fallback');
}

testURLFormat();
