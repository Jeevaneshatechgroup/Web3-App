import { Button } from "@/components/ui/button";
import { useMintNFT } from "@/hooks/useMintNFT";
import { useExodusWallet } from "@/hooks/useExodusWallet";
import { useToast } from "@/hooks/use-toast";

type MintingActionProps = {
  file: File | null;
  metadata: {
    name: string;
    description: string;
    attributes: { trait_type: string; value: string }[];
  };
  onMintingComplete: (nftData: any) => void;
  isFormValid: boolean;
};

const MintingAction = ({
  file,
  metadata,
  onMintingComplete,
  isFormValid,
}: MintingActionProps) => {
  const { mintNFT, status, currentStep, error } = useMintNFT();
  const { isConnected, connectWallet } = useExodusWallet();
  const { toast } = useToast();

  const handleMintClick = async () => {
    if (!file || !isFormValid) return;
    
    if (!isConnected) {
      try {
        await connectWallet();
        toast({
          title: "Wallet Connected",
          description: "Please click 'Mint NFT' again to proceed with minting",
        });
        return;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect to Exodus wallet. Please ensure the browser extension is installed and unlocked.",
        });
        return;
      }
    }
    
    try {
      const result = await mintNFT(file, metadata);
      if (result) {
        onMintingComplete(result);
      }
    } catch (error) {
      console.error("Minting failed", error);
      toast({
        variant: "destructive",
        title: "Minting Failed",
        description: "There was an error while minting your NFT. Please try again.",
      });
    }
  };

  const isMinting = status === "uploading" || status === "creating-metadata" || status === "minting";
  const isError = status === "error";

  const getStepStatus = (step: number) => {
    if (currentStep > step) return "completed";
    if (currentStep === step) return "active";
    return "pending";
  };

  return (
    <div className="py-4">
      {isError ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Minting Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || "There was an error during the minting process. Please try again."}</p>
                  {error && error.includes("Pinata API credentials") && (
                    <p className="mt-2">
                      There seems to be an issue with the IPFS storage service. Please contact the administrator.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleMintClick}
            disabled={!file || !isFormValid}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Try Again
          </Button>
        </div>
      ) : !isMinting ? (
        <div>
          <div className="px-4 py-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-primary/20 shadow-sm">
            <h3 className="text-lg font-semibold text-center mb-3">Ready to Mint Your NFT</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              Your file will be uploaded to IPFS via Pinata and minted as an NFT
            </p>
            <Button 
              onClick={handleMintClick}
              disabled={!file || !isFormValid}
              className="w-full inline-flex justify-center items-center px-5 py-4 border border-transparent text-lg font-medium rounded-md shadow-md text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Mint NFT on IPFS
            </Button>
            {!isFormValid && (
              <p className="mt-3 text-xs text-amber-600 text-center">
                Please complete all required fields in the metadata form before minting.
              </p>
            )}
            {!file && (
              <p className="mt-3 text-xs text-amber-600 text-center">
                Please upload a file first using the upload section above.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
            <div className="space-y-3">
              {/* Step 1: Upload file to IPFS */}
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 relative">
                  <span className="absolute inset-0 flex items-center justify-center">
                    {getStepStatus(1) === "completed" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : getStepStatus(1) === "active" ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
                    )}
                  </span>
                </div>
                <p className={`ml-3 text-sm font-medium ${getStepStatus(1) === "pending" ? "text-gray-500" : "text-gray-800"}`}>
                  Uploading file to IPFS via Pinata
                  {getStepStatus(1) === "completed" && (
                    <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stored on IPFS
                    </span>
                  )}
                </p>
              </div>
              
              {/* Step 2: Create metadata */}
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 relative">
                  <span className="absolute inset-0 flex items-center justify-center">
                    {getStepStatus(2) === "completed" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : getStepStatus(2) === "active" ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
                    )}
                  </span>
                </div>
                <p className={`ml-3 text-sm font-medium ${getStepStatus(2) === "pending" ? "text-gray-500" : "text-gray-800"}`}>
                  Creating metadata on IPFS
                  {getStepStatus(2) === "completed" && (
                    <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Stored on IPFS
                    </span>
                  )}
                </p>
              </div>
              
              {/* Step 3: Minting NFT */}
              <div className="flex items-center">
                <div className="flex-shrink-0 h-5 w-5 relative">
                  <span className="absolute inset-0 flex items-center justify-center">
                    {getStepStatus(3) === "completed" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : getStepStatus(3) === "active" ? (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <span className="h-2 w-2 bg-gray-300 rounded-full"></span>
                    )}
                  </span>
                </div>
                <p className={`ml-3 text-sm font-medium ${getStepStatus(3) === "pending" ? "text-gray-500" : "text-gray-800"}`}>
                  Minting NFT
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Please wait while we process your request and confirm the transaction.
            <br/>This might take a few moments.
          </p>
        </div>
      )}
    </div>
  );
};

export default MintingAction;
