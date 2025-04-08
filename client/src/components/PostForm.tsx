import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { uploadPostToIPFS } from "@/lib/ipfs";
import { createBlogPost, getContractAddress } from "@/lib/contract";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostFormProps {
  onPostCreated: (ipfsHash?: string) => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { walletAddress, isConnected } = useWallet();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const { toast } = useToast();

  if (!isConnected) {
    return null; // Don't render the form if wallet is not connected
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both title and content fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if contract is deployed (for informational purposes only)
    const contractAddress = getContractAddress();

    try {
      setIsSubmitting(true);
      
      const postData = {
        title,
        body,
        author: walletAddress!,
        timestamp: new Date().toISOString(),
      };

      // First upload to IPFS
      const ipfsHash = await uploadPostToIPFS(postData);
      
      // Then register on blockchain if contract is deployed
      let registeredOnBlockchain = false;
      if (contractAddress) {
        try {
          await createBlogPost(postData, ipfsHash);
          registeredOnBlockchain = true;
        } catch (contractError) {
          console.error("Contract registration failed, but IPFS upload succeeded:", contractError);
          // We continue because at least the IPFS upload worked
        }
      }
      
      setSuccessData({ hash: ipfsHash });
      setTitle("");
      setBody("");
      
      // Pass the hash back to parent component
      onPostCreated(ipfsHash);
      
      toast({
        title: "Post published successfully!",
        description: registeredOnBlockchain 
          ? "Your content is now available on IPFS and registered on the blockchain."
          : "Your content is now available on IPFS (blockchain registration not available).",
      });
    } catch (error) {
      console.error("Error publishing post:", error);
      toast({
        title: "Publication failed",
        description: error instanceof Error ? error.message : "Failed to publish post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Create New Post</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              placeholder="Enter your post title"
            />
          </div>
          
          <div>
            <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </Label>
            <Textarea
              id="content"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full"
              placeholder="Write your post content here..."
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-600 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish to IPFS"}
          </Button>
        </form>

        {successData && (
          <Alert className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
            <div className="flex">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <h4 className="text-sm font-medium">Post published successfully!</h4>
                <AlertDescription className="mt-2 text-sm">
                  <p>Your post is now available on IPFS at:</p>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${successData.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs mt-1 block text-blue-600 hover:text-blue-800 break-all"
                  >
                    https://gateway.pinata.cloud/ipfs/{successData.hash}
                  </a>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
