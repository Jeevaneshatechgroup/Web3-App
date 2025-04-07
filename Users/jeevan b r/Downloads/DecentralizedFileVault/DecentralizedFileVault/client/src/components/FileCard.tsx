import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type File as FileType } from "@shared/schema";
import { formatFileSize, formatDate, getFileIconType } from "@/lib/walletUtils";
import { downloadFromIpfs } from "@/lib/ipfs";
import { useToast } from "@/hooks/use-toast";
import { useFileDelete } from "@/hooks/useFiles";
import { 
  File, 
  Image, 
  FileText, 
  Video, 
  Music,
  Archive,
  Table,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  ExternalLink,
  Info
} from "lucide-react";

interface FileCardProps {
  file: FileType;
  viewMode: "grid" | "list";
  onOpenDetails: () => void;
  onOpenShareModal: () => void;
  walletAddress: string;
  isShared?: boolean;
}

export default function FileCard({
  file,
  viewMode,
  onOpenDetails,
  onOpenShareModal,
  walletAddress,
  isShared = false,
}: FileCardProps) {
  const { toast } = useToast();
  const { deleteFile, isDeleting } = useFileDelete();

  // Get icon based on file type
  const getFileIcon = () => {
    const iconType = getFileIconType(file.mimeType);
    const iconProps = { className: "h-8 w-8", strokeWidth: 1.5 };
    
    switch (iconType) {
      case "Image":
        return <Image {...iconProps} className="h-8 w-8 text-blue-500" />;
      case "Video":
        return <Video {...iconProps} className="h-8 w-8 text-red-500" />;
      case "Music":
        return <Music {...iconProps} className="h-8 w-8 text-purple-500" />;
      case "FileText":
        return <FileText {...iconProps} className="h-8 w-8 text-blue-500" />;
      case "Table":
        return <Table {...iconProps} className="h-8 w-8 text-green-500" />;
      case "Archive":
        return <Archive {...iconProps} className="h-8 w-8 text-amber-500" />;
      default:
        return <File {...iconProps} className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFromIpfs(file.ipfsCid, file.name);
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile({ fileId: file.id, walletAddress });
    }
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 shadow-sm hover:border-blue-400 transition-colors rounded-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-grow">
            {getFileIcon()}
            <div className="ml-3 flex-grow">
              <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
              </p>
            </div>
            <div className="text-xs text-gray-500 font-mono truncate hidden sm:block max-w-md">
              CID: {file.ipfsCid}
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            
            {!isShared && (
              <Button variant="ghost" size="sm" onClick={onOpenShareModal}>
                <Share2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onOpenDetails}>
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(file.ipfsGatewayUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Gateway
                </DropdownMenuItem>
                {!isShared && (
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:border-blue-400 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onOpenDetails}>
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(file.ipfsGatewayUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Gateway
                </DropdownMenuItem>
                {!isShared && (
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 font-mono truncate">
          CID: {file.ipfsCid}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right">
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        
        {!isShared && (
          <Button variant="ghost" size="sm" onClick={onOpenShareModal} className="ml-2">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
}
