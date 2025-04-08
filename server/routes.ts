import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileUploadSchema, insertNFTSchema } from "@shared/schema";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Define file type filter
const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  // List of allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
    // Video
    'video/mp4', 'video/mpeg', 'video/webm',
    // Archives
    'application/zip', 'application/x-rar-compressed',
    // Other
    'text/plain', 'application/json', 'text/html'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`File type not allowed. Supported types: images, PDF, audio, video, and common documents.`));
  }
};

// Setup for temporary file storage
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get NFTs for a wallet address
  app.get("/api/nfts/:walletAddress", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.params;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      const nfts = await storage.getNFTsByWalletAddress(walletAddress);
      return res.json(nfts);
    } catch (error) {
      console.error("Failed to get NFTs:", error);
      return res.status(500).json({ error: "Failed to retrieve NFTs" });
    }
  });

  // API endpoint to upload file to IPFS
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const pinataApiKey ="f17017685b87d3f22b42"; 
      const pinataSecretApiKey ="b7939d13cd23d0aca7c3ace914113960aacb7f4271126b442ce6ae30520bb6d4";;

      if (!pinataApiKey || !pinataSecretApiKey) {
        console.error("Missing Pinata API credentials.");
        return res.status(500).json({ error: "Pinata API credentials are not configured" });
      }
      
      // Check if the API keys are actually valid by making a simple test request
      try {
        const testResponse = await axios.get("https://api.pinata.cloud/data/testAuthentication", {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        });
        
        if (testResponse.status !== 200) {
          console.error("Pinata authentication failed:", testResponse.data);
          return res.status(500).json({ error: "Pinata API authentication failed, invalid credentials" });
        }
        
        // If we reach here, the authentication was successful
        console.log("Pinata API authentication successful");
      } catch (err: any) {
        console.error("Pinata auth test error:", err.message);
        return res.status(500).json({ 
          error: "Failed to authenticate with Pinata API",
          details: err.response?.data || err.message
        });
      }

      // Read file from the temporary location
      const fileData = fs.readFileSync(req.file.path);

      // Prepare form data for Pinata
      const formData = new FormData();
      formData.append("file", fileData, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Add metadata to Pinata upload
      const pinataMetadata = JSON.stringify({
        name: path.parse(req.file.originalname).name,
        keyvalues: {
          fileType: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      // Add options for better file handling
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      });
      formData.append('pinataOptions', pinataOptions);

      // Upload to Pinata
      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      // Clean up the temp file
      fs.unlinkSync(req.file.path);

      // Return the IPFS hash (CID) and gateway URL along with file information
      return res.json({
        ipfsHash: response.data.IpfsHash,
        fileUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      });
    } catch (error: any) {
      console.error("File upload failed:", error);
      
      // Clean up temp file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      // Provide more detailed error information
      const errorMessage = error.response?.data?.error || error.message || "Failed to upload file to IPFS";
      return res.status(500).json({ 
        error: errorMessage,
        details: error.response?.data 
      });
    }
  });

  // API endpoint to upload metadata to IPFS
  app.post("/api/metadata", async (req: Request, res: Response) => {
    try {
      const { name, description, image, fileType, attributes, walletAddress } = req.body;

      if (!name || !description || !image || !walletAddress) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const pinataApiKey ="f17017685b87d3f22b42";
      const pinataSecretApiKey ="b7939d13cd23d0aca7c3ace914113960aacb7f4271126b442ce6ae30520bb6d4";;

      if (!pinataApiKey || !pinataSecretApiKey) {
        console.error("Missing Pinata API credentials for metadata endpoint");
        return res.status(500).json({ error: "Pinata API credentials are not configured" });
      }
      
      // Check if the API keys are actually valid by making a simple test request
      try {
        const testResponse = await axios.get("https://api.pinata.cloud/data/testAuthentication", {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        });
        
        if (testResponse.status !== 200) {
          console.error("Pinata authentication failed for metadata upload:", testResponse.data);
          return res.status(500).json({ error: "Pinata API authentication failed, invalid credentials" });
        }
        
        // If we reach here, the authentication was successful
        console.log("Pinata API authentication successful for metadata upload");
      } catch (err: any) {
        console.error("Pinata auth test error for metadata:", err.message);
        return res.status(500).json({ 
          error: "Failed to authenticate with Pinata API for metadata",
          details: err.response?.data || err.message
        });
      }

      // Create metadata JSON with ERC-721 compatibility
      // Including file type information for non-image assets
      const metadata: Record<string, any> = {
        name,
        description,
        image, // IPFS URI to the asset
        attributes: attributes || [],
      };

      // Add file type information for non-image files to help with rendering
      if (fileType && !fileType.startsWith('image/')) {
        metadata.file_type = fileType;
        metadata.file_url = image; // Duplicate the URL in a standard field
        
        // Add additional properties for specific file types
        if (fileType.startsWith('video/')) {
          metadata.animation_url = image; // Standard for NFT videos
        } else if (fileType.startsWith('audio/')) {
          metadata.animation_url = image; // Can also be used for audio
        } else if (fileType === 'application/pdf') {
          metadata.document_url = image; // Custom field for documents
        }
      }

      // Add pinata metadata
      const pinataMetadata = {
        name: `${name} Metadata`,
        keyvalues: {
          walletAddress,
          fileType: fileType || 'image',
          createdAt: new Date().toISOString()
        }
      };

      // Upload metadata to Pinata with additional options
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
            "Content-Type": "application/json",
          },
          params: {
            pinataMetadata: JSON.stringify(pinataMetadata),
            pinataOptions: JSON.stringify({
              cidVersion: 1
            })
          }
        }
      );

      // Save NFT data to our storage
      try {
        // Validate data with our schema
        const nftData = insertNFTSchema.parse({
          name,
          description,
          ipfsHash: response.data.IpfsHash,
          imageUrl: image,
          fileType: fileType || 'image/png', // Store file type information
          metadataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          walletAddress,
          attributes,
        });

        // Store in our database
        const nft = await storage.createNFT(nftData);

        // Return NFT data with metadata URL
        return res.json({
          ...nft,
          metadataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          fileType: fileType || 'image/png'
        });
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ error: validationError.message });
        }
        throw error;
      }
    } catch (error: any) {
      console.error("Metadata upload failed:", error);
      
      // Provide more detailed error information
      const errorMessage = error.response?.data?.error || error.message || "Failed to upload metadata to IPFS";
      return res.status(500).json({ 
        error: errorMessage,
        details: error.response?.data 
      });
    }
  });

  // API endpoint to update NFT with transaction hash
  app.post("/api/nfts/:id/transaction", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { transactionHash } = req.body;

      if (!id || !transactionHash) {
        return res.status(400).json({ error: "NFT ID and transaction hash are required" });
      }

      const nft = await storage.updateNFTTransactionHash(parseInt(id), transactionHash);
      
      if (!nft) {
        return res.status(404).json({ error: "NFT not found" });
      }

      return res.json(nft);
    } catch (error) {
      console.error("Transaction update failed:", error);
      return res.status(500).json({ error: "Failed to update NFT with transaction hash" });
    }
  });

  // For validation purposes
  app.post("/api/validate/metadata", async (req: Request, res: Response) => {
    try {
      const result = fileUploadSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }
      return res.json({ valid: true });
    } catch (error) {
      return res.status(500).json({ error: "Validation error" });
    }
  });
  
  // API endpoint to check Pinata IPFS connection status
  app.get("/api/pinata/status", async (req: Request, res: Response) => {
    try {
      const pinataApiKey ="f17017685b87d3f22b42";
      const pinataSecretApiKey ="b7939d13cd23d0aca7c3ace914113960aacb7f4271126b442ce6ae30520bb6d4";;
      
      if (!pinataApiKey || !pinataSecretApiKey) {
        console.error("Missing Pinata API credentials for status check");
        return res.status(400).json({ 
          error: "Pinata API credentials are not configured",
          status: "error"
        });
      }
      
      try {
        const testResponse = await axios.get("https://api.pinata.cloud/data/testAuthentication", {
          headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey
          }
        });
        
        if (testResponse.status === 200) {
          // Authentication successful
          return res.json({ 
            status: "connected",
            message: "Successfully connected to Pinata IPFS service"
          });
        } else {
          return res.status(400).json({ 
            error: "Pinata API authentication failed",
            status: "error",
            details: testResponse.data
          });
        }
      } catch (err: any) {
        console.error("Pinata connection test failed:", err.message);
        return res.status(400).json({ 
          error: "Failed to connect to Pinata API",
          status: "error",
          details: err.response?.data || err.message
        });
      }
    } catch (error: any) {
      console.error("Pinata status check failed:", error);
      return res.status(500).json({ 
        error: "Internal server error checking Pinata connection",
        status: "error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
