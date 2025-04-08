import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";

export default function WalletConnect() {
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();

  // Function to truncate Ethereum address for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {!isConnected ? (
        <div className="flex items-center">
          <Button 
            onClick={connectWallet}
            className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <i className="fas fa-wallet mr-2"></i>
            Connect MetaMask
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="bg-gray-100 rounded-lg py-1 px-3 flex items-center mr-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
              {truncateAddress(account)}
            </span>
          </div>
          <button 
            onClick={disconnectWallet}
            className="text-sm text-gray-500 hover:text-gray-700">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
