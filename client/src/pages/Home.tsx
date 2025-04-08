import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostForm from "@/components/PostForm";
import PostList from "@/components/PostList";
import AutoContractDeployer from "@/components/AutoContractDeployer";
import { useWallet } from "@/context/WalletContext";
import { getContractAddress } from "@/lib/contract";

// Storage key for persistent post hashes
const POSTS_STORAGE_KEY = "deblog_post_hashes";

export default function Home() {
  const { isConnected } = useWallet();
  const [storedHashes, setStoredHashes] = useState<string[]>([]);
  const [hasContract, setHasContract] = useState(false);
  
  // Load stored IPFS hashes from localStorage on component mount
  useEffect(() => {
    const savedHashes = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedHashes) {
      try {
        const parsed = JSON.parse(savedHashes);
        if (Array.isArray(parsed)) {
          setStoredHashes(parsed);
        }
      } catch (e) {
        console.error("Error parsing stored post hashes:", e);
      }
    }
    
    // Check if contract is deployed
    const contractAddress = getContractAddress();
    setHasContract(!!contractAddress);
  }, []);

  // Called after a new post is created via PostForm
  const handlePostCreated = (hash?: string) => {
    if (hash && !hasContract) {
      // Only store locally if we're not using the blockchain
      const updatedHashes = [...storedHashes, hash];
      setStoredHashes(updatedHashes);
      
      // Save to localStorage
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedHashes));
    } else if (!hash) {
      console.log("Post created but no hash was provided");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {isConnected && (
            <>
              <AutoContractDeployer />
              <PostForm onPostCreated={handlePostCreated} />
            </>
          )}
          <PostList additionalHashes={storedHashes} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
