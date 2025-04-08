import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

// Candidates table for voting
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageIpfsHash: text("image_ipfs_hash").notNull(),
  voteCount: integer("vote_count").notNull().default(0),
});

// Votes table to track who has voted
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  voterAddress: text("voter_address").notNull().unique(),
  timestamp: integer("timestamp").notNull(),
  transactionHash: text("transaction_hash").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  description: true,
  imageIpfsHash: true,
  voteCount: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  candidateId: true,
  voterAddress: true,
  timestamp: true,
  transactionHash: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Pinata types
export const pinataResponseSchema = z.object({
  success: z.boolean(),
  ipfsHash: z.string().optional(),
  error: z.string().optional(),
});

export type PinataResponse = z.infer<typeof pinataResponseSchema>;
