import { useState, useEffect } from 'react';
import { createVlayerClient, createWebProofRequest, startPage, expectUrl, notarize } from '@vlayer/sdk';
import { useWalletClient, useAccount } from 'wagmi';

type VerificationMethod = 'reclaim' | 'vlayer';

interface VerificationMetrics {
  startTime: number;
  endTime?: number;
  proofGenerationTime?: number;
  userSteps: number;
  currentStep: string;
  errors: string[];
  success: boolean;
}

interface VerificationResult {
  method: VerificationMethod;
  username?: string;
  proof?: any;
  metrics: VerificationMetrics;
}

export function VerificationMethodComparison() {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('reclaim');
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<{
    reclaim?: VerificationResult;
    vlayer?: VerificationResult;
  }>({});
  
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Initialize vlayer client
  const vlayer = createVlayerClient();

  const vlayerWebProofConfig = createWebProofRequest({
    steps: [
      startPage('https://www.instagram.com/accounts/login/', 'Login to Instagram'),
      expectUrl('https://www.instagram.com/', 'Complete Instagram login'),
      notarize(
        'https://api.instagram.com/v1/users/self',
        'GET',
        'Generate Instagram account proof',
        [
          {
            request: {
              headers_except: ['User-Agent'], // Keep only User-Agent header
            },
          },
          {
            response: {
              headers_except: ['Content-Type'], // Keep only Content-Type header
            },
          },
        ]
      ),
    ],
  });

  const startReclaimVerification = async (): Promise<VerificationResult> => {
    const metrics: VerificationMetrics = {
      startTime: Date.now(),
      userSteps: 0,
      currentStep: 'Initializing Reclaim verification',
      errors: [],
      success: false,
    };

    try {
      metrics.currentStep = 'Generating QR code';
      metrics.userSteps++;

      // Simulate Reclaim flow (replace with actual Reclaim implementation)
      // This would use your existing InstagramVerification component logic
      
      metrics.currentStep = 'Waiting for user to scan QR code';
      metrics.userSteps++;
      
      // Simulate user scanning and completing verification
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate time
      
      metrics.currentStep = 'Processing proof';
      metrics.userSteps++;
      
      metrics.endTime = Date.now();
      metrics.proofGenerationTime = metrics.endTime - metrics.startTime;
      metrics.success = true;
      
      return {
        method: 'reclaim',
        username: 'test_user_reclaim',
        proof: 'reclaim_proof_data',
        metrics,
      };
    } catch (error) {
      metrics.errors.push(error instanceof Error ? error.message : 'Unknown error');
      metrics.endTime = Date.now();
      return {
        method: 'reclaim',
        metrics,
      };
    }
  };

  const startVlayerVerification = async (): Promise<VerificationResult> => {
    const metrics: VerificationMetrics = {
      startTime: Date.now(),
      userSteps: 0,
      currentStep: 'Initializing vlayer verification',
      errors: [],
      success: false,
    };

    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      metrics.currentStep = 'Opening browser extension';
      metrics.userSteps++;

      // Generate Web Proof using vlayer
      const proofHash = await vlayer.proveWeb({
        address: '0x1234567890123456789012345678901234567890', // Replace with actual prover address
        proverAbi: [], // Add actual prover ABI
        functionName: 'verifyInstagramAccount',
        args: [vlayerWebProofConfig, address],
        chainId: 11155420, // Optimism Sepolia
      });

      metrics.currentStep = 'Generating proof';
      metrics.userSteps++;

      const result = await vlayer.waitForProvingResult({ hash: proofHash });

      metrics.currentStep = 'Proof generated successfully';
      metrics.userSteps++;
      
      metrics.endTime = Date.now();
      metrics.proofGenerationTime = metrics.endTime - metrics.startTime;
      metrics.success = true;

      return {
        method: 'vlayer',
        username: 'test_user_vlayer',
        proof: result,
        metrics,
      };
    } catch (error) {
      metrics.errors.push(error instanceof Error ? error.message : 'Unknown error');
      metrics.endTime = Date.now();
      return {
        method: 'vlayer',
        metrics,
      };
    }
  };

  const runSingleVerification = async (method: VerificationMethod) => {
    const result = method === 'reclaim' 
      ? await startReclaimVerification()
      : await startVlayerVerification();
    
    setResults(prev => ({
      ...prev,
      [method]: result,
    }));
  };

  const runComparison = async () => {
    setIsComparing(true);
    setResults({});

    try {
      // Run both verifications in parallel
      const [reclaimResult, vlayerResult] = await Promise.all([
        startReclaimVerification(),
        startVlayerVerification(),
      ]);

      setResults({
        reclaim: reclaimResult,
        vlayer: vlayerResult,
      });
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getWinner = (metric: keyof VerificationMetrics) => {
    if (!results.reclaim || !results.vlayer) return null;
    
    const reclaimValue = results.reclaim.metrics[metric];
    const vlayerValue = results.vlayer.metrics[metric];
    
    if (typeof reclaimValue === 'number' && typeof vlayerValue === 'number') {
      return reclaimValue < vlayerValue ? 'reclaim' : 'vlayer';
    }
    
    return null;
  };

  return (
    <div className="verification-comparison">
      <div className="comparison-header">
        <h2>Instagram Verification Method Comparison</h2>
        <p>Research comparing Reclaim Protocol vs vlayer Web Proofs</p>
      </div>

      <div className="method-selector">
        <h3>Test Individual Methods</h3>
        <div className="method-buttons">
          <div className="method-option">
            <button
              onClick={() => runSingleVerification('reclaim')}
              disabled={isComparing}
              className="method-button reclaim"
            >
              <div className="method-info">
                <h4>🔒 Reclaim Protocol</h4>
                <p>Mobile QR code verification</p>
                <span className="status current">Current Implementation</span>
              </div>
            </button>
          </div>

          <div className="method-option">
            <button
              onClick={() => runSingleVerification('vlayer')}
              disabled={isComparing}
              className="method-button vlayer"
            >
              <div className="method-info">
                <h4>⚡ vlayer Web Proofs</h4>
                <p>Browser extension verification</p>
                <span className="status research">Research Implementation</span>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={runComparison}
          disabled={isComparing}
          className="compare-button"
        >
          {isComparing ? 'Running Comparison...' : 'Compare Both Methods'}
        </button>
      </div>

      {(results.reclaim || results.vlayer) && (
        <div className="comparison-results">
          <h3>Comparison Results</h3>
          
          <div className="results-grid">
            <div className="result-section">
              <h4>📊 Performance Metrics</h4>
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Reclaim Protocol</th>
                    <th>vlayer Web Proofs</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Proof Generation Time</td>
                    <td>{formatTime(results.reclaim?.metrics.proofGenerationTime)}</td>
                    <td>{formatTime(results.vlayer?.metrics.proofGenerationTime)}</td>
                    <td className={`winner ${getWinner('proofGenerationTime') || ''}`}>
                      {getWinner('proofGenerationTime') === 'reclaim' ? '🥇 Reclaim' : 
                       getWinner('proofGenerationTime') === 'vlayer' ? '🥇 vlayer' : 'Tie'}
                    </td>
                  </tr>
                  <tr>
                    <td>User Steps Required</td>
                    <td>{results.reclaim?.metrics.userSteps || 'N/A'}</td>
                    <td>{results.vlayer?.metrics.userSteps || 'N/A'}</td>
                    <td className={`winner ${getWinner('userSteps') || ''}`}>
                      {getWinner('userSteps') === 'reclaim' ? '🥇 Reclaim' : 
                       getWinner('userSteps') === 'vlayer' ? '🥇 vlayer' : 'Tie'}
                    </td>
                  </tr>
                  <tr>
                    <td>Success Rate</td>
                    <td>{results.reclaim?.metrics.success ? '✅ Success' : '❌ Failed'}</td>
                    <td>{results.vlayer?.metrics.success ? '✅ Success' : '❌ Failed'}</td>
                    <td>
                      {results.reclaim?.metrics.success && results.vlayer?.metrics.success ? 'Tie' :
                       results.reclaim?.metrics.success ? '🥇 Reclaim' :
                       results.vlayer?.metrics.success ? '🥇 vlayer' : 'Both Failed'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="result-section">
              <h4>🔧 Technical Details</h4>
              <div className="technical-comparison">
                <div className="tech-detail">
                  <h5>Reclaim Protocol</h5>
                  <ul>
                    <li>✅ Mobile-native flow</li>
                    <li>✅ QR code scanning</li>
                    <li>✅ Established protocol</li>
                    <li>⚠️ Requires mobile device</li>
                    <li>Current step: {results.reclaim?.metrics.currentStep}</li>
                  </ul>
                </div>
                <div className="tech-detail">
                  <h5>vlayer Web Proofs</h5>
                  <ul>
                    <li>✅ Browser-native flow</li>
                    <li>✅ No mobile required</li>
                    <li>✅ Direct API verification</li>
                    <li>⚠️ Requires browser extension</li>
                    <li>Current step: {results.vlayer?.metrics.currentStep}</li>
                  </ul>
                </div>
              </div>
            </div>

            {(results.reclaim?.metrics.errors.length || results.vlayer?.metrics.errors.length) && (
              <div className="result-section errors">
                <h4>❌ Errors Encountered</h4>
                {results.reclaim?.metrics.errors.length > 0 && (
                  <div>
                    <h5>Reclaim Protocol Errors:</h5>
                    <ul>
                      {results.reclaim.metrics.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.vlayer?.metrics.errors.length > 0 && (
                  <div>
                    <h5>vlayer Web Proofs Errors:</h5>
                    <ul>
                      {results.vlayer.metrics.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="research-notes">
        <h3>📋 Research Notes</h3>
        <div className="notes-grid">
          <div className="note-section">
            <h4>User Experience Observations</h4>
            <ul>
              <li>Mobile vs Desktop preference</li>
              <li>Setup complexity differences</li>
              <li>Error handling and recovery</li>
              <li>Accessibility considerations</li>
            </ul>
          </div>
          <div className="note-section">
            <h4>Technical Considerations</h4>
            <ul>
              <li>Trust assumption differences</li>
              <li>Infrastructure dependencies</li>
              <li>Proof size and verification costs</li>
              <li>Scalability implications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}