export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <i className="fas fa-vote-yea text-blue-400 mr-2"></i>
              <span className="font-bold">DecentralVote</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Secure blockchain voting platform</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <a href="#" className="text-sm hover:text-white transition-colors">About</a>
            <a href="#" className="text-sm hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-sm hover:text-white transition-colors">View on Etherscan</a>
            <a href="#" className="text-sm hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>IPFS data storage powered by Pinata | Smart contract deployed on Ethereum Goerli Testnet</p>
          <p className="mt-1">© {new Date().getFullYear()} DecentralVote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
