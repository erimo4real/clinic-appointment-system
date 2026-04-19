const https = require('https');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackRequest = (method, endpoint, data = null) => {
  return new Promise((resolve, reject) => {
    if (!PAYSTACK_SECRET) {
      resolve({ status: true, data: { reference: 'mock_' + Date.now() } });
      return;
    }

    const options = {
      hostname: PAYSTACK_BASE_URL,
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const initializePayment = async (email, amount, appointmentId) => {
  try {
    const response = await paystackRequest('POST', '/transaction/initialize', {
      email,
      amount: amount * 100, // Convert to kobo
      reference: `APT_${appointmentId}_${Date.now()}`,
      metadata: {
        appointmentId,
      },
    });
    return response;
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const verifyPayment = async (reference) => {
  try {
    const response = await paystackRequest('GET', `/transaction/verify/${reference}`);
    return response;
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const chargeAuthorization = async (email, amount, authorizationCode) => {
  try {
    const response = await paystackRequest('POST', '/transaction/charge_authorization', {
      email,
      amount: amount * 100,
      authorization_code: authorizationCode,
    });
    return response;
  } catch (error) {
    return { status: false, message: error.message };
  }
};

module.exports = { initializePayment, verifyPayment, chargeAuthorization };
