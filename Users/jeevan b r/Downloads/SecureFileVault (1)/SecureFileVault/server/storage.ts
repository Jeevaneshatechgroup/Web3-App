import { 
  users, type User, type InsertUser, 
  files, type File, type InsertFile,
  fileShares, type FileShare, type InsertFileShare
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByUserId(userId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // File sharing operations
  getFileShare(id: number): Promise<FileShare | undefined>;
  getFileSharesByFileId(fileId: number): Promise<FileShare[]>;
  getFileSharesByWalletAddress(walletAddress: string): Promise<FileShare[]>;
  createFileShare(fileShare: InsertFileShare): Promise<FileShare>;
  deleteFileShare(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private fileShares: Map<number, FileShare>;
  
  userCurrentId: number;
  fileCurrentId: number;
  fileShareCurrentId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.fileShares = new Map();
    
    this.userCurrentId = 1;
    this.fileCurrentId = 1;
    this.fileShareCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }
  
  async getFilesByUserId(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId,
    );
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileCurrentId++;
    const now = new Date();
    const file: File = { 
      ...insertFile, 
      id, 
      isNft: false, 
      nftMetadata: null,
      uploadedAt: now 
    };
    this.files.set(id, file);
    return file;
  }
  
  async updateFile(id: number, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  
  async deleteFile(id: number): Promise<boolean> {
    // Delete associated file shares first
    const fileSharesToDelete = Array.from(this.fileShares.values()).filter(
      (share) => share.fileId === id
    );
    
    for (const share of fileSharesToDelete) {
      this.fileShares.delete(share.id);
    }
    
    return this.files.delete(id);
  }
  
  // File sharing operations
  async getFileShare(id: number): Promise<FileShare | undefined> {
    return this.fileShares.get(id);
  }
  
  async getFileSharesByFileId(fileId: number): Promise<FileShare[]> {
    return Array.from(this.fileShares.values()).filter(
      (share) => share.fileId === fileId
    );
  }
  
  async getFileSharesByWalletAddress(walletAddress: string): Promise<FileShare[]> {
    return Array.from(this.fileShares.values()).filter(
      (share) => share.sharedToWalletAddress === walletAddress
    );
  }
  
  async createFileShare(insertFileShare: InsertFileShare): Promise<FileShare> {
    const id = this.fileShareCurrentId++;
    const now = new Date();
    const fileShare: FileShare = { ...insertFileShare, id, createdAt: now };
    this.fileShares.set(id, fileShare);
    return fileShare;
  }
  
  async deleteFileShare(id: number): Promise<boolean> {
    return this.fileShares.delete(id);
  }
}

export const storage = new MemStorage();
