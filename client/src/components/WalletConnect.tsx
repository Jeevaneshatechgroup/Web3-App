import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Type definition for Ethereum window object
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (accounts: string[]) => void) => void;
      removeListener?: (eventName: string, callback: (accounts: string[]) => void) => void;
      removeAllListeners?: (eventName: string) => void;
    };
  }
}

export default function WalletConnect() {
  const { walletAddress, connectWallet, disconnectWallet, isConnected } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check if wallet provider exists
  useEffect(() => {
    const checkProvider = () => {
      const ethereum = window.ethereum;
      setHasProvider(!!ethereum);
    };
    
    checkProvider();
  }, []);

  // Handle wallet account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
        toast({
          title: "Wallet disconnected",
          description: "Your wallet has been disconnected.",
        });
      } else if (accounts[0] !== walletAddress) {
        // Account changed
        connectWallet(accounts[0]);
        toast({
          title: "Wallet changed",
          description: "Your connected wallet address has changed.",
        });
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      const ethereum = window.ethereum;
      if (ethereum) {
        // Try removeListener first, if not available use removeAllListeners
        if (ethereum.removeListener && typeof ethereum.removeListener === 'function') {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        } else if (ethereum.removeAllListeners && typeof ethereum.removeAllListeners === 'function') {
          ethereum.removeAllListeners('accountsChanged');
        }
        // If neither method is available, the listener will naturally be cleaned up
        // when the component unmounts
      }
    };
  }, [walletAddress, connectWallet, disconnectWallet, toast]);

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "No wallet detected",
        description: "Please install Exodus or another web3 wallet extension.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts && accounts.length > 0) {
        connectWallet(accounts[0]);
        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully.",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  // Format the wallet address for display (truncate the middle)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {!isConnected ? (
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleConnect} 
            className="bg-primary hover:bg-blue-600 text-white" 
            disabled={connecting}
          >
            {connecting ? "Connecting..." : hasProvider === false ? "Install Wallet" : "Connect Wallet"}
          </Button>
          
          {hasProvider === false && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Wallet not detected</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600">Connected:</span>
          <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono text-gray-800 truncate max-w-[180px]">
            {formatAddress(walletAddress || "")}
          </code>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            className="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
