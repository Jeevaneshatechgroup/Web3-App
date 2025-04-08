import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ipfsHash: text("ipfs_hash").notNull(),
  imageUrl: text("image_url").notNull(),
  metadataUrl: text("metadata_url").notNull(),
  walletAddress: text("wallet_address").notNull(),
  transactionHash: text("transaction_hash"),
  fileType: text("file_type"),
  attributes: jsonb("attributes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNFTSchema = createInsertSchema(nfts)
  .omit({ id: true, createdAt: true })
  .extend({
    attributes: z.array(
      z.object({
        trait_type: z.string(),
        value: z.string(),
      })
    ).optional(),
  });

export const fileUploadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  attributes: z.array(
    z.object({
      trait_type: z.string(),
      value: z.string(),
    })
  ).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNFT = z.infer<typeof insertNFTSchema>;
export type NFT = typeof nfts.$inferSelect;
export type NFTAttribute = { trait_type: string; value: string };
export type FileUpload = z.infer<typeof fileUploadSchema>;
