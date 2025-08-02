# Instagram Ownership Verification using Reclaim Protocol

## Overview

This document explains how Instagram account ownership verification is implemented in the Yoga Teacher Verification app using Reclaim Protocol. The system allows yoga teachers to prove they own specific Instagram accounts without sharing credentials or personal data.

## What is Reclaim Protocol?

Reclaim Protocol is a zero-knowledge proof system that enables users to prove ownership of web accounts and data without revealing sensitive information. It generates cryptographic proofs that verify specific claims about user data while maintaining privacy.

### Key Benefits:
- **Privacy-Preserving**: No passwords or personal data shared
- **Secure**: Cryptographic proofs prevent forgery
- **User-Controlled**: Users maintain full control of their data
- **Verifiable**: Third parties can verify claims independently

## How Instagram Verification Works

### High-Level Process

```
User Request → QR Code → Mobile Verification → Cryptographic Proof → Backend Validation
```

1. **User initiates verification** on the web app
2. **Backend generates** a Reclaim proof request
3. **QR code displays** for mobile scanning
4. **User scans QR code** with their phone
5. **Mobile app authenticates** with Instagram
6. **Reclaim generates proof** of account ownership
7. **Proof sent to backend** for validation
8. **Verification status** updated in the app

## Technical Implementation

### 1. Proof Request Generation (Backend)

```javascript
// server.js - Generate configuration endpoint
app.get('/api/generate-config', async (req, res) => {
  // Initialize Reclaim with credentials
  const reclaimProofRequest = await ReclaimProofRequest.init(
    APP_ID,           // Your Reclaim application ID
    APP_SECRET,       // Your Reclaim application secret
    PROVIDER_ID       // Instagram provider ID
  );
  
  // Set callback URL for proof submission
  reclaimProofRequest.setAppCallbackUrl(`${BASE_URL}/api/receive-proofs`);
  
  // Return configuration for frontend
  const config = reclaimProofRequest.toJsonString();
  return res.json({ reclaimProofRequestConfig: config });
});
```

### 2. QR Code Generation (Frontend)

```typescript
// InstagramVerification.tsx - Generate QR code
const handleVerification = async () => {
  // Fetch configuration from backend
  const response = await fetch(`${BASE_URL}/api/generate-config`);
  const { reclaimProofRequestConfig } = await response.json();

  // Initialize Reclaim SDK
  const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(
    reclaimProofRequestConfig
  );

  // Generate QR code URL
  const requestUrl = await reclaimProofRequest.getRequestUrl();
  setRequestUrl(requestUrl); // Display QR code
  
  // Start listening for proof submission
  await reclaimProofRequest.startSession({
    onSuccess: (proofs) => handleVerificationSuccess(proofs),
    onError: (error) => handleVerificationError(error)
  });
};
```

### 3. Proof Validation (Backend)

```javascript
// server.js - Receive and validate proofs
app.post('/api/receive-proofs', async (req, res) => {
  try {
    // Decode the proof from request body
    const decodedBody = decodeURIComponent(req.body);
    const proof = JSON.parse(decodedBody);

    // Verify the proof using Reclaim SDK
    const isValid = await verifyProof(proof);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid proof' });
    }

    // Extract verified data from proof
    const verifiedData = extractVerificationData(proof);
    
    // Store verification result
    storeVerifiedTeacher(verifiedData);
    
    return res.json({ 
      success: true, 
      message: 'Instagram account verified successfully' 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process proof' });
  }
});
```

## Proof Structure and Data

### What Gets Verified

The Reclaim Protocol proof contains:

1. **Account Ownership**: Cryptographic proof that the user controls the Instagram account
2. **Username/Handle**: The verified Instagram username
3. **Timestamp**: When the verification occurred
4. **Provider Information**: Confirmation it's from Instagram
5. **Digital Signature**: Ensures proof integrity

### Proof Format

```json
{
  "identifier": "reclaim-proof-id",
  "claimData": {
    "provider": "instagram-provider-id",
    "parameters": {
      "username": "verified_username"
    },
    "context": {
      "extractedParameters": "{\"username\":\"yoga_teacher_123\"}",
      "providerHash": "provider-specific-hash"
    }
  },
  "signatures": ["cryptographic-signature"],
  "witnesses": [
    {
      "id": "witness-id",
      "url": "witness-endpoint"
    }
  ]
}
```

## User Experience Flow

### Step-by-Step User Journey

1. **Visit App**: User goes to http://165.232.147.118
2. **Click Verify**: Clicks "Verify Instagram Account" button
3. **QR Code Appears**: App displays QR code for mobile scanning
4. **Scan QR Code**: User scans QR code with their phone
5. **Redirect to Instagram**: Mobile browser opens Instagram authentication
6. **Login to Instagram**: User logs into their Instagram account
7. **Grant Permission**: User authorizes Reclaim to verify ownership
8. **Proof Generation**: Reclaim generates cryptographic proof
9. **Automatic Submission**: Proof automatically sent to our backend
10. **Verification Complete**: User sees success message with verified username

### Mobile Experience

```
Phone Camera → QR Code → Browser → Instagram Login → Reclaim App → Proof Generation → Success
```

- **Seamless**: No app download required
- **Secure**: Uses Instagram's official authentication
- **Private**: No credentials stored or transmitted
- **Fast**: Typically completes in 30-60 seconds

