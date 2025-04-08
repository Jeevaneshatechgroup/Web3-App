import { Card, CardContent } from "@/components/ui/card";

type TransactionSuccessProps = {
  txHash: string;
  nftData: {
    id: number;
    name: string;
    ipfsHash: string;
    imageUrl: string;
    metadataUrl: string;
  } | null;
  network: string;
};

const TransactionSuccess = ({ txHash, nftData, network }: TransactionSuccessProps) => {
  // Generate blockchain explorer URL based on network
  const getExplorerUrl = () => {
    // This is a simplified version, in production you'd need to handle different networks
    if (network === "ethereum") {
      return `https://etherscan.io/tx/${txHash}`;
    } else if (network === "polygon") {
      return `https://polygonscan.com/tx/${txHash}`;
    } else {
      return `https://etherscan.io/tx/${txHash}`;
    }
  };

  return (
    <Card className="mt-8">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-md p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">NFT Successfully Minted!</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Your NFT has been minted and is now on the blockchain.</p>
            </div>
            <div className="mt-3">
              <div className="flex space-x-4">
                <a 
                  href={getExplorerUrl()} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Transaction
                </a>
                {nftData?.metadataUrl && (
                  <a 
                    href={nftData.metadataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Metadata
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionSuccess;
