import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").notNull().unique(),
  did: text("did"), // DID for decentralized identity
  didDocument: jsonb("did_document"), // DID document
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  content: text("content").notNull(), // Base64 encoded file content
  isEncrypted: boolean("is_encrypted").default(false),
  encryptionIv: text("encryption_iv"), // Initialization vector for encryption
  ipfsHash: text("ipfs_hash"),
  isNft: boolean("is_nft").default(false),
  nftMetadata: jsonb("nft_metadata"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const fileShares = pgTable("file_shares", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull(),
  sharedByUserId: integer("shared_by_user_id").notNull(),
  sharedToWalletAddress: text("shared_to_wallet_address").notNull(),
  canEdit: boolean("can_edit").default(false),
  encryptionKey: text("encryption_key"), // Encrypted key specific for the recipient
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  did: true,
  didDocument: true,
});

export const insertFileSchema = createInsertSchema(files).pick({
  userId: true,
  name: true,
  type: true,
  size: true,
  content: true,
  isEncrypted: true,
  encryptionIv: true,
  ipfsHash: true,
});

export const insertFileShareSchema = createInsertSchema(fileShares).pick({
  fileId: true,
  sharedByUserId: true,
  sharedToWalletAddress: true,
  canEdit: true,
  encryptionKey: true,
  expiresAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertFileShare = z.infer<typeof insertFileShareSchema>;
export type FileShare = typeof fileShares.$inferSelect;
