import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContractAddress, setContractAddress, getProvider } from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

// Import the contract artifact
import BlogRegistryArtifact from "../artifacts/contracts/BlogRegistry.sol/BlogRegistry.json";

export default function AutoContractDeployer() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [contractAddress, setLocalContractAddress] = useState<string>("");
  const { toast } = useToast();
  const { isConnected } = useWallet();
  
  // Check if contract is already deployed
  useEffect(() => {
    const savedAddress = getContractAddress();
    if (savedAddress) {
      setLocalContractAddress(savedAddress);
    } else if (isConnected) {
      // Auto-deploy if wallet is connected and no contract exists
      deployContract();
    }
  }, [isConnected]);
  
  const deployContract = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy the contract.",
        variant: "destructive",
      });
      return;
    }
    
    const provider = getProvider();
    if (!provider) {
      toast({
        title: "Provider not available",
        description: "Unable to get Ethereum provider.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Get signer from provider
      const signer = await provider.getSigner();
      
      // Create contract factory with ABI and bytecode
      const contractFactory = new ethers.ContractFactory(
        BlogRegistryArtifact.abi,
        BlogRegistryArtifact.bytecode,
        signer
      );
      
      toast({
        title: "Deploying contract",
        description: "Please approve the transaction in your wallet...",
      });
      
      // Deploy the contract
      const contract = await contractFactory.deploy();
      
      // Wait for deployment to finish
      await contract.waitForDeployment();
      
      // Get the contract address
      const address = await contract.getAddress();
      
      // Save address to local storage
      setContractAddress(address);
      setLocalContractAddress(address);
      
      toast({
        title: "Contract deployed successfully",
        description: `Contract address: ${address}`,
      });
    } catch (error) {
      console.error("Error deploying contract:", error);
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Failed to deploy contract",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  // Don't render anything visible
  return null;
}