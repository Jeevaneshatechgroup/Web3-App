import axios from 'axios';
import { apiRequest } from './queryClient';

export const checkPinataConnection = async (): Promise<{ status: 'connected' | 'error'; message?: string }> => {
  try {
    const response = await fetch('/api/pinata/status', {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'connected') {
      return { status: 'connected', message: data.message || 'Connected to Pinata IPFS service' };
    } else {
      return { 
        status: 'error', 
        message: data.error || 'Unable to connect to Pinata IPFS service'
      };
    }
  } catch (error: any) {
    console.error('Error checking Pinata connection:', error);
    return { 
      status: 'error', 
      message: error.message || 'Failed to verify Pinata connection status'
    };
  }
};

export const uploadFileToPinata = async (file: File): Promise<{ ipfsHash: string; fileUrl: string }> => {
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);

    // Use our server's endpoint instead of directly calling Pinata
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file to IPFS');
    }

    const data = await response.json();
    
    return {
      ipfsHash: data.ipfsHash,
      fileUrl: data.fileUrl,
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

export const uploadMetadataToPinata = async (metadata: any): Promise<{ ipfsHash: string; metadataUrl: string }> => {
  try {
    // Use our server's endpoint instead of directly calling Pinata
    const response = await fetch('/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload metadata to IPFS');
    }

    const data = await response.json();
    
    return {
      ipfsHash: data.ipfsHash,
      metadataUrl: data.metadataUrl,
    };
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

export default {
  checkPinataConnection,
  uploadFileToPinata,
  uploadMetadataToPinata,
};
