import { PinataRequestBody, PinataResponse, BlogPost } from "@/types";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";

/**
 * Uploads a blog post to IPFS via Pinata API
 */
export async function uploadPostToIPFS(post: Omit<BlogPost, "ipfsHash">): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not found");
  }

  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  
  const requestBody: PinataRequestBody = {
    pinataContent: post,
    pinataMetadata: {
      name: `DeBlog-${Date.now()}-${post.title.replace(/\s+/g, '-').toLowerCase()}`,
      keyvalues: {
        author: post.author,
      }
    },
    pinataOptions: {
      cidVersion: 1
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Pinata API error: ${response.status} ${errorData}`);
    }

    const data: PinataResponse = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Fetches a blog post from IPFS via gateway
 */
export async function fetchPostFromIPFS(ipfsHash: string): Promise<BlogPost> {
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  
  try {
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status}`);
    }
    
    const data = await response.json();
    return { ...data, ipfsHash };
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    throw error;
  }
}
