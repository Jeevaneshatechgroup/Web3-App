import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function Home() {
  const { user, connectWallet, isLoading, isConnected } = useWallet();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (isConnected) {
      setLocation("/dashboard");
    }
  }, [isConnected, setLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <svg className="mx-auto h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Secure Decentralized Storage</h2>
        <p className="mt-4 text-lg text-gray-500">Connect your Exodus wallet to access your files on IPFS.</p>
        <p className="mt-2 text-md text-gray-500">Your files are encrypted and stored across the decentralized network.</p>
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="flex items-center"
            onClick={connectWallet}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isLoading ? "Connecting..." : "Connect Exodus Wallet"}
          </Button>
        </div>
        <div className="mt-12 max-w-xl mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <svg className="h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Secure Access</h3>
                <p className="mt-2 text-sm text-gray-500">Controlled access with Exodus wallet authentication</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <svg className="h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-5 text-lg font-medium text-gray-900">IPFS Storage</h3>
                <p className="mt-2 text-sm text-gray-500">Distributed storage on the InterPlanetary File System</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <svg className="h-12 w-12 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Easy Sharing</h3>
                <p className="mt-2 text-sm text-gray-500">Share files with specific wallet addresses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
