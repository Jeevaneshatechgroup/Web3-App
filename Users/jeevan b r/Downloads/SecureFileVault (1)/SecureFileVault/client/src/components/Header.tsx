import { Link, useLocation } from 'wouter';
import { ConnectedWallet } from '@/lib/web3';
import { useState } from 'react';
import { Menu, X, Fingerprint, Bell, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  wallet: ConnectedWallet | null;
  onDisconnect: () => void;
  onConnect?: () => Promise<void>;
}

export default function Header({ wallet, onDisconnect, onConnect }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-2 font-semibold text-xl text-gray-800">DecentralID</div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className={`px-1 pt-1 font-medium cursor-pointer ${location === '/' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Documents
              </span>
            </Link>
            <Link href="/my-nfts">
              <span className={`px-1 pt-1 font-medium cursor-pointer ${location === '/my-nfts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                My NFTs
              </span>
            </Link>
            <Link href="/shared">
              <span className={`px-1 pt-1 font-medium cursor-pointer ${location === '/shared' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Shared
              </span>
            </Link>
            <Link href="/settings">
              <span className={`px-1 pt-1 font-medium cursor-pointer ${location === '/settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Settings
              </span>
            </Link>
          </nav>

          {/* User Menu */}
          {wallet ? (
            <div className="flex items-center space-x-4">
              <div className="items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="flex items-center">
                  <div className={`h-2 w-2 ${wallet.walletType === 'exodus' ? 'bg-indigo-500' : 'bg-green-500'} rounded-full mr-2`}></div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {truncateAddress(wallet.address)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate hidden sm:block">
                  {wallet.walletType === 'exodus' ? 'Exodus Wallet' : 'Web3 Wallet'} • {wallet.network}
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2 bg-indigo-50 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-indigo-700 truncate">
                  DID: {wallet.did.did.substring(0, 10)}...
                </span>
              </div>
              
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button 
                  className="flex text-sm rounded-full focus:outline-none"
                  onClick={handleDisconnect}
                  title="Disconnect wallet"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Button 
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
                onClick={onConnect}
                disabled={!onConnect}
              >
                <Wallet className="h-4 w-4 mr-1" />
                <span>Connect Wallet</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="text-gray-500 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/">
            <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${location === '/' ? 'text-white bg-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
              Documents
            </span>
          </Link>
          <Link href="/my-nfts">
            <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${location === '/my-nfts' ? 'text-white bg-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
              My NFTs
            </span>
          </Link>
          <Link href="/shared">
            <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${location === '/shared' ? 'text-white bg-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
              Shared
            </span>
          </Link>
          <Link href="/settings">
            <span className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${location === '/settings' ? 'text-white bg-primary' : 'text-gray-700 hover:bg-gray-100'}`}>
              Settings
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
