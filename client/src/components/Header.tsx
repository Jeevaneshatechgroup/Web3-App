import WalletConnect from "./WalletConnect";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-vote-yea text-blue-500 text-2xl mr-3"></i>
          <h1 className="text-xl font-bold text-gray-900">DecentralVote</h1>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
