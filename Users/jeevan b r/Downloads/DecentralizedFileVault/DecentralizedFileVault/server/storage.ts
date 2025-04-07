import { files, type File, type InsertFile, users, type User, type InsertUser, fileAccess, type FileAccess, type InsertFileAccess, type FileWithAccess } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByCid(ipfsCid: string): Promise<File | undefined>;
  getFilesByOwnerId(ownerId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<boolean>;
  
  // File access operations
  getFileAccess(fileId: number): Promise<FileAccess[]>;
  createFileAccess(access: InsertFileAccess): Promise<FileAccess>;
  deleteFileAccess(id: number): Promise<boolean>;
  getFilesSharedWithWalletAddress(walletAddress: string): Promise<File[]>;
  getFileWithAccess(fileId: number): Promise<FileWithAccess | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private fileAccesses: Map<number, FileAccess>;
  private userIdCounter: number;
  private fileIdCounter: number;
  private fileAccessIdCounter: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.fileAccesses = new Map();
    this.userIdCounter = 1;
    this.fileIdCounter = 1;
    this.fileAccessIdCounter = 1;
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
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByCid(ipfsCid: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.ipfsCid === ipfsCid,
    );
  }

  async getFilesByOwnerId(ownerId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.ownerId === ownerId,
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date();
    const file: File = { ...insertFile, id, uploadedAt: now };
    this.files.set(id, file);
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    // Also delete all file access records for this file
    const accessesToDelete = Array.from(this.fileAccesses.values()).filter(
      (access) => access.fileId === id,
    );
    
    for (const access of accessesToDelete) {
      this.fileAccesses.delete(access.id);
    }
    
    return this.files.delete(id);
  }

  // File access operations
  async getFileAccess(fileId: number): Promise<FileAccess[]> {
    return Array.from(this.fileAccesses.values()).filter(
      (access) => access.fileId === fileId,
    );
  }

  async createFileAccess(insertAccess: InsertFileAccess): Promise<FileAccess> {
    const id = this.fileAccessIdCounter++;
    const now = new Date();
    const access: FileAccess = { ...insertAccess, id, createdAt: now };
    this.fileAccesses.set(id, access);
    return access;
  }

  async deleteFileAccess(id: number): Promise<boolean> {
    return this.fileAccesses.delete(id);
  }

  async getFilesSharedWithWalletAddress(walletAddress: string): Promise<File[]> {
    const accessRecords = Array.from(this.fileAccesses.values()).filter(
      (access) => access.sharedWithWalletAddress === walletAddress,
    );
    
    const fileIds = accessRecords.map((access) => access.fileId);
    
    return Array.from(this.files.values()).filter(
      (file) => fileIds.includes(file.id),
    );
  }

  async getFileWithAccess(fileId: number): Promise<FileWithAccess | undefined> {
    const file = await this.getFile(fileId);
    if (!file) return undefined;
    
    const access = await this.getFileAccess(fileId);
    
    return {
      ...file,
      access,
    };
  }
}

export const storage = new MemStorage();
