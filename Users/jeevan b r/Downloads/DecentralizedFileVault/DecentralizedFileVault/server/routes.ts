import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema, insertFileAccessSchema, walletUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";

// Define the extended Request type with file property
interface RequestWithFile extends Request {
  file?: {
    path: string;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

// Create uploads directory
const uploadsDir = path.join(os.tmpdir(), "ipfs-uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({ dest: uploadsDir });

// Pinata API configuration with environment variables
const pinataApiKey ="06a7f443e87c11c1a0e9";
const pinataSecretApiKey = "4aebc79982a6c31252b19f1a232eb360275de0df1e0f9b0de5485ba486a87f45";
const pinataBaseUrl = process.env.PINATA_API_URL || "https://api.pinata.cloud";
const pinataGatewayUrl = process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/";

// Log configuration on startup
console.log("Pinata configuration:");
console.log("- API URL:", pinataBaseUrl);
console.log("- Gateway URL:", pinataGatewayUrl);
console.log("- API Key Available:", !!pinataApiKey);
console.log("- Secret API Key Available:", !!pinataSecretApiKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // User authentication & wallet connection
  app.post("/api/auth/wallet-connect", async (req: Request, res: Response) => {
    try {
      const walletData = walletUserSchema.parse(req.body);
      
      // Check if user exists, if not create new user
      let user = await storage.getUserByWalletAddress(walletData.walletAddress);
      
      if (!user) {
        // Create a new user with wallet address
        user = await storage.createUser({
          username: `user_${Date.now()}`,
          password: `pwd_${Date.now()}`, // This is not used for wallet auth
          walletAddress: walletData.walletAddress
        });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid wallet data",
          error: fromZodError(error).message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to connect wallet"
      });
    }
  });
  
  // File upload to IPFS via Pinata
  app.post("/api/files/upload", upload.single("file"), async (req: RequestWithFile, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    if (!req.body.walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }
    
    try {
      const walletAddress = req.body.walletAddress;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Create a readable stream for the file
      const readStream = fs.createReadStream(req.file.path);
      
      // Create form data for Pinata API
      const formData = new FormData();
      formData.append("file", readStream);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: req.file.originalname,
        keyvalues: {
          walletAddress: walletAddress,
          userId: user.id.toString(),
          fileType: req.file.mimetype,
          fileSize: req.file.size
        }
      });
      formData.append("pinataMetadata", metadata);
      
      // Add Pinata options
      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append("pinataOptions", options);
      
      // Log the Pinata API information (without revealing the full keys)
      console.log("Pinata API Key available:", !!pinataApiKey);
      console.log("Pinata Secret API Key available:", !!pinataSecretApiKey);
      console.log("Pinata Base URL:", pinataBaseUrl);
      console.log("Pinata Gateway URL:", pinataGatewayUrl);
      
      // Check if API keys are configured
      if (!pinataApiKey || !pinataSecretApiKey) {
        return res.status(500).json({
          success: false,
          message: "Pinata API keys are not configured. Please contact the administrator."
        });
      }
      
      // Print out API keys for debugging (first few characters only)
      console.log("Using Pinata API Key:", pinataApiKey.substring(0, 4) + "...");
      console.log("Using Pinata Secret API Key:", pinataSecretApiKey.substring(0, 4) + "...");
      console.log("Formdata boundary:", formData.getBoundary());
      
      // Define variables outside the try block to be accessible later
      let ipfsCid;
      let ipfsGatewayUrl;
      
      try {
        // Test the API keys with a simpler endpoint first
        const testResponse = await axios.get(`${pinataBaseUrl}/data/testAuthentication`, {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        });
        console.log("Pinata authentication test:", testResponse.status, testResponse.data);
        
        // Upload to Pinata
        const pinataResponse = await axios.post(
          `${pinataBaseUrl}/pinning/pinFileToIPFS`,
          formData,
          {
            maxBodyLength: Infinity,
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecretApiKey
            }
          }
        );
        
        console.log("Pinata upload successful:", pinataResponse.status);
        console.log("Pinata response data:", JSON.stringify(pinataResponse.data, null, 2));
        
        // Extract the IPFS CID
        ipfsCid = pinataResponse.data.IpfsHash;
        ipfsGatewayUrl = `${pinataGatewayUrl}${ipfsCid}`;
      } catch (error: any) {
        console.error("Pinata API Error:", error.message);
        if (error.response) {
          console.error("Pinata error status:", error.response.status);
          console.error("Pinata error data:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
      }
      
      // Store file info in database
      const newFile = await storage.createFile({
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        ipfsCid: ipfsCid,
        ipfsGatewayUrl: ipfsGatewayUrl,
        pinataMetadata: metadata,
        ownerId: user.id
      });
      
      // Clean up the temp file
      fs.unlinkSync(req.file.path);
      
      return res.status(200).json({
        success: true,
        file: newFile
      });
    } catch (error: any) {
      console.error("Error uploading file to IPFS:", error);
      
      // Clean up the temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      // Extract detailed error message if available
      let errorMessage = "Failed to upload file to IPFS";
      
      if (error.response?.data) {
        // Check if response.data is an object and properly stringify it
        if (typeof error.response.data === 'object') {
          try {
            // If it has an error property, use that
            if (error.response.data.error) {
              errorMessage = `IPFS Error: ${error.response.data.error}`;
            } else {
              // Otherwise stringify the whole object
              errorMessage = `IPFS Error: ${JSON.stringify(error.response.data)}`;
            }
          } catch (e) {
            errorMessage = "IPFS Error: Failed to parse error response";
          }
        } else {
          errorMessage = `IPFS Error: ${error.response.data}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Print the full error object for debugging
      console.log("Full error object:", JSON.stringify(error, null, 2));
      
      console.error("Detailed upload error:", errorMessage);
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });
  
  // Get files for a wallet address
  app.get("/api/files", async (req: Request, res: Response) => {
    const walletAddress = req.query.walletAddress as string;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }
    
    try {
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Get files owned by the user
      const ownedFiles = await storage.getFilesByOwnerId(user.id);
      
      // Get files shared with the user
      const sharedFiles = await storage.getFilesSharedWithWalletAddress(walletAddress);
      
      return res.status(200).json({
        success: true,
        ownedFiles,
        sharedFiles
      });
    } catch (error) {
      console.error("Error fetching files:", error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to fetch files"
      });
    }
  });
  
  // Get file details with access info
  app.get("/api/files/:id", async (req: Request, res: Response) => {
    const fileId = parseInt(req.params.id);
    const walletAddress = req.query.walletAddress as string;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }
    
    try {
      const fileWithAccess = await storage.getFileWithAccess(fileId);
      
      if (!fileWithAccess) {
        return res.status(404).json({
          success: false,
          message: "File not found"
        });
      }
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Check if user is owner or has access
      const isOwner = fileWithAccess.ownerId === user.id;
      const hasAccess = fileWithAccess.access.some(
        (access) => access.sharedWithWalletAddress === walletAddress
      );
      
      if (!isOwner && !hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }
      
      return res.status(200).json({
        success: true,
        file: fileWithAccess,
        isOwner
      });
    } catch (error) {
      console.error("Error fetching file details:", error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to fetch file details"
      });
    }
  });
  
  // Delete a file
  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    const fileId = parseInt(req.params.id);
    const walletAddress = req.body.walletAddress;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found"
        });
      }
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Only the owner can delete a file
      if (file.ownerId !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }
      
      // Attempt to unpin from Pinata
      if (!pinataApiKey || !pinataSecretApiKey) {
        console.warn("Pinata API keys not configured, skipping unpinning from IPFS");
      } else {
        try {
          await axios.delete(
            `${pinataBaseUrl}/pinning/unpin/${file.ipfsCid}`,
            {
              headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
              }
            }
          );
          console.log("Successfully unpinned file from Pinata:", file.ipfsCid);
        } catch (error) {
          console.error("Error unpinning from Pinata:", error);
          // Continue with deletion from database even if unpinning fails
        }
      }
      
      // Delete from database
      await storage.deleteFile(fileId);
      
      return res.status(200).json({
        success: true,
        message: "File deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to delete file"
      });
    }
  });
  
  // Share a file with another wallet
  app.post("/api/files/:id/share", async (req: Request, res: Response) => {
    const fileId = parseInt(req.params.id);
    
    try {
      const { ownerWalletAddress, sharedWithWalletAddress, permission } = req.body;
      
      if (!ownerWalletAddress || !sharedWithWalletAddress || !permission) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing"
        });
      }
      
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found"
        });
      }
      
      const owner = await storage.getUserByWalletAddress(ownerWalletAddress);
      
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner not found"
        });
      }
      
      // Check if user is the owner
      if (file.ownerId !== owner.id) {
        return res.status(403).json({
          success: false,
          message: "Only the owner can share files"
        });
      }
      
      // Check if the shared with user exists, if not create a placeholder
      let sharedWithUser = await storage.getUserByWalletAddress(sharedWithWalletAddress);
      
      if (!sharedWithUser) {
        sharedWithUser = await storage.createUser({
          username: `placeholder_${Date.now()}`,
          password: `placeholder_${Date.now()}`,
          walletAddress: sharedWithWalletAddress
        });
      }
      
      // Check if already shared
      const existingAccess = (await storage.getFileAccess(fileId)).find(
        (access) => access.sharedWithWalletAddress === sharedWithWalletAddress
      );
      
      if (existingAccess) {
        return res.status(400).json({
          success: false,
          message: "File already shared with this wallet"
        });
      }
      
      // Create access record
      const accessData = {
        fileId,
        sharedWithUserId: sharedWithUser.id,
        sharedWithWalletAddress,
        permission
      };
      
      const validatedAccessData = insertFileAccessSchema.parse(accessData);
      const newAccess = await storage.createFileAccess(validatedAccessData);
      
      return res.status(200).json({
        success: true,
        access: newAccess
      });
    } catch (error) {
      console.error("Error sharing file:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid access data", 
          error: fromZodError(error).message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: "Failed to share file"
      });
    }
  });
  
  // Remove file access
  app.delete("/api/files/:fileId/access/:accessId", async (req: Request, res: Response) => {
    const fileId = parseInt(req.params.fileId);
    const accessId = parseInt(req.params.accessId);
    const walletAddress = req.body.walletAddress;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "File not found"
        });
      }
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Only the owner can remove access
      if (file.ownerId !== user.id) {
        return res.status(403).json({
          success: false,
          message: "Only the owner can remove access"
        });
      }
      
      await storage.deleteFileAccess(accessId);
      
      return res.status(200).json({
        success: true,
        message: "Access removed successfully"
      });
    } catch (error) {
      console.error("Error removing access:", error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to remove access"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
