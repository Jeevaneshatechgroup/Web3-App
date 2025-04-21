import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { createDID, DecentralizedID } from './did';
import { 
  DecentralizedIdentityFactoryABI, 
  DecentralizedIdentityNFTABI,
  DecentralizedFileSharingABI 
} from './contracts/contractAbi';
import { 
  getContractAddress, 
  getNetworkInfo,
  LOCAL_HARDHAT_CHAIN_ID
} from './contracts/contractAddresses';


export interface ConnectedWallet {
  address: string;
  provider: ethers.BrowserProvider;  
  signer: ethers.JsonRpcSigner;  
  chainId: number;
  network: string;
  did: DecentralizedID;
  walletType: 'exodus' | 'other' | 'algorand';  
}


export function isExodusWallet(): boolean {
  if (typeof window === 'undefined') return false;
  
 
  if (window.exodus) return true;

  return false;
}

export async function getProvider(): Promise<ethers.BrowserProvider | null> {
  if (typeof window === 'undefined') return null;
  
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  
  
  if (window.Algorand) {
    return new AlgorandProvider(window.Algorand); 
  }
  
  return null;
}


const createMockWallet = async (): Promise<ConnectedWallet> => {
  const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; 
  const did = createDID(address);
  const mockProvider = {} as unknown as ethers.BrowserProvider;  
  const mockSigner = {} as unknown as ethers.JsonRpcSigner;  
  
  return {
    address,
    provider: mockProvider,
    signer: mockSigner,
    chainId: 1,
    network: "Ethereum Mainnet (Demo)",
    did,
    walletType: 'exodus' 
  };
};


export async function connectWallet(): Promise<ConnectedWallet | null> {
  try {
    const provider = await getProvider();
    if (!provider) return null;

    
    const accounts = await provider.send("eth_requestAccounts", []);  
    if (!accounts || accounts.length === 0) return null;

    const address = accounts[0];
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const did = createDID(address);
    const walletType = isExodusWallet() ? 'exodus' : 'other';

    
    if (window.Algorand) {
      return {
        address,
        provider,
        signer,
        chainId,
        network: 'Algorand',
        did,
        walletType: 'algorand'
      };
    }

    return {
      address,
      provider,
      signer,
      chainId,
      network: 'Ethereum Mainnet',
      did,
      walletType
    };

  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
};

export async function registerDID(wallet: ConnectedWallet): Promise<any> {
  try {
    if (wallet.walletType === 'algorand') {
      return null; 
    }

    const factoryAddress = getContractAddress('DecentralizedIdentityFactory', wallet.chainId);
    const factoryContract = new ethers.Contract(factoryAddress, DecentralizedIdentityFactoryABI, wallet.signer);
    return await factoryContract.registerDID(wallet.did.did);

  } catch (error) {
    console.error('Failed to register DID:', error);
    return null;
  }
};

export async function mintNFT(tokenURI: string, encryptedContentHash: string, wallet: ConnectedWallet): Promise<any> {
  try {
    if (wallet.walletType === 'algorand') {
      return null; 
    }

    const factoryAddress = getContractAddress('DecentralizedIdentityFactory', wallet.chainId);
    const factoryContract = new ethers.Contract(factoryAddress, DecentralizedIdentityFactoryABI, wallet.signer);
    return await factoryContract.mintFileNFT(tokenURI, encryptedContentHash);

  } catch (error) {
    console.error('Failed to mint NFT:', error);
    return null;
  }
};

export function useWallet() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);
      const connectedWallet = await connectWallet();
      setWallet(connectedWallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(null);
      } else if (wallet && accounts[0] !== wallet.address) {
        connect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet]);

  return { wallet, loading, error, connect, disconnect };
}
