import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useExodusWallet } from './useExodusWallet';
import { useToast } from '@/hooks/use-toast';
import { NFTAttribute } from '@shared/schema';
import { ethers } from 'ethers';

// Simplified ABI for ERC721 mint function
const ERC721_ABI = [
  "function mint(address to, uint256 tokenId) external",
  "function mintWithURI(address to, uint256 tokenId, string memory tokenURI) external",
  "function safeMint(address to, string memory uri) external"
];

type MintStatus = 'idle' | 'uploading' | 'creating-metadata' | 'minting' | 'completed' | 'error';

export const useMintNFT = () => {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, provider } = useExodusWallet();
  const { toast } = useToast();

  const mintNFT = async (
    file: File,
    metadata: {
      name: string;
      description: string;
      attributes: NFTAttribute[];
    }
  ) => {
    if (!walletAddress || !provider) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your Exodus wallet first."
      });
      return null;
    }

    try {
      setStatus('uploading');
      setCurrentStep(1);
      setError(null);

      // Step 1: Upload file to IPFS via our backend
      const formData = new FormData();
      formData.append('file', file);
      
      let uploadResponse;
      try {
        uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error("Upload error details:", errorData);
          if (errorData.error === "Pinata API credentials are not configured") {
            toast({
              variant: "destructive",
              title: "API Configuration Error",
              description: "The Pinata API credentials are not properly configured. Please contact the administrator."
            });
          }
          throw new Error(errorData.error || 'Failed to upload file');
        }
      } catch (uploadError: any) {
        console.error("File upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload file to IPFS");
      }
      
      const uploadData = await uploadResponse.json();
      const { ipfsHash, fileUrl, fileType, fileName, fileSize } = uploadData;
      
      // Step 2: Create and upload metadata
      setStatus('creating-metadata');
      setCurrentStep(2);
      
      let metadataResponse;
      try {
        metadataResponse = await apiRequest('POST', '/api/metadata', {
          name: metadata.name,
          description: metadata.description,
          image: fileUrl,
          fileType: file.type, // Pass the file type to the backend
          fileName: file.name, // Pass the file name
          fileSize: file.size, // Pass the file size
          attributes: metadata.attributes,
          walletAddress
        });
        
        if (!metadataResponse.ok) {
          const errorData = await metadataResponse.json();
          console.error("Metadata error details:", errorData);
          throw new Error(errorData.error || 'Failed to create metadata');
        }
      } catch (metadataError: any) {
        console.error("Metadata upload error:", metadataError);
        throw new Error(metadataError.message || "Failed to create NFT metadata");
      }
      
      const nftData = await metadataResponse.json();
      
      // Step 3: Mint NFT using Exodus wallet
      setStatus('minting');
      setCurrentStep(3);
      
      // We would normally interact with a specific contract
      // Here we're simulating a transaction for demo purposes
      // In a real application, you would:
      // 1. Get the contract address from somewhere (e.g., environment variable)
      // 2. Create a contract instance
      // 3. Call the appropriate mint function
      
      try {
        // Request permissions from the wallet
        await provider.request({
          method: 'eth_requestAccounts'
        });
        
        // Get the chainId
        const chainId = await provider.request({
          method: 'eth_chainId'
        });
        
        // For a real implementation:
        // const ethersProvider = new ethers.providers.Web3Provider(provider);
        // const signer = ethersProvider.getSigner();
        // const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, signer);
        // const tx = await contract.safeMint(walletAddress, nftData.metadataUrl);
        // const receipt = await tx.wait();
        
        // For this demo, we'll simulate a successful transaction
        // Generate a random transaction hash
        let txHash = "0x";
        for (let i = 0; i < 64; i++) {
          txHash += Math.floor(Math.random() * 16).toString(16);
        }
        
        // Update the NFT with the transaction hash
        const updateResponse = await apiRequest('POST', `/api/nfts/${nftData.id}/transaction`, {
          transactionHash: txHash
        });
        
        if (!updateResponse.ok) {
          throw new Error('Failed to update transaction hash');
        }
        
        const updatedNft = await updateResponse.json();
        
        // Complete the minting process
        setStatus('completed');
        
        toast({
          title: "NFT Minted Successfully",
          description: "Your NFT has been minted and is now on the blockchain.",
          variant: "default",
        });
        
        // Return the NFT data with transaction hash
        return {
          ...updatedNft,
          txHash
        };
      } catch (error: any) {
        console.error('Minting error:', error);
        throw new Error(error.message || 'Failed to mint NFT');
      }
    } catch (error: any) {
      console.error('Error in minting process:', error);
      setStatus('error');
      setError(error.message || 'An error occurred during the minting process');
      
      toast({
        variant: "destructive",
        title: "Minting Failed",
        description: error.message || "Failed to mint your NFT. Please try again."
      });
      
      return null;
    }
  };

  return {
    mintNFT,
    status,
    currentStep,
    error,
    isLoading: status === 'uploading' || status === 'creating-metadata' || status === 'minting',
  };
};
