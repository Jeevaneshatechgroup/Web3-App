import { useState } from "react";
import { useExodusWallet } from "@/hooks/useExodusWallet";
import WalletDebugger from "./WalletDebugger";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ConnectionStatus = () => {
  const { isConnected, isExodusAvailable } = useExodusWallet();
  const [showDebugger, setShowDebugger] = useState(false);
  
  if (isConnected) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showDebugger && <WalletDebugger />}
        
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              {isExodusAvailable 
                ? "Connect your Exodus wallet to start minting NFTs."
                : "Exodus wallet not detected. Make sure you have the browser extension installed and unlocked."}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="debug-mode"
                checked={showDebugger}
                onCheckedChange={setShowDebugger}
                className="h-4 w-7"
              />
              <Label htmlFor="debug-mode" className="text-xs text-blue-600">Debug Mode</Label>
            </div>
            <a href="https://www.exodus.com/" target="_blank" rel="noreferrer" className="text-blue-700 text-sm hover:text-blue-800 underline">
              Get Exodus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
