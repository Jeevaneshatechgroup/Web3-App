import { ethers } from "ethers";
import type { Candidate } from "@/types";

// This is the ABI (Application Binary Interface) of the deployed voting contract
const votingABI = [
  "function vote(uint256 candidateId) external",
  "function hasVoted(address voter) external view returns (bool)",
  "function getCandidateCount() external view returns (uint256)",
  "function getCandidate(uint256 id) external view returns (uint256 id, string name, string description, string imageUrl, uint256 voteCount)",
  "function getTotalVotes() external view returns (uint256)"
];

// The address of the deployed voting contract
// In production, this could be stored in environment variables
// Using a dummy contract address for testing purposes
// This is a real contract that exists on Ethereum mainnet (USDC)
const CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getContract = async () => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, votingABI, signer);
};

export const getReadOnlyContract = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, votingABI, provider);
};

export const checkIfAccountHasVoted = async (account: string): Promise<boolean> => {
  try {
    const contract = getReadOnlyContract();
    return await contract.hasVoted(account);
  } catch (error) {
    console.error("Error checking if user has voted:", error);
    return false;
  }
};

export const castVote = async (candidateId: number): Promise<string> => {
  try {
    const contract = await getContract();
    const tx = await contract.vote(candidateId);
    return tx.hash;
  } catch (error) {
    console.error("Error casting vote:", error);
    throw error;
  }
};

export const getCandidates = async (): Promise<Candidate[]> => {
  try {
    const contract = getReadOnlyContract();
    const count = await contract.getCandidateCount();
    
    const candidates: Candidate[] = [];
    
    for (let i = 1; i <= count; i++) {
      const candidate = await contract.getCandidate(i);
      candidates.push({
        id: Number(candidate.id),
        name: candidate.name,
        description: candidate.description,
        imageUrl: candidate.imageUrl,
        voteCount: Number(candidate.voteCount)
      });
    }
    
    return candidates;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

export const getTotalVotes = async (): Promise<number> => {
  try {
    const contract = getReadOnlyContract();
    const total = await contract.getTotalVotes();
    return Number(total);
  } catch (error) {
    console.error("Error getting total votes:", error);
    return 0;
  }
};

export const getNetwork = async (): Promise<string> => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const networkName = network.name;
    
    if (networkName === "goerli") {
      return "Ethereum Goerli Testnet";
    } else if (networkName === "mainnet") {
      return "Ethereum Mainnet";
    } else {
      return networkName;
    }
  } catch (error) {
    console.error("Error getting network:", error);
    return "Unknown Network";
  }
};

export const getContractAddress = (): string => {
  return CONTRACT_ADDRESS;
};
