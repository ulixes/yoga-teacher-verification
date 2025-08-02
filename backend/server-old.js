const express = require('express');
const { ReclaimProofRequest, verifyProof } = require('@reclaimprotocol/js-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: '*/*', limit: '50mb' }));

// Replace with your actual credentials
const APP_ID = process.env.RECLAIM_APP_ID || 'YOUR_APPLICATION_ID';
const APP_SECRET = process.env.RECLAIM_APP_SECRET || 'YOUR_APPLICATION_SECRET';
const PROVIDER_ID = process.env.RECLAIM_PROVIDER_ID || 'YOUR_INSTAGRAM_PROVIDER_ID';

// For local development with ngrok or production
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Store verified yoga teachers (in production, use a database)
const verifiedTeachers = new Map();

// Route to generate SDK configuration for Instagram verification
app.get('/api/generate-config', async (req, res) => {
  try {
    // Check if credentials are properly set
    if (APP_ID === 'YOUR_APPLICATION_ID' || APP_SECRET === 'YOUR_APPLICATION_SECRET' || PROVIDER_ID === 'YOUR_INSTAGRAM_PROVIDER_ID') {
      return res.status(500).json({ 
        error: 'Please set your Reclaim Protocol credentials in the .env file',
        details: 'Update RECLAIM_APP_ID, RECLAIM_APP_SECRET, and RECLAIM_PROVIDER_ID in backend/.env'
      });
    }

    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
    
    // Set callback URL for proof submission
    reclaimProofRequest.setAppCallbackUrl(`${BASE_URL}/api/receive-proofs`);
    
    const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();

    return res.json({ reclaimProofRequestConfig });
  } catch (error) {
    console.error('Error generating request config:', error);
    return res.status(500).json({ 
      error: 'Failed to generate request config',
      details: error.message 
    });
  }
});

// Route to receive and verify proofs
app.post('/api/receive-proofs', async (req, res) => {
  try {
    // Decode the urlencoded proof object
    const decodedBody = decodeURIComponent(req.body);
    const proof = JSON.parse(decodedBody);

    // Verify the proof using the SDK
    const isValid = await verifyProof(proof);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid proof' });
    }

    // Extract Instagram username from the proof
    const claimData = proof.claimData;
    const extractedData = JSON.parse(claimData.context.extractedParameters);
    const instagramUsername = extractedData.username || extractedData.handle;

    // Store verified teacher information
    verifiedTeachers.set(instagramUsername, {
      username: instagramUsername,
      verifiedAt: new Date(),
      proofId: proof.identifier,
      // You can add more fields from the proof as needed
    });

    console.log(`Yoga teacher verified: @${instagramUsername}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Instagram account verified successfully',
      username: instagramUsername 
    });
  } catch (error) {
    console.error('Error processing proof:', error);
    return res.status(500).json({ error: 'Failed to process proof' });
  }
});

// Route to check if a teacher is verified
app.get('/api/check-verification/:username', (req, res) => {
  const { username } = req.params;
  const teacher = verifiedTeachers.get(username);
  
  if (teacher) {
    return res.json({ 
      verified: true, 
      data: teacher 
    });
  }
  
  return res.json({ 
    verified: false 
  });
});

// Route to get all verified teachers
app.get('/api/verified-teachers', (req, res) => {
  const teachers = Array.from(verifiedTeachers.values());
  return res.json({ teachers });
});

app.listen(port, () => {
  console.log(`Yoga Teacher Verification Backend running at http://localhost:${port}`);
});