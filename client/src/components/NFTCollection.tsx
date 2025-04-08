import { useNFTs } from "@/hooks/useNFTs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, FileText, Video, Image, Music, Code, FolderArchive } from "lucide-react";
import { NFT } from "@shared/schema";

type NFTCollectionProps = {
  walletAddress: string | null;
};

type FileAction = {
  label: string;
  url: string;
  icon: React.ReactNode;
};

const NFTCollection = ({ walletAddress }: NFTCollectionProps) => {
  const { nfts, isLoading, refetch } = useNFTs(walletAddress);

  // Get appropriate actions for different file types
  const getFileActions = (nft: NFT): FileAction => {
    // Default action is to view on IPFS gateway
    let primaryAction = {
      label: "View on IPFS",
      url: nft.imageUrl,
      icon: <FileIcon className="h-4 w-4 ml-1" />
    };

    // Customize based on file type
    const fileType = (nft as any).fileType;
    
    if (fileType) {
      if (fileType.startsWith('image/')) {
        primaryAction = {
          label: "View Image",
          url: nft.imageUrl,
          icon: <Image className="h-4 w-4 ml-1" />
        };
      } else if (fileType.startsWith('video/')) {
        primaryAction = {
          label: "Play Video",
          url: nft.imageUrl,
          icon: <Video className="h-4 w-4 ml-1" />
        };
      } else if (fileType.startsWith('audio/')) {
        primaryAction = {
          label: "Play Audio",
          url: nft.imageUrl,
          icon: <Music className="h-4 w-4 ml-1" />
        };
      } else if (fileType === 'application/pdf') {
        primaryAction = {
          label: "View PDF",
          url: nft.imageUrl,
          icon: <FileText className="h-4 w-4 ml-1" />
        };
      }
    }

    return primaryAction;
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My NFT Collection</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4">
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (nfts as NFT[]) && (nfts as NFT[]).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(nfts as NFT[]).map((nft: NFT) => (
            <Card 
              key={nft.id} 
              className="bg-white rounded-lg shadow overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <div className="h-48 w-full relative bg-gray-100 flex items-center justify-center">
                {/* Cast to any since fileType is a new property and might not be in all NFTs */}
                {(nft as any).fileType && !(nft as any).fileType.startsWith('image/') ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    {(nft as any).fileType?.startsWith('video/') && (
                      <Video className="h-16 w-16 text-red-500 mb-2" />
                    )}
                    {(nft as any).fileType?.startsWith('audio/') && (
                      <Music className="h-16 w-16 text-green-500 mb-2" />
                    )}
                    {(nft as any).fileType === 'application/pdf' && (
                      <FileText className="h-16 w-16 text-orange-500 mb-2" />
                    )}
                    {!(nft as any).fileType?.startsWith('video/') && 
                     !(nft as any).fileType?.startsWith('audio/') && 
                     (nft as any).fileType !== 'application/pdf' && (
                      <FileIcon className="h-16 w-16 text-gray-500 mb-2" />
                    )}
                    <span className="text-sm text-gray-600">{(nft as any).fileType}</span>
                  </div>
                ) : (
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name} 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                      // If image loading fails, show a placeholder
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+TkZUIEFzc2V0PC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-md font-medium text-gray-900 truncate">{nft.name}</h3>
                <p className="mt-1 text-sm text-gray-500 max-h-10 overflow-hidden">
                  {nft.description}
                </p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="truncate">
                    Created: {nft.createdAt ? formatDistanceToNow(new Date(nft.createdAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                {/* File Action Button */}
                <a 
                  href={nft.imageUrl} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                >
                  <span>{getFileActions(nft).label}</span>
                  {getFileActions(nft).icon}
                </a>
                
                {/* Metadata Button */}
                <a 
                  href={nft.metadataUrl} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-primary/90 text-sm font-medium inline-flex items-center"
                >
                  <span>View details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No NFTs Found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't minted any NFTs yet. Create your first NFT to see it here!
          </p>
        </div>
      )}
    </div>
  );
};

export default NFTCollection;
