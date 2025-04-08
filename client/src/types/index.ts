declare global {
  interface Window {
    ethereum: any;
  }
}

export interface Candidate {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  voteCount: number;
}

export type NotificationType = 'success' | 'error' | 'loading' | 'none';

export interface Notification {
  show: boolean;
  type: NotificationType;
  message: string;
}

export interface Transaction {
  isOpen: boolean;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface IPFSResponse {
  success: boolean;
  ipfsHash: string;
  error?: string;
}
