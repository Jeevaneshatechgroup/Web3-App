import { ConnectedWallet } from '@/lib/web3';
import { Link, ExternalLink } from 'lucide-react';

interface WalletStatusProps {
  wallet: ConnectedWallet | null;
  onSwitchNetwork: () => void;
}

export default function WalletStatus({ wallet, onSwitchNetwork }: WalletStatusProps) {
  if (!wallet) {
    return (
      <div className="mx-4 sm:mx-0 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Link className="text-yellow-500 h-5 w-5" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between items-center">
            <p className="text-sm text-yellow-700">
              Not connected to any blockchain network
            </p>
          </div>
          <div className="ml-4">
            <button className="inline-flex text-sm text-yellow-700 hover:text-yellow-500">
              <ExternalLink className="h-4 w-4 mr-1" />
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 sm:mx-0 mb-6 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Link className="text-indigo-500 h-5 w-5" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between items-center">
          <p className="text-sm text-indigo-700">
            Connected to {wallet.network}
          </p>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <p className="text-xs font-medium text-indigo-700">Synced</p>
          </div>
        </div>
        <div className="ml-4">
          <button 
            className="inline-flex text-sm text-indigo-700 hover:text-indigo-500"
            onClick={onSwitchNetwork}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}
