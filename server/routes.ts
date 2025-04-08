import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import dotenv from "dotenv";
import formidable from "formidable";
import PinataSDK from "@pinata/sdk";
import fs from "fs";

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Pinata client
  const pinata = PINATA_API_KEY && PINATA_SECRET_KEY
    ? new PinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY)
    : null;

  // Check if Pinata credentials are configured
  app.get("/api/pinata/status", async (req, res) => {
    if (!pinata) {
      return res.status(500).json({
        success: false,
        message: "Pinata API keys not configured",
      });
    }

    try {
      await pinata.testAuthentication();
      return res.json({
        success: true,
        message: "Pinata connection successful",
      });
    } catch (error) {
      console.error("Error connecting to Pinata:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to connect to Pinata",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Upload file to IPFS via Pinata
  app.post("/api/pinata/upload", async (req, res) => {
    if (!pinata) {
      return res.status(500).json({
        success: false,
        message: "Pinata API keys not configured",
      });
    }

    const form = formidable({});
    
    try {
      const [fields, files] = await form.parse(req);
      
      if (!files.file || !files.file[0]) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }
      
      const file = files.file[0];
      
      const readableStream = fs.createReadStream(file.filepath);
      const options = {
        pinataMetadata: {
          name: file.originalFilename || "file",
        },
      };
      
      const result = await pinata.pinFileToIPFS(readableStream, options);
      
      return res.json({
        success: true,
        ipfsHash: result.IpfsHash,
      });
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload to IPFS",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Upload JSON to IPFS via Pinata
  app.post("/api/pinata/json", async (req, res) => {
    if (!pinata) {
      return res.status(500).json({
        success: false,
        message: "Pinata API keys not configured",
      });
    }

    try {
      const jsonData = req.body;
      
      if (!jsonData) {
        return res.status(400).json({
          success: false,
          message: "No JSON data provided",
        });
      }
      
      const options = {
        pinataMetadata: {
          name: "voting-data",
        },
      };
      
      const result = await pinata.pinJSONToIPFS(jsonData, options);
      
      return res.json({
        success: true,
        ipfsHash: result.IpfsHash,
      });
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload JSON to IPFS",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
