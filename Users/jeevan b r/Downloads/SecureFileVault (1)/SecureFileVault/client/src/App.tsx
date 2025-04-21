import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useWallet } from "./lib/web3";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import MyNFTs from "@/pages/MyNFTs";
import Shared from "@/pages/Shared";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { wallet, connect, disconnect, loading, error } = useWallet();
  const { toast } = useToast();
  const [userRegistered, setUserRegistered] = useState(false);
  
  // We no longer connect on mount - user must click the connect button
  // This function will be passed to the Header component for the connect button
  const handleConnectWallet = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Show a connecting toast
        toast({
          title: "Connecting wallet...",
          description: "Please approve the connection in your wallet",
        });
        
        // Attempt to connect to wallet
        await connect();
        
        // After connecting, check if it's Exodus and notify user if not
        if (wallet && wallet.walletType !== 'exodus') {
          toast({
            title: "Not using Exodus wallet",
            description: "This application works best with Exodus wallet for enhanced security and identity features.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Wallet connected",
            description: "Your wallet has been connected successfully",
          });
        }
      } else {
        console.warn("Not in browser environment");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast({
        title: "Wallet connection failed",
        description: "Please make sure you have a Web3 wallet installed like Exodus or MetaMask.",
        variant: "destructive",
      });
    }
  };
  
  // Register user with DID when wallet connects
  useEffect(() => {
    const registerUser = async () => {
      if (wallet && !userRegistered) {
        try {
          // Check if user exists
          const userResponse = await fetch(`/api/users/wallet/${wallet.address}`);
          
          if (!userResponse.ok && userResponse.status !== 404) {
            throw new Error('Failed to check user existence');
          }
          
          let needsRegistration = userResponse.status === 404;
          
          if (userResponse.ok) {
            // Parse response to check for DID
            const userData = await userResponse.json();
            if (!userData.did) {
              needsRegistration = true;
            }
          }
          
          if (needsRegistration) {
            // Create or update user with DID
            const userData = {
              username: `user_${wallet.address.substring(0, 8)}`,
              password: Math.random().toString(36).substring(2, 15),
              walletAddress: wallet.address,
              did: wallet.did.did,
              didDocument: wallet.did.didDocument
            };
            
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userData)
            });
            
            if (response.ok) {
              setUserRegistered(true);
              if (wallet.walletType === 'exodus') {
                toast({
                  title: "DID Created Successfully",
                  description: `Your decentralized identity (${wallet.did.did.substring(0, 15)}...) has been created with Exodus wallet.`,
                });
              }
            }
          } else {
            setUserRegistered(true);
          }
        } catch (error) {
          console.error('Error registering user:', error);
        }
      }
    };
    
    registerUser();
  }, [wallet, userRegistered, toast]);
  
  // Show toast for wallet connection errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Wallet connection failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Handle network switching
  const handleSwitchNetwork = async () => {
    // Check for Exodus wallet first
    // @ts-ignore - exodus is not in the window type
    if (typeof window !== 'undefined' && window.exodus && window.exodus.ethereum) {
      try {
        // @ts-ignore - exodus is not in the window type
        await window.exodus.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }], // Ethereum Mainnet
        });
      } catch (error) {
        toast({
          title: "Failed to switch network",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Fallback to other wallets
    if (!window.ethereum) {
      toast({
        title: "No Web3 wallet detected",
        description: "Please install the Exodus wallet to use this application.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
    } catch (error) {
      toast({
        title: "Failed to switch network",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header wallet={wallet} onDisconnect={disconnect} onConnect={handleConnectWallet} />
      
      <main className="flex-1 bg-gray-50">
        <Switch>
          <Route path="/">
            <Dashboard wallet={wallet} onSwitchNetwork={handleSwitchNetwork} />
          </Route>
          <Route path="/my-nfts">
            <MyNFTs wallet={wallet} />
          </Route>
          <Route path="/shared">
            <Shared wallet={wallet} />
          </Route>
          <Route path="/settings">
            <Settings wallet={wallet} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
