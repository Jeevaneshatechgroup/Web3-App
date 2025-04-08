import { useState, useEffect } from "react";
import { BlogPost } from "@/types";
import { fetchPostFromIPFS } from "@/lib/ipfs";
import { getAllPostHashes, getContractAddress } from "@/lib/contract";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Database, CloudCog } from "lucide-react";

interface PostListProps {
  additionalHashes?: string[];
}

export default function PostList({ additionalHashes = [] }: PostListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockchainHashes, setBlockchainHashes] = useState<string[]>([]);
  const [storageMode, setStorageMode] = useState<'local' | 'blockchain'>('local');

  useEffect(() => {
    // Check if contract is deployed to determine storage mode
    const contractAddress = getContractAddress();
    setStorageMode(contractAddress ? 'blockchain' : 'local');
    
    const fetchContractHashes = async () => {
      if (contractAddress) {
        try {
          const hashes = await getAllPostHashes();
          setBlockchainHashes(hashes);
        } catch (err) {
          console.error("Error fetching blockchain hashes:", err);
        }
      }
    };
    
    fetchContractHashes();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use blockchain hashes if available, otherwise use local hashes
        const hashesToFetch = storageMode === 'blockchain' && blockchainHashes.length > 0
          ? blockchainHashes
          : additionalHashes;
        
        if (hashesToFetch.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        const postPromises = hashesToFetch.map(hash => 
          fetchPostFromIPFS(hash).catch(err => {
            console.error(`Error fetching post ${hash}:`, err);
            return null; // Return null for failed fetches
          })
        );
        
        const fetchedPosts = await Promise.all(postPromises);
        // Filter out null values (failed fetches) and sort by timestamp (newest first)
        const validPosts = fetchedPosts
          .filter((post): post is BlogPost => post !== null)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setPosts(validPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [blockchainHashes, additionalHashes, storageMode]);

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-gray-800">Recent Posts</h2>
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-white shadow rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-gray-800">Recent Posts</h2>
        <Card className="bg-white shadow rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Recent Posts</h2>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">Storage:</span>
          {storageMode === 'blockchain' ? (
            <div className="flex items-center text-emerald-600">
              <Database className="h-4 w-4 mr-1" />
              <span>Blockchain</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600">
              <CloudCog className="h-4 w-4 mr-1" />
              <span>Local Storage</span>
            </div>
          )}
        </div>
      </div>
      
      {posts.length === 0 ? (
        <Card className="bg-white shadow rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <p className="text-gray-500">No posts available yet. Be the first to publish!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post, index) => (
          <Card key={index} className="bg-white shadow rounded-lg overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
              <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <code className="font-mono text-xs">{formatAddress(post.author)}</code>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <time>{formatTimestamp(post.timestamp)}</time>
                </div>
              </div>
              <div className="prose mt-4 text-gray-700">
                {post.body.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span>IPFS Hash: </span>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 font-mono"
                >
                  {post.ipfsHash}
                </a>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
