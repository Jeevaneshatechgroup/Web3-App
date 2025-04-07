import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").notNull().unique(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  ipfsCid: text("ipfs_cid").notNull().unique(),
  ipfsGatewayUrl: text("ipfs_gateway_url").notNull(),
  pinataMetadata: text("pinata_metadata"),
  ownerId: integer("owner_id").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const fileAccess = pgTable("file_access", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull(),
  sharedWithUserId: integer("shared_with_user_id").notNull(),
  sharedWithWalletAddress: text("shared_with_wallet_address").notNull(),
  permission: text("permission").notNull(), // "view", "download", "full"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export const insertFileAccessSchema = createInsertSchema(fileAccess).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertFileAccess = z.infer<typeof insertFileAccessSchema>;
export type FileAccess = typeof fileAccess.$inferSelect;

// File type with nested access information
export type FileWithAccess = File & {
  access: FileAccess[];
};

// Extended user type with wallet info
export const walletUserSchema = z.object({
  walletAddress: z.string(),
  connected: z.boolean().default(false),
});

export type WalletUser = z.infer<typeof walletUserSchema>;
