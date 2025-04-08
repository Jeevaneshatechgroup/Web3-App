import { useVoting } from "@/context/VotingContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TransactionModal() {
  const { transaction, closeTransactionModal } = useVoting();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Transaction hash copied",
      description: "Transaction hash copied to clipboard",
    });
  };

  if (!transaction.isOpen) return null;

  return (
    <Dialog open={transaction.isOpen} onOpenChange={() => closeTransactionModal()}>
      <DialogContent className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 m-4">
        <div className="text-center">
          {transaction.status === 'pending' && (
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            </div>
          )}
          
          {transaction.status === 'confirmed' && (
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check-circle text-3xl"></i>
              </div>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Transaction Processing</h3>
          <p className="text-gray-600 mb-4">
            {transaction.status === 'pending' 
              ? 'Your vote is being recorded on the blockchain. Please wait...'
              : 'Your vote has been successfully recorded on the blockchain!'}
          </p>
          
          {transaction.hash && (
            <div className="bg-gray-50 rounded p-3 text-left mb-4">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-500">Transaction Hash:</span>
                <div className="flex items-center">
                  <span className="text-sm font-mono text-gray-800 truncate">{transaction.hash}</span>
                  <button 
                    className="ml-2 text-blue-500 hover:text-blue-700"
                    onClick={() => copyToClipboard(transaction.hash)}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="text-sm font-medium">
                  {transaction.status === 'pending' ? 'Pending' : 'Confirmed'}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            {transaction.hash && (
              <a 
                href={`https://goerli.etherscan.io/tx/${transaction.hash}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            )}
            <Button 
              onClick={closeTransactionModal}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium transition-colors"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
