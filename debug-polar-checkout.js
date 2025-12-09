// Debug the Polar checkout by making a direct API call
const testPolarCheckoutAPI = async () => {
  const baseUrl = 'https://bb1b406b7074.ngrok-free.app';
  
  const testData = {
    customerEmail: 'nurilacka@gmail.com',
    customerName: 'Test Customer',
    amount: 110000,
    currency: 'MKD',
    metadata: {
      orderId: 'test-order-123',
      paymentId: 'test-payment-456',
      cartSummary: JSON.stringify({
        itemCount: 2,
        totalAmount: 110000,
        currency: 'MKD'
      }),
      productIds: JSON.stringify(['550e8400-e29b-41d4-a716-446655440001']),
      variantIds: JSON.stringify(['550e8400-e29b-41d4-a716-446655440002']),
      customerInfo: JSON.stringify({
        email: 'nurilacka@gmail.com',
        name: 'Test Customer',
        phone: '+38970123456'
      }),
      environment: 'sandbox',
      createdAt: new Date().toISOString()
    }
  };
  
  // Build URL with query parameters
  const params = new URLSearchParams();
  params.append('customerEmail', testData.customerEmail);
  params.append('customerName', testData.customerName);
  params.append('amount', testData.amount.toString());
  params.append('currency', testData.currency);
  params.append('metadata', JSON.stringify(testData.metadata));
  
  const url = `${baseUrl}/api/polar/checkout?${params.toString()}`;
  
  console.log('🧪 Testing Polar checkout API...');
  console.log('URL:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log('🔗 Redirect to:', location);
    } else {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        console.log('JSON Response:', JSON.stringify(json, null, 2));
      } else {
        const text = await response.text();
        console.log('Text Response (first 1000 chars):', text.substring(0, 1000));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testPolarCheckoutAPI();