## Security Model

### Privacy Protection

1. **No Password Sharing**: Users never share Instagram passwords
2. **No Data Storage**: Personal Instagram data not stored in our system
3. **Zero-Knowledge**: Only ownership claim is verified, not account content
4. **User Consent**: Explicit consent required for each verification

### Cryptographic Security

1. **Digital Signatures**: All proofs cryptographically signed
2. **Witness Network**: Multiple independent witnesses validate proofs
3. **Tamper-Proof**: Any modification invalidates the proof
4. **Time-Bound**: Proofs include timestamps to prevent replay attacks

### Trust Model

```
User ← Trusts → Reclaim Protocol ← Trusts → Instagram API
  ↓                                           ↓
Generates Proof                          Validates Ownership
  ↓                                           ↓
Our Backend ← Validates → Reclaim Witnesses
```

## Configuration Details

### Reclaim Protocol Credentials

```bash
# Required environment variables
RECLAIM_APP_ID=0x8045C6B32950453C08420f321ACea677A84b62B9
RECLAIM_APP_SECRET=0x0fb80437bc8ce16086a07e4b1fc5606acc450394456ad7ae69b64b6c0096b8cb
RECLAIM_PROVIDER_ID=3ad6946f-88f4-4958-9a8e-5271a831b5b8
```

### Provider Configuration

- **Provider**: Instagram
- **Type**: Social Media Account Verification
- **Data Extracted**: Username/Handle
- **Authentication Method**: OAuth-like flow through Instagram

## Error Handling

### Common Failure Scenarios

1. **User Cancels Verification**
   - User closes mobile browser during flow
   - Handled gracefully with retry option

2. **Network Issues**
   - Poor mobile connectivity
   - Automatic retry with timeout handling

3. **Instagram Authentication Fails**
   - Wrong credentials or account issues
   - Clear error message directing user to try again

4. **Proof Validation Fails**
   - Cryptographic verification fails
   - Logged for debugging, user sees generic error

### Error Response Examples

```javascript
// Frontend error handling
reclaimProofRequest.startSession({
  onError: (error) => {
    console.error('Verification failed:', error);
    setError('Verification failed. Please try again.');
    setIsLoading(false);
  }
});

// Backend error responses
{
  "error": "Invalid proof",
  "details": "Cryptographic signature verification failed"
}
```

## Integration Benefits

### For Users
- **Simple Process**: Just scan QR code and authenticate
- **Privacy Preserved**: No sensitive data shared
- **Quick Verification**: Complete process in under a minute
- **Secure**: Industry-standard cryptographic protection

### For Application
- **Trust**: Cryptographically verified Instagram ownership
- **Scalable**: No rate limits from Instagram API
- **Compliant**: Privacy-preserving verification method
- **Reliable**: Distributed witness network ensures availability

### For Yoga Community
- **Authentic Profiles**: Verified Instagram accounts prevent impersonation
- **Community Trust**: Teachers can prove their social media presence
- **Platform Independence**: Works regardless of Instagram policy changes
- **Professional Credibility**: Adds verification layer to teacher profiles

## Verification Data Storage

### Current Implementation (In-Memory)

```javascript
// Simple in-memory storage for demo
const verifiedTeachers = new Map();

// Store verification
verifiedTeachers.set(username, {
  username: extractedUsername,
  verifiedAt: new Date(),
  proofId: proof.identifier
});
```

### Production Recommendations

```javascript
// Database storage for production
const verification = {
  id: generateUUID(),
  username: extractedUsername,
  instagramUserId: extractedUserId,
  verifiedAt: new Date(),
  proofHash: hashProof(proof),
  status: 'verified',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
};

await db.verifications.create(verification);
```

## API Endpoints for Verification

### Generate Configuration
```http
GET /api/generate-config
Response: { "reclaimProofRequestConfig": "..." }
```

### Receive Proofs
```http
POST /api/receive-proofs
Content-Type: text/plain
Body: URL-encoded proof data
Response: { "success": true, "message": "..." }
```

### Check Verification Status
```http
GET /api/check-verification/username
Response: { "verified": true, "data": {...} }
```

### List Verified Teachers
```http
GET /api/verified-teachers
Response: { "teachers": [...] }
```

## Future Enhancements

### Additional Verification Types
- **Follower Count**: Verify minimum follower threshold
- **Account Age**: Verify account creation date
- **Post History**: Verify yoga-related content
- **Engagement Metrics**: Verify authentic engagement

### Advanced Features
- **Batch Verification**: Verify multiple accounts simultaneously
- **Recurring Verification**: Periodic re-verification for maintained status
- **Verification Levels**: Different tiers based on account metrics
- **Integration APIs**: Allow other platforms to verify teacher status

## Troubleshooting Common Issues

### QR Code Not Working
1. Ensure mobile device has camera access
2. Try refreshing the page for new QR code
3. Check mobile network connectivity

### Verification Fails
1. Verify Instagram credentials are correct
2. Ensure Instagram account is not restricted
3. Try clearing mobile browser cache

### Backend Errors
1. Check Reclaim Protocol credentials
2. Verify callback URL is accessible
3. Monitor application logs for specific errors

This implementation provides a secure, privacy-preserving way to verify Instagram account ownership, enabling the yoga teacher community to build trust through verified social media presence.