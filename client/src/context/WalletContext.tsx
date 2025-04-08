import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WalletContextType {
  walletAddress: string | null;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = (address: string) => {
    // Simple validation for Ethereum address format
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setWalletAddress(address.toLowerCase());
      localStorage.setItem("walletAddress", address.toLowerCase());
    } else {
      throw new Error("Invalid wallet address format");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
  };

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
    
    // Check if we can auto-connect to a wallet provider on load
    const checkExistingConnection = async () => {
      if (window.ethereum && !savedAddress) {
        try {
          // Get accounts without prompting user
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            connectWallet(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking existing wallet connection:", error);
        }
      }
    };
    
    checkExistingConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        disconnectWallet,
        isConnected: !!walletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
