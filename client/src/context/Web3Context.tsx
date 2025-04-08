import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  isConnected: boolean;
  account: string;
  isMetaMaskInstalled: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  checkMetaMaskInstalled: () => boolean;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  account: '',
  isMetaMaskInstalled: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  checkMetaMaskInstalled: () => false,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const { toast } = useToast();

  const checkMetaMaskInstalled = useCallback(() => {
    const isInstalled = typeof window !== 'undefined' && window.ethereum !== undefined;
    setIsMetaMaskInstalled(isInstalled);
    return isInstalled;
  }, []);

  const connectWallet = async () => {
    if (!checkMetaMaskInstalled()) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        toast({
          title: "Wallet connected",
          description: "Your MetaMask wallet has been connected successfully",
        });
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask', error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    toast({
      title: "Wallet disconnected",
      description: "Your MetaMask wallet has been disconnected",
    });
  };

  useEffect(() => {
    checkMetaMaskInstalled();

    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);

      // Setup event listeners for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          // User switched accounts
          setAccount(accounts[0]);
        }
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        // Reload the page when chain changes
        window.location.reload();
      });
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkMetaMaskInstalled]);

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        account,
        isMetaMaskInstalled,
        connectWallet,
        disconnectWallet,
        checkMetaMaskInstalled,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
