import { useQuery } from '@tanstack/react-query';
import { ConnectedWallet } from '@/lib/web3';
import { File } from '@shared/schema';
import { formatFileSize } from '@/lib/utils';
import { formatRelative } from 'date-fns';
import { FileImage, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MyNFTsProps {
  wallet: ConnectedWallet | null;
}

export default function MyNFTs({ wallet }: MyNFTsProps) {
  const { toast } = useToast();
  
  const { data: userData } = useQuery({
    queryKey: [`/api/users/wallet/${wallet?.address}`],
    enabled: !!wallet?.address
  });
  
  const { data: files = [], isLoading } = useQuery<File[]>({
    queryKey: [`/api/files/user/${userData?.id}`],
    enabled: !!userData?.id
  });
  
  const nftFiles = files.filter(file => file.isNft);
  
  const handleViewNFT = (file: File) => {
    if (!file.isNft || !file.ipfsHash) {
      toast({
        title: "NFT not found",
        description: "This file has not been properly minted as an NFT.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const metadata = file.nftMetadata as any;
      const externalUrl = metadata?.external_url;
      
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NFT Details - ${file.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              background: linear-gradient(to bottom, #f9f9f9, #f1f1f1);
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              padding: 2rem;
            }
            .header {
              border-bottom: 1px solid #eee;
              padding-bottom: 1rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #2563eb;
              margin-top: 0;
            }
            .detail {
              display: flex;
              margin-bottom: 1rem;
            }
            .detail-label {
              font-weight: bold;
              width: 150px;
              flex-shrink: 0;
            }
            .badge {
              display: inline-block;
              background-color: #dbeafe;
              color: #1e40af;
              border-radius: 9999px;
              padding: 0.25rem 0.75rem;
              font-size: 0.875rem;
              font-weight: 500;
            }
            pre {
              background-color: #f7fafc;
              border-radius: 4px;
              padding: 1rem;
              overflow-x: auto;
            }
            .footer {
              margin-top: 2rem;
              font-size: 0.875rem;
              color: #6b7280;
              text-align: center;
            }
            .note {
              background-color: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 1rem;
              margin-top: 2rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NFT Information</h1>
              <p>Decentralized File Storage NFT</p>
            </div>
            
            <div class="detail">
              <div class="detail-label">Name:</div>
              <div>${file.name}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">File Type:</div>
              <div>${file.type}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Size:</div>
              <div>${file.size} bytes</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Minted:</div>
              <div>${new Date(file.uploadedAt).toLocaleString()}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Content CID:</div>
              <div>${file.ipfsHash}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Owner:</div>
              <div>${wallet?.address || 'Unknown'}</div>
            </div>
            
            ${file.nftMetadata ? `
            <h2>Metadata</h2>
            <pre>${JSON.stringify(file.nftMetadata, null, 2)}</pre>
            ` : ''}
            
            <div class="note">
              <strong>Note:</strong> This is a demonstration view. In a production environment, this would link to the actual NFT on a marketplace or blockchain explorer.
            </div>
          </div>
          
          <div class="footer">
            Decentralized Identity - Web3 Secure File Storage
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const dataUrl = URL.createObjectURL(blob);
      
      toast({
        title: "Opening NFT Details",
        description: "Showing NFT information in a new tab.",
      });
      
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Error displaying NFT details:', error);
      toast({
        title: "Failed to display NFT details",
        description: "There was an error showing the NFT information.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800 sm:truncate">My NFTs</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your document NFTs
          </p>
        </div>
      </div>
      
      <div className="mx-4 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))
        ) : nftFiles.length > 0 ? (
          nftFiles.map(file => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative">
                  <div className="absolute top-2 right-2 bg-accent text-white rounded-full px-2 py-1 text-xs font-medium">
                    <Award className="h-3 w-3 inline mr-1" /> NFT
                  </div>
                  <div className="w-full h-40 bg-purple-50 rounded-md flex items-center justify-center mb-4">
                    {file.type.includes('image') ? (
                      <img 
                        src={`data:${file.type};base64,${file.content}`} 
                        alt={file.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <FileImage className="h-16 w-16 text-purple-500" />
                    )}
                  </div>
                </div>
                <h3 className="text-md font-medium text-gray-900 truncate">{file.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(file.size)} • Minted {formatRelative(new Date(file.uploadedAt), new Date())}
                </p>
                {file.nftMetadata && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {(file.nftMetadata as any).description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewNFT(file)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Blockchain
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No NFTs yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Mint your documents as NFTs to see them here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
