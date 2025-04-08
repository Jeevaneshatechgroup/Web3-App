import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useExodusWallet } from "@/hooks/useExodusWallet";

const WalletConnection = () => {
  const { isConnected, walletAddress, connectWallet, isConnecting } = useExodusWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to Exodus wallet. Please ensure the browser extension is installed and unlocked.",
      });
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center">
      {!isConnected ? (
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Connect Wallet
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-sm text-green-600 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connected
          </span>
          <Button variant="outline" className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors">
            {formatAddress(walletAddress)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
