import { ethers } from 'ethers';
import BlogRegistryArtifact from '../artifacts/contracts/BlogRegistry.sol/BlogRegistry.json';
import { BlogPost } from '@/types';

// Contract address will be set after deployment
// Default to a placeholder until we get the real address
let contractAddress = localStorage.getItem('CONTRACT_ADDRESS') || '';

// Set the contract address (used after deployment)
export function setContractAddress(address: string) {
  contractAddress = address;
  localStorage.setItem('CONTRACT_ADDRESS', address);
}

// Get the contract address
export function getContractAddress(): string {
  return contractAddress;
}

// Get an ethers provider
export function getProvider(): ethers.BrowserProvider | null {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

// Get a contract instance connected to the current wallet
export async function getContractWithSigner() {
  if (!contractAddress) {
    throw new Error('Contract address not set. Please deploy the contract first.');
  }

  const provider = getProvider();
  if (!provider) {
    throw new Error('No provider available. Please install an Ethereum wallet like MetaMask.');
  }

  try {
    const signer = await provider.getSigner();
    return new ethers.Contract(
      contractAddress,
      BlogRegistryArtifact.abi,
      signer
    );
  } catch (error) {
    console.error("Error getting signer:", error);
    throw new Error('Failed to get wallet signer. Please make sure your wallet is connected.');
  }
}

// Get a contract instance for read-only operations
export function getContractReadOnly() {
  if (!contractAddress) {
    throw new Error('Contract address not set. Please deploy the contract first.');
  }

  const provider = getProvider();
  if (!provider) {
    throw new Error('No provider available. Please install an Ethereum wallet like MetaMask.');
  }

  try {
    return new ethers.Contract(
      contractAddress,
      BlogRegistryArtifact.abi,
      provider
    );
  } catch (error) {
    console.error("Error creating contract instance:", error);
    throw new Error('Failed to create contract instance. Please check your connection.');
  }
}

// Create a new blog post using the smart contract
export async function createBlogPost(post: Omit<BlogPost, 'ipfsHash'>, ipfsHash: string): Promise<string> {
  const contract = await getContractWithSigner();
  
  try {
    const tx = await contract.createPost(ipfsHash, post.title);
    const receipt = await tx.wait();
    
    // The contract emits a PostCreated event
    const event = receipt.logs.find((log: any) => 
      log.fragment && log.fragment.name === 'PostCreated'
    );
    
    if (event) {
      return ipfsHash;
    } else {
      throw new Error('Transaction successful but event not found');
    }
  } catch (error: any) {
    console.error('Error creating blog post on blockchain:', error);
    throw new Error(error.message || 'Failed to create blog post on blockchain');
  }
}

// Get all post hashes from the smart contract
export async function getAllPostHashes(): Promise<string[]> {
  try {
    if (!contractAddress) {
      return [];
    }
    
    const contract = getContractReadOnly();
    return await contract.getAllPosts();
  } catch (error) {
    console.error('Error fetching post hashes from blockchain:', error);
    return [];
  }
}

// Get paginated post hashes
export async function getPaginatedPostHashes(offset: number = 0, limit: number = 10): Promise<string[]> {
  try {
    if (!contractAddress) {
      return [];
    }
    
    const contract = getContractReadOnly();
    return await contract.getPaginatedPosts(offset, limit);
  } catch (error) {
    console.error('Error fetching paginated posts from blockchain:', error);
    return [];
  }
}

// Get post hashes by author address
export async function getPostHashesByAuthor(authorAddress: string): Promise<string[]> {
  try {
    if (!contractAddress) {
      return [];
    }
    
    const contract = getContractReadOnly();
    return await contract.getPostsByAuthor(authorAddress);
  } catch (error) {
    console.error('Error fetching author posts from blockchain:', error);
    return [];
  }
}

// Get post count
export async function getPostCount(): Promise<number> {
  try {
    if (!contractAddress) {
      return 0;
    }
    
    const contract = getContractReadOnly();
    const count = await contract.getPostCount();
    return Number(count);
  } catch (error) {
    console.error('Error fetching post count from blockchain:', error);
    return 0;
  }
}