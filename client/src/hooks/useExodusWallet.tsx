import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

// Using ExodusProvider interface from declarations.d.ts

export const useExodusWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isExodusAvailable, setIsExodusAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ExodusProvider | null>(null);
  const detectionInterval = useRef<number | null>(null);
  const { toast } = useToast();

  // Check if Exodus is available
  const checkExodus = useCallback(() => {
    let providerDetected = false;
    console.log("Checking for Exodus wallet...");
    
    // First check exodus.ethereum
    if (window.exodus?.ethereum) {
      console.log("Found exodus.ethereum provider!");
      setIsExodusAvailable(true);
      setProvider(window.exodus.ethereum);
      providerDetected = true;
    } 
    // Then check ethereum.isExodus
    else if (window.ethereum?.isExodus) {
      console.log("Found ethereum provider with isExodus flag!");
      setIsExodusAvailable(true);
      setProvider(window.ethereum);
      providerDetected = true;
    } 
    // Last resort check - if there's an ethereum provider, use it
    else if (window.ethereum) {
      console.log("Found generic ethereum provider - checking if it's Exodus compatible");
      try {
        // Test if it supports basic eth methods
        window.ethereum.request({ method: 'eth_chainId' })
          .then(() => {
            console.log("Generic provider seems compatible");
            setIsExodusAvailable(true);
            if (window.ethereum) {
              setProvider(window.ethereum);
              providerDetected = true;
            }
          })
          .catch(err => {
            console.log("Generic provider test failed:", err);
          });
      } catch (e) {
        console.error("Error testing ethereum provider:", e);
      }
    }
    
    // If no provider detected
    if (!providerDetected) {
      setIsExodusAvailable(false);
      // Don't null the provider if we already have one (helps with page refreshes)
      if (!provider) {
        setProvider(null);
      }
    }
    
    return providerDetected;
  }, [provider]);

  // Initial setup and detection loop
  useEffect(() => {
    // Check immediately on load
    const initialDetection = checkExodus();
    
    // If not detected, set up polling with exponential backoff
    if (!initialDetection && !detectionInterval.current) {
      let attempts = 0;
      
      const attemptDetection = () => {
        if (attempts >= 5) {
          // Stop after 5 attempts (about 30 seconds total with backoff)
          if (detectionInterval.current) {
            window.clearInterval(detectionInterval.current);
            detectionInterval.current = null;
          }
          return;
        }
        
        const detected = checkExodus();
        if (detected && detectionInterval.current) {
          window.clearInterval(detectionInterval.current);
          detectionInterval.current = null;
        } else {
          attempts++;
        }
      };
      
      // Try checking every 2 seconds initially, then back off
      detectionInterval.current = window.setInterval(attemptDetection, 2000);
    }
    
    // Listen for Exodus-specific initialization events
    window.addEventListener('exodus#initialized', checkExodus);
    
    // Also listen for general ethereum provider changes
    window.addEventListener('ethereum#initialized', checkExodus);
    
    return () => {
      if (detectionInterval.current) {
        window.clearInterval(detectionInterval.current);
      }
      window.removeEventListener('exodus#initialized', checkExodus);
      window.removeEventListener('ethereum#initialized', checkExodus);
    };
  }, [checkExodus]);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    console.log("Accounts changed:", accounts);
    if (accounts.length === 0) {
      setIsConnected(false);
      setWalletAddress(null);
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet is no longer connected.",
      });
    } else {
      setIsConnected(true);
      setWalletAddress(accounts[0]);
    }
  }, [toast]);

  // Setup event listeners when provider changes
  useEffect(() => {
    if (!provider) return;
    
    console.log("Setting up provider event listeners");
    
    try {
      provider.on('accountsChanged', handleAccountsChanged);
      
      // Handle chain changes
      const handleChainChanged = () => {
        console.log("Chain changed, refreshing app state");
        // Reload the page on chain change
        window.location.reload();
      };
      
      provider.on('chainChanged', handleChainChanged);
      
      // Check if already connected
      provider.request({ method: 'eth_accounts' })
        .then(accounts => {
          console.log("Current accounts:", accounts);
          if (accounts.length > 0) {
            setIsConnected(true);
            setWalletAddress(accounts[0]);
          }
        })
        .catch(error => console.error("Failed to get accounts:", error));
      
      return () => {
        try {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
        } catch (e) {
          console.error("Error removing event listeners:", e);
        }
      };
    } catch (e) {
      console.error("Error setting up provider event listeners:", e);
    }
  }, [provider, handleAccountsChanged]);

  // Connect wallet function
  const connectWallet = async () => {
    console.log("Connect wallet requested, provider status:", Boolean(provider));
    
    // Try to detect wallet again if provider is null
    if (!provider) {
      const detected = checkExodus();
      if (!detected) {
        toast({
          variant: "destructive",
          title: "Wallet Not Detected",
          description: "Please make sure you have Exodus wallet installed and unlocked, then refresh the page.",
          action: (
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-destructive/10 text-destructive rounded text-xs"
            >
              Refresh
            </button>
          ),
        });
        return;
      }
    }
    
    // Double-check provider again after detection attempt
    if (!provider) {
      toast({
        variant: "destructive",
        title: "Wallet Not Found",
        description: "Please install and unlock Exodus wallet browser extension to continue.",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      console.log("Requesting accounts...");
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      console.log("Received accounts:", accounts);
      
      if (accounts.length > 0) {
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to your wallet.",
        });
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet. Make sure the extension is unlocked.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function (for UI purposes - note that there's no real "disconnect" method in web3)
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    toast({
      title: "Wallet Disconnected",
      description: "You have disconnected from your wallet.",
    });
  };

  return {
    isExodusAvailable,
    isConnected,
    isConnecting,
    walletAddress,
    connectWallet,
    disconnectWallet,
    provider
  };
};
