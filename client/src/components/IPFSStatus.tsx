import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkPinataConnection } from '@/lib/pinataClient';

const IPFSStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const verifyPinataConnection = async () => {
      try {
        const connectionStatus = await checkPinataConnection();
        
        if (connectionStatus.status === 'connected') {
          setStatus('connected');
        } else {
          setStatus('error');
          setErrorDetails(connectionStatus.message || 'Failed to connect to Pinata API');
        }
      } catch (error) {
        // If there's an unexpected error, we'll assume it's a configuration issue
        setStatus('error');
        setErrorDetails('Failed to check Pinata IPFS connection');
      }
    };

    verifyPinataConnection();
  }, []);

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            className="text-blue-600"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 12L12 3L3 12L12 21L21 12Z"></path>
            <path d="M12 8L16 12L12 16L8 12L12 8Z"></path>
          </svg>
          <div>
            <h3 className="text-sm font-medium text-gray-900">IPFS Storage via Pinata</h3>
            <p className="text-xs text-gray-500">Decentralized storage for your NFT assets</p>
          </div>
        </div>
        
        <div>
          {status === 'checking' && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <span className="animate-pulse mr-1">•</span> Checking
            </Badge>
          )}
          
          {status === 'connected' && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <span className="text-green-500 mr-1">•</span> Connected
            </Badge>
          )}
          
          {status === 'error' && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              <span className="text-red-500 mr-1">•</span> Configuration Issue
            </Badge>
          )}
        </div>
      </div>
      
      {status === 'error' && errorDetails && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          {errorDetails}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600">
        Your NFT files and metadata will be permanently stored on IPFS through Pinata, 
        ensuring your digital assets remain accessible and immutable.
      </div>
    </Card>
  );
};

export default IPFSStatus;