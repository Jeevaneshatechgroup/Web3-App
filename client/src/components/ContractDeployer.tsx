import { useState } from 'react';
import { ethers } from 'ethers';
import { setContractAddress, getContractAddress } from '@/lib/contract';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import BlogRegistryArtifact from '../artifacts/contracts/BlogRegistry.sol/BlogRegistry.json';
import { useToast } from '@/hooks/use-toast';

export default function ContractDeployer() {
  const { isConnected } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [contractAddr, setContractAddr] = useState(getContractAddress());
  const { toast } = useToast();

  const deployContract = async () => {
    if (!window.ethereum) {
      toast({
        title: 'No Web3 Provider',
        description: 'Please install an Ethereum wallet like Exodus or MetaMask.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeploying(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Deploy the contract
      const contractFactory = new ethers.ContractFactory(
        BlogRegistryArtifact.abi,
        BlogRegistryArtifact.bytecode,
        signer
      );
      
      const contract = await contractFactory.deploy();
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      
      // Save the contract address
      setContractAddress(address);
      setContractAddr(address);
      
      toast({
        title: 'Contract Deployed!',
        description: `Contract successfully deployed at ${address}`,
      });
    } catch (error: any) {
      console.error('Error deploying contract:', error);
      toast({
        title: 'Deployment Failed',
        description: error.message || 'Failed to deploy contract',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card className="bg-white shadow rounded-lg mb-6">
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Smart Contract Deployment</h2>
        
        {contractAddr ? (
          <Alert className="bg-green-50 border border-green-200 text-green-800 rounded-md mb-4">
            <AlertDescription>
              <div className="space-y-2">
                <p>Contract already deployed!</p>
                <p className="font-mono text-xs break-all">
                  Contract Address: {contractAddr}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md mb-4">
            <AlertDescription>
              <p>No contract has been deployed yet. Deploy a new contract to use blockchain storage for blog posts.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={deployContract}
          disabled={isDeploying || !!contractAddr}
          className="w-full bg-primary hover:bg-blue-600 text-white"
        >
          {isDeploying
            ? "Deploying..."
            : contractAddr
            ? "Already Deployed"
            : "Deploy Blog Contract"}
        </Button>
      </CardContent>
    </Card>
  );
}