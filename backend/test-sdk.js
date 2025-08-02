const { ReclaimProofRequest } = require('@reclaimprotocol/js-sdk');
require('dotenv').config();

const APP_ID = process.env.RECLAIM_APP_ID;
const APP_SECRET = process.env.RECLAIM_APP_SECRET;
const PROVIDER_ID = process.env.RECLAIM_PROVIDER_ID;

async function testSDK() {
  try {
    console.log('Testing Reclaim SDK...');
    console.log('APP_ID:', APP_ID?.substring(0, 10) + '...');
    console.log('PROVIDER_ID:', PROVIDER_ID?.substring(0, 10) + '...');
    
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
    console.log('SDK initialized successfully');
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(reclaimProofRequest)));
    
    // Try to set callback URL
    reclaimProofRequest.setAppCallbackUrl('http://localhost:3001/api/receive-proofs');
    console.log('Callback URL set successfully');
    
    const config = reclaimProofRequest.toJsonString();
    console.log('Config generated successfully');
    console.log('Config length:', config.length);
    
  } catch (error) {
    console.error('SDK test failed:', error);
  }
}

testSDK();