import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const WalletDebugger = () => {
  const [open, setOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    hasExodus: boolean;
    hasEthereum: boolean;
    isExodus: boolean;
    providerType: string;
  }>({
    hasExodus: false,
    hasEthereum: false,
    isExodus: false,
    providerType: "none",
  });

  useEffect(() => {
    const updateWalletInfo = () => {
      const hasExodus = Boolean(window.exodus);
      const hasEthereum = Boolean(window.ethereum);
      const isExodus = Boolean(window.ethereum?.isExodus);
      
      let providerType = "none";
      if (hasExodus && window.exodus?.ethereum) {
        providerType = "window.exodus.ethereum";
      } else if (hasEthereum && isExodus) {
        providerType = "window.ethereum (Exodus)";
      } else if (hasEthereum) {
        providerType = "window.ethereum (Other)";
      }
      
      setWalletInfo({
        hasExodus,
        hasEthereum,
        isExodus,
        providerType
      });
    };

    updateWalletInfo();
    
    // Check periodically for wallet
    const interval = setInterval(updateWalletInfo, 2000);
    
    // Listen for wallet events
    window.addEventListener('exodus#initialized', updateWalletInfo);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('exodus#initialized', updateWalletInfo);
    };
  }, []);

  return (
    <Card className="mb-6 border border-amber-200 bg-amber-50">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium text-amber-800 flex items-center justify-between">
          Wallet Detection Debug
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-2 h-8 px-2 text-xs"
          >
            Refresh Page
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-xs text-amber-700 space-y-1">
          <p><strong>window.exodus exists:</strong> {walletInfo.hasExodus ? "✅ Yes" : "❌ No"}</p>
          <p><strong>window.ethereum exists:</strong> {walletInfo.hasEthereum ? "✅ Yes" : "❌ No"}</p>
          <p><strong>window.ethereum.isExodus:</strong> {walletInfo.isExodus ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Provider detected:</strong> {walletInfo.providerType}</p>
        </div>
        
        <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
          <CollapsibleTrigger className="text-xs text-amber-800 underline">
            {open ? "Hide Tips" : "Show Tips"}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-xs text-amber-700 mt-2 space-y-1">
            <p>• If using Exodus browser extension, make sure it's installed and unlocked</p>
            <p>• Reload the page after unlocking your wallet</p>
            <p>• Check if other Ethereum wallets (like MetaMask) are installed and might be conflicting</p>
            <p>• The Exodus wallet extension needs to inject its provider into the page before detection works</p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default WalletDebugger;