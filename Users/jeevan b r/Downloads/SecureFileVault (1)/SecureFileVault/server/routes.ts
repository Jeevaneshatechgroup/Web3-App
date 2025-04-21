import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFileSchema, 
  insertFileShareSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByWalletAddress(userData.walletAddress);
      
      if (existingUser) {
        if (existingUser && (!existingUser.did || !existingUser.didDocument) && userData.did && userData.didDocument) {
          const updatedUser = await storage.updateUser(existingUser.id, {
            did: userData.did,
            didDocument: userData.didDocument
          });
          
          if (updatedUser) {
            const { password, ...userWithoutPassword } = updatedUser;
            return res.status(200).json(userWithoutPassword);
            
          }
        }
        
        const { password, ...userWithoutPassword } = existingUser;
        return res.status(200).json(userWithoutPassword);
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/wallet/:address", async (req, res) => {
    try {
        const walletAddress = req.params.address;
        const user = await storage.getUserByWalletAddress(walletAddress);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: "Failed to get user" });
        console.log(`Requesting: http://localhost:5001/api/users/wallet/${walletAddress}`);

    }
});

  

  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/files/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const files = await storage.getFilesByUserId(userId);
      const filesWithoutContent = files.map(({ content, ...fileWithoutContent }) => fileWithoutContent);
      res.json(filesWithoutContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to get files" });
    }
  });

  app.get("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to get file" });
    }
  });

  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const success = await storage.deleteFile(fileId);
      if (success) {
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete file" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.patch("/api/files/:id/mint", async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const { ipfsHash, nftMetadata } = req.body;
      if (!ipfsHash || !nftMetadata) {
        return res.status(400).json({ message: "IPFS hash and NFT metadata are required" });
      }
      
      const updatedFile = await storage.updateFile(fileId, { 
        ipfsHash, 
        nftMetadata, 
        isNft: true 
      });
      
      if (updatedFile) {
        const { content, ...fileWithoutContent } = updatedFile;
        res.json(fileWithoutContent);
      } else {
        res.status(500).json({ message: "Failed to update file" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mint file as NFT" });
    }
  });

  app.post("/api/shares", async (req: Request, res: Response) => {
    try {
      const requestData = { ...req.body };
      
      if (requestData.expiresAt && typeof requestData.expiresAt === 'string') {
        try {
          requestData.expiresAt = new Date(requestData.expiresAt);
          console.log('Converted expiresAt string to Date:', requestData.expiresAt);
        } catch (dateError) {
          console.error('Error parsing date string:', dateError);
          return res.status(400).json({ 
            message: "Invalid date format for expiresAt", 
            detail: "The date should be a valid ISO string"
          });
        }
      }
      
      const shareData = insertFileShareSchema.parse(requestData);
      
      const file = await storage.getFile(shareData.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const share = await storage.createFileShare(shareData);
      res.status(201).json(share);
    } catch (error) {
      console.error('Share creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid share data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to share file" });
    }
  });

  app.get("/api/shares/file/:fileId", async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.fileId);
      if (isNaN(fileId)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const shares = await storage.getFileSharesByFileId(fileId);
      res.json(shares);
    } catch (error) {
      res.status(500).json({ message: "Failed to get file shares" });
    }
  });

  app.get("/api/shares/wallet/:walletAddress", async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.walletAddress;
      const shares = await storage.getFileSharesByWalletAddress(walletAddress);
      
      const sharedFiles = await Promise.all(
        shares.map(async (share) => {
          const file = await storage.getFile(share.fileId);
          if (!file) return null;
          
          const { content, ...fileWithoutContent } = file;
          return {
            share,
            file: fileWithoutContent,
          };
        })
      );
      
      res.json(sharedFiles.filter(Boolean));
    } catch (error) {
      res.status(500).json({ message: "Failed to get shared files" });
    }
  });

  app.delete("/api/shares/:id", async (req: Request, res: Response) => {
    try {
      const shareId = parseInt(req.params.id);
      if (isNaN(shareId)) {
        return res.status(400).json({ message: "Invalid share ID" });
      }
      
      const share = await storage.getFileShare(shareId);
      if (!share) {
        return res.status(404).json({ message: "Share not found" });
      }
      
      const success = await storage.deleteFileShare(shareId);
      if (success) {
        res.json({ message: "File share deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete file share" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file share" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
