import { useVoting } from "@/context/VotingContext";
import { useWeb3 } from "@/context/Web3Context";
import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VotingInfo() {
  const { contractAddress, totalVotes, hasVoted, network } = useVoting();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Address copied",
      description: "Contract address copied to clipboard",
    });
  };

  return (
    <Card className="shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Voting Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Smart Contract Address</h4>
          <div className="flex items-center">
            <span className="text-gray-800 font-mono text-sm mr-2 truncate">{contractAddress}</span>
            <button 
              onClick={() => copyToClipboard(contractAddress)}
              className="text-blue-500 hover:text-blue-700 transition-colors" 
              title="Copy address"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Network</h4>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-800">{network}</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Your Voting Status</h4>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              hasVoted 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {hasVoted ? "Voted" : "Not voted yet"}
            </span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Votes Cast</h4>
          <div className="text-gray-800 font-medium">{totalVotes}</div>
        </div>
      </div>
    </Card>
  );
}
