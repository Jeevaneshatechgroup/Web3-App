import axios from 'axios';

const BACKEND_URL = '/api/pinata';

/**
 * Upload a file to IPFS via Pinata API through our backend
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${BACKEND_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      // Return the IPFS URL
      return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
    } else {
      throw new Error('Failed to upload to IPFS');
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Upload JSON content to IPFS via Pinata API through our backend
 */
export const uploadJSONToIPFS = async (jsonData: any): Promise<string> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/json`, jsonData);
    
    if (response.data.success) {
      // Return the IPFS URL
      return `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`;
    } else {
      throw new Error('Failed to upload JSON to IPFS');
    }
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Get candidate data from IPFS via Pinata
 */
export const getCandidateFromIPFS = async (ipfsHash: string): Promise<any> => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
};
