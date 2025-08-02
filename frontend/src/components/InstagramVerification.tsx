import { useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { QRCodeCanvas } from 'qrcode.react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Proof {
  identifier: string;
  claimData: {
    context: {
      extractedParameters: string;
    };
  };
}

function InstagramVerification() {
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Fetch the configuration from backend
      const response = await fetch(`${BASE_URL}/api/generate-config`);
      if (!response.ok) {
        throw new Error('Failed to generate verification config');
      }
      
      const { reclaimProofRequestConfig } = await response.json();

      // Step 2: Initialize the ReclaimProofRequest
      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);

      // Step 3: Generate request URL for QR code
      const url = await reclaimProofRequest.getRequestUrl();
      setRequestUrl(url);

      // Step 4: Start listening for proof submissions
      await reclaimProofRequest.startSession({
        onSuccess: (receivedProofs) => {
          console.log('Successfully created proof', receivedProofs);
          
          // Handle different types of receivedProofs
          let proofsArray: Proof[] | null = null;
          
          if (Array.isArray(receivedProofs)) {
            proofsArray = receivedProofs;
          } else if (receivedProofs && typeof receivedProofs === 'object' && 'identifier' in receivedProofs) {
            proofsArray = [receivedProofs as Proof];
          }
          
          setProofs(proofsArray);
          setIsLoading(false);
          
          // Extract Instagram username from proof
          if (proofsArray && proofsArray.length > 0) {
            const extractedData = JSON.parse(proofsArray[0].claimData.context.extractedParameters);
            setVerifiedUsername(extractedData.username || extractedData.handle);
          }
        },
        onError: (error) => {
          console.error('Verification failed', error);
          setError('Verification failed. Please try again.');
          setIsLoading(false);
        },
      });

    } catch (error) {
      console.error('Error initializing Reclaim:', error);
      setError('Failed to initialize verification. Please try again.');
      setIsLoading(false);
    }
  };

  const resetVerification = () => {
    setProofs(null);
    setRequestUrl(null);
    setVerifiedUsername(null);
    setError(null);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h1 className="title">Hot Yoga Teacher Verification</h1>
        <p className="subtitle">Verify your Instagram account to join our exclusive hot yoga teacher community</p>

        {!proofs && !requestUrl && (
          <div className="action-section">
            <button 
              onClick={handleVerification} 
              disabled={isLoading}
              className="verify-button"
            >
              {isLoading ? 'Initializing...' : 'Verify Instagram Account'}
            </button>
          </div>
        )}

        {requestUrl && !proofs && (
          <div className="qr-section">
            <h2>Scan with your phone to verify</h2>
            <div className="qr-container">
              <QRCodeCanvas 
                value={requestUrl} 
                size={256}
                level="H"
                className="qr-code"
              />
            </div>
            <p className="instructions">
              1. Scan the QR code with your phone<br />
              2. Follow the instructions to verify your Instagram<br />
              3. Return here once completed
            </p>
            <button onClick={resetVerification} className="reset-button">
              Cancel Verification
            </button>
          </div>
        )}

        {proofs && verifiedUsername && (
          <div className="success-section">
            <div className="success-icon">✅</div>
            <h2>Verification Successful!</h2>
            <p className="verified-username">@{verifiedUsername}</p>
            <p className="success-message">
              Welcome to our hot yoga teacher community! Your Instagram account has been verified.
            </p>
            <button onClick={resetVerification} className="new-verification-button">
              Verify Another Account
            </button>
          </div>
        )}

        {error && (
          <div className="error-section">
            <p className="error-message">{error}</p>
            <button onClick={resetVerification} className="retry-button">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstagramVerification;