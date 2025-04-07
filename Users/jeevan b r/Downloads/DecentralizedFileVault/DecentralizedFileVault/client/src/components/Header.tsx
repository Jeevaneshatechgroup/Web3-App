import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/walletUtils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { user, connectWallet, disconnectWallet, isLoading, isConnected } = useWallet();
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();
  
  // Check if debug mode is enabled on mount
  useEffect(() => {
    const isDebugMode = localStorage.getItem("debugMode") === "true";
    setDebugMode(isDebugMode);
  }, []);
  
  // Handle debug mode toggle
  const handleDebugModeToggle = (checked: boolean) => {
    localStorage.setItem("debugMode", checked ? "true" : "false");
    setDebugMode(checked);
    
    toast({
      title: checked ? "Debug Mode Enabled" : "Debug Mode Disabled",
      description: checked 
        ? "You can now connect without a real wallet for testing purposes."
        : "Debug mode has been turned off. You'll need a real wallet to connect.",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center cursor-pointer">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9L12 2L5 9M19 15L12 22L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="ml-2 text-xl font-semibold">DecentralStore</span>
              </a>
            </Link>
            
            {/* Debug Mode Toggle */}
            <div className="flex items-center ml-6 space-x-2">
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={handleDebugModeToggle}
              />
              <Label htmlFor="debug-mode" className="text-sm text-gray-600">
                Debug Mode {debugMode ? "(On)" : "(Off)"}
              </Label>
            </div>
          </div>
          
          <div className="flex items-center">
            {isConnected ? (
              <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {formatAddress(user.walletAddress)}
                </span>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={disconnectWallet} 
                  className="ml-4 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Wallet Disconnected
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      window.open("exodus:/ethereum/", "_blank");
                      toast({
                        title: "Opening Exodus Wallet",
                        description: "If the wallet doesn't open automatically, please open it manually and try connecting again.",
                      });
                    }}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Open Exodus
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
