import React from "react";
import WalletConnection from "./WalletConnection";
import ConnectionStatus from "./ConnectionStatus";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.314 5.1a2 2 0 00-2.828 0l-.5.5 7.5 7.5.5-.5a2 2 0 000-2.828L16.9 8.6a2 2 0 00-2.828 0l-4.9 4.9v2.828l.707.707z" clipRule="evenodd" />
            </svg>
            <h1 className="ml-2 text-xl font-semibold text-gray-900">NFT Minting DApp</h1>
          </div>
          
          <WalletConnection />
        </div>
      </header>
      
      <ConnectionStatus />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} NFT Minting DApp. All rights reserved.</p>
            <div className="mt-4 sm:mt-0 flex items-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
