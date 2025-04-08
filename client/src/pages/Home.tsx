import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useExodusWallet } from "@/hooks/useExodusWallet";
import FileUpload from "@/components/FileUpload";
import MetadataForm from "@/components/MetadataForm";
import MintingAction from "@/components/MintingAction";
import TransactionSuccess from "@/components/TransactionSuccess";
import NFTCollection from "@/components/NFTCollection";
import WalletDebugger from "@/components/WalletDebugger";
import IPFSStatus from "@/components/IPFSStatus";
import { NFTAttribute } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUploadSchema } from "@shared/schema";
import { z } from "zod";

const Home = () => {
  const { isConnected, walletAddress } = useExodusWallet();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{
    name: string;
    description: string;
    attributes: NFTAttribute[];
  }>({
    name: "",
    description: "",
    attributes: [],
  });
  const [activeTab, setActiveTab] = useState<string>("create");
  const [mintingSuccess, setMintingSuccess] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleMetadataChange = (updatedMetadata: {
    name: string;
    description: string;
    attributes: NFTAttribute[];
  }) => {
    setMetadata(updatedMetadata);
    
    // Validate metadata
    const result = fileUploadSchema.safeParse(updatedMetadata);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleMintingComplete = (nftData: any) => {
    setMintingSuccess(true);
    setMintedNFT(nftData);
  };

  const isFormValid = metadata.name.trim() !== "" && 
                       metadata.description.trim() !== "" && 
                       validationErrors.length === 0;

  return (
    <Card className="bg-white shadow sm:rounded-lg overflow-hidden">
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b border-gray-200 w-full">
          <TabsTrigger value="create">Create NFT</TabsTrigger>
          <TabsTrigger value="collection">My NFTs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="p-6">
          {isConnected ? (
            <div className="space-y-8">
              <div className="mb-6">
                <IPFSStatus />
              </div>
                
              <FileUpload onFileSelect={handleFileSelect} />
              
              <MetadataForm onMetadataChange={handleMetadataChange} />
              
              <MintingAction 
                file={file} 
                metadata={metadata} 
                onMintingComplete={handleMintingComplete}
                isFormValid={isFormValid}
              />
            </div>
          ) : (
            <div className="py-12">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Connect your wallet to get started</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You need to connect your Exodus wallet to mint NFTs.
                </p>
                <div className="mt-6">
                  <button 
                    onClick={() => {
                      const button = window.document.querySelector('header button');
                      if (button && button instanceof HTMLButtonElement) {
                        button.click();
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collection" className="p-6">
          <NFTCollection walletAddress={walletAddress} />
        </TabsContent>
      </Tabs>
      
      {mintingSuccess && mintedNFT && (
        <div className="px-6 pb-6">
          <TransactionSuccess 
            txHash={mintedNFT.txHash || mintedNFT.transactionHash} 
            nftData={mintedNFT}
            network="ethereum"
          />
        </div>
      )}
    </Card>
  );
};

export default Home;
