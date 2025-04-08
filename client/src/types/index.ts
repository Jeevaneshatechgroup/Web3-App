// Define Exodus Wallet types
export interface ExodusProvider {
  isExodus?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

// Define NFT metadata types
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// Define NFT minting status
export type MintingStatus = 
  | 'idle' 
  | 'uploading-file' 
  | 'uploading-metadata' 
  | 'minting' 
  | 'success' 
  | 'error';

// Define IPFS upload response
export interface IPFSUploadResponse {
  ipfsHash: string;
  fileUrl: string;
}

// Define metadata upload response
export interface MetadataUploadResponse {
  ipfsHash: string;
  metadataUrl: string;
}

// Define NFT transaction response
export interface NFTTransactionResponse {
  id: number;
  name: string;
  description: string;
  ipfsHash: string;
  imageUrl: string;
  metadataUrl: string;
  walletAddress: string;
  transactionHash: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  createdAt: string;
}
