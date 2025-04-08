import { useWeb3 } from "@/context/Web3Context";
import CandidateCard from "./CandidateCard";
import VotingInfo from "./VotingInfo";
import VotingRules from "./VotingRules";
import { useVoting } from "@/context/VotingContext";
import { Button } from "@/components/ui/button";

export default function VotingSection() {
  const { isConnected, isMetaMaskInstalled, connectWallet } = useWeb3();
  const { candidates } = useVoting();

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Governance Vote</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cast your vote to elect the next community representative. Your vote is securely recorded on the blockchain and cannot be altered once submitted.
        </p>
      </div>
      
      {/* MetaMask not installed warning */}
      {!isMetaMaskInstalled && (
        <div className="bg-amber-100 border border-amber-200 rounded-lg p-6 max-w-xl mx-auto mb-8 text-center">
          <i className="fas fa-exclamation-triangle text-amber-500 text-3xl mb-4"></i>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">MetaMask Extension Not Detected</h3>
          <p className="text-amber-700 mb-4">To participate in voting, you need to install the MetaMask browser extension.</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Install MetaMask
          </a>
        </div>
      )}
      
      {/* Wallet not connected message */}
      {isMetaMaskInstalled && !isConnected && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 max-w-xl mx-auto mb-8 text-center">
          <i className="fas fa-wallet text-blue-500 text-3xl mb-4"></i>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Connect Your Wallet to Vote</h3>
          <p className="text-blue-700 mb-4">Please connect your MetaMask wallet to participate in the voting process.</p>
          <Button 
            onClick={connectWallet}
            className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
          >
            <i className="fas fa-wallet mr-2"></i>
            Connect MetaMask
          </Button>
        </div>
      )}
      
      {/* Voting interface (only shown when connected) */}
      {isConnected && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {candidates.map((candidate) => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate} 
              />
            ))}
          </div>
          
          <VotingInfo />
          <VotingRules />
        </div>
      )}
    </>
  );
}
