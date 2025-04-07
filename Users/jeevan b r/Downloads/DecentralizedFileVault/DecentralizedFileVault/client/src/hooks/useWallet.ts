import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { walletUserSchema, type WalletUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";

// Constants for local storage
const WALLET_ADDRESS_KEY = "walletAddress";
const WALLET_CONNECTED_KEY = "walletConnected";

export function useWallet() {
  const [user, setUser] = useState<WalletUser>({
    walletAddress: "",
    connected: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check for wallet connection on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem(WALLET_ADDRESS_KEY);
    const savedConnected = localStorage.getItem(WALLET_CONNECTED_KEY) === "true";

    if (savedAddress && savedConnected) {
      setUser({
        walletAddress: savedAddress,
        connected: true,
      });
    }
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Debug logging to see what wallet extensions are available
      console.log("Checking for wallet extensions...");
      console.log("Exodus available:", typeof window.exodus !== "undefined");
      console.log("Ethereum provider available:", typeof window.ethereum !== "undefined");
      
      // For testing purposes, check debug mode
      const isDebugMode = localStorage.getItem("debugMode") === "true";
      console.log("Debug mode enabled:", isDebugMode);
      
      let walletAddress = "";
      
      // Check for Exodus wallet with direct window detection and custom handler
      if (navigator.userAgent.includes("Exodus") || typeof window.exodus !== "undefined") {
        console.log("Using Exodus wallet - direct method");
        try {
          // Alternative method to force open the Exodus wallet
          // This creates a direct web3 request that should trigger the wallet
          const exodusRequest = {
            jsonrpc: '2.0',
            method: 'eth_requestAccounts',
            params: [],
            id: Math.floor(Math.random() * 1000000)
          };
          
          console.log("Sending direct request to Exodus wallet");
          
          // Try to force open Exodus with direct ethereum protocol call
          if (typeof window.ethereum !== "undefined") {
            // This should trigger the wallet regardless of how it's registered
            const accounts = await window.ethereum.request({ 
              method: "eth_requestAccounts" 
            });
            console.log("Direct accounts received:", accounts);
            
            if (accounts && accounts.length > 0) {
              walletAddress = accounts[0];
            } else {
              toast({
                title: "Wallet Connection Failed",
                description: "No accounts received from Exodus wallet. Please make sure it's unlocked and try again.",
                variant: "destructive",
              });
              return false;
            }
          } else {
            // If ethereum object isn't available, try opening wallet via protocol
            // This is a fallback that attempts to launch the Exodus wallet externally
            console.log("Trying to launch Exodus wallet externally");
            window.open("exodus:/ethereum/", "_blank");
            
            toast({
              title: "Exodus Wallet Connection",
              description: "Please open and unlock your Exodus wallet, then try connecting again.",
              variant: "destructive",
            });
            return false;
          }
        } catch (exodusError) {
          console.error("Exodus wallet error:", exodusError);
          toast({
            title: "Exodus Wallet Error",
            description: "Failed to connect to Exodus wallet. Please make sure it's installed and unlocked, then try again.",
            variant: "destructive",
          });
          return false;
        }
      }
      // Check if MetaMask or other Ethereum provider is available
      else if (typeof window.ethereum !== "undefined") {
        console.log("Using Ethereum provider (MetaMask or similar)");
        try {
          // Request accounts from Ethereum provider
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log("Ethereum accounts received:", accounts);
          
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
          } else {
            toast({
              title: "Wallet Error",
              description: "No accounts found in your wallet",
              variant: "destructive",
            });
            return false;
          }
        } catch (ethError) {
          console.error("Ethereum wallet error:", ethError);
          toast({
            title: "Wallet Access Denied",
            description: "Failed to access your wallet. Please make sure it's unlocked and try again.",
            variant: "destructive",
          });
          return false;
        }
      }
      // Debug mode fallback
      else if (isDebugMode) {
        // In debug mode, use a test address
        console.log("Using debug mode with test address");
        walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
      }
      // No wallet available and not in debug mode
      else {
        console.log("No wallet provider found and debug mode is off");
        toast({
          title: "Wallet Not Found",
          description: "Please install a Web3 wallet extension (Exodus, MetaMask, etc.) to continue. For testing, you can enable Debug Mode in settings.",
          variant: "destructive",
        });
        return false;
      }
      
      // If we have a wallet address, proceed with connection
      if (walletAddress) {
        console.log("Completing connection with wallet address:", walletAddress);
        
        try {
          // Register wallet with backend
          const response = await apiRequest("POST", "/api/auth/wallet-connect", {
            walletAddress,
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Store connection in state and localStorage
            const newUserState = {
              walletAddress,
              connected: true,
            };
            
            setUser(newUserState);
            localStorage.setItem(WALLET_ADDRESS_KEY, walletAddress);
            localStorage.setItem(WALLET_CONNECTED_KEY, "true");
            
            toast({
              title: "Wallet Connected",
              description: `Connected with address ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            });
            
            // Invalidate any related queries
            queryClient.invalidateQueries({ queryKey: ["/api/files"] });
            
            // Redirect to dashboard
            setLocation("/dashboard");
            return true;
          } else {
            throw new Error(data.message || "Failed to register wallet with server");
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          toast({
            title: "Server Connection Error",
            description: apiError instanceof Error ? apiError.message : "Failed to connect to server",
            variant: "destructive",
          });
          return false;
        }
      }
      
      return false; // Should never reach here
    } catch (error) {
      console.error("Unexpected wallet connection error:", error);
      toast({
        title: "Connection Error",
        description: "An unexpected error occurred when connecting your wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, setLocation]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setUser({
      walletAddress: "",
      connected: false,
    });
    
    localStorage.removeItem(WALLET_ADDRESS_KEY);
    localStorage.removeItem(WALLET_CONNECTED_KEY);
    
    // Invalidate queries that depend on wallet connection
    queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
    
    // Redirect to home
    setLocation("/");
  }, [toast, setLocation]);

  return {
    user,
    isLoading,
    connectWallet,
    disconnectWallet,
    isConnected: user.connected,
  };
}

// Add type definitions for wallet providers
declare global {
  interface Window {
    exodus?: {
      request: (args: { method: string }) => Promise<string[]>;
    };
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}
