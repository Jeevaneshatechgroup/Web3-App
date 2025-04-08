import { nfts, users, type User, type InsertUser, type NFT, type InsertNFT } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // NFT related methods
  getNFTsByWalletAddress(walletAddress: string): Promise<NFT[]>;
  getNFT(id: number): Promise<NFT | undefined>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFTTransactionHash(id: number, transactionHash: string): Promise<NFT | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nftItems: Map<number, NFT>;
  currentUserId: number;
  currentNftId: number;

  constructor() {
    this.users = new Map();
    this.nftItems = new Map();
    this.currentUserId = 1;
    this.currentNftId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNFTsByWalletAddress(walletAddress: string): Promise<NFT[]> {
    return Array.from(this.nftItems.values()).filter(
      (nft) => nft.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nftItems.get(id);
  }

  async createNFT(insertNFT: InsertNFT): Promise<NFT> {
    const id = this.currentNftId++;
    const createdAt = new Date();
    const nft: NFT = { ...insertNFT, id, createdAt };
    this.nftItems.set(id, nft);
    return nft;
  }

  async updateNFTTransactionHash(id: number, transactionHash: string): Promise<NFT | undefined> {
    const nft = await this.getNFT(id);
    if (!nft) return undefined;
    
    const updatedNFT: NFT = {
      ...nft,
      transactionHash
    };
    
    this.nftItems.set(id, updatedNFT);
    return updatedNFT;
  }
}

export const storage = new MemStorage();
