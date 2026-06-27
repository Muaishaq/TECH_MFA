const https = require('https');

// @desc    Initialize a payment with Paystack
const initiatePayment = (email, amount, reference, metadata) => {
  return new Promise((resolve, reject) => {
    const params = JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      metadata,
      callback_url: `${process.env.CLIENT_URL}/payment/success`
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log('Paystack response:', JSON.stringify(parsed));
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.write(params);
    req.end();
  });
};

// @desc    Verify a payment with Paystack
const verifyPayment = (reference) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(JSON.parse(data)); });
    });

    req.on('error', reject);
    req.end();
  });
};

module.exports = { initiatePayment, verifyPayment };