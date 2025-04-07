import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFileDetails, useRemoveAccess } from "@/hooks/useFiles";
import { formatFileSize, formatDate } from "@/lib/walletUtils";
import { copyToClipboard, downloadFromIpfs } from "@/lib/ipfs";
import { useToast } from "@/hooks/use-toast";
import { type FileAccess as FileAccessType } from "@shared/schema";
import { FileText, Copy, Download, Share2, XCircle } from "lucide-react";

interface FileDetailsModalProps {
  fileId: number;
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  walletAddress: string;
}

export default function FileDetailsModal({
  fileId,
  isOpen,
  onClose,
  onShare,
  walletAddress,
}: FileDetailsModalProps) {
  const { toast } = useToast();
  const { data, isLoading } = useFileDetails(fileId, walletAddress);
  const { removeAccess, isRemoving } = useRemoveAccess();
  const [copyingField, setCopyingField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopyingField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard.`,
      });
      setTimeout(() => setCopyingField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!data?.file) return;
    
    try {
      await downloadFromIpfs(data.file.ipfsCid, data.file.name);
      toast({
        title: "Download Started",
        description: `Downloading ${data.file.name}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAccess = (accessId: number) => {
    if (!data?.file) return;
    
    if (window.confirm("Are you sure you want to remove access for this user?")) {
      removeAccess({
        fileId: data.file.id,
        accessId,
        walletAddress,
      });
    }
  };

  if (isLoading || !data?.file) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading file details...</DialogTitle>
            <DialogDescription>Please wait while we fetch the file information.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const { file, isOwner } = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <DialogTitle className="text-lg leading-6">{file.name}</DialogTitle>
              <DialogDescription>
                Uploaded on {formatDate(file.uploadedAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex flex-col space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500">CID</span>
                <div className="mt-1 flex items-center">
                  <span className="text-sm font-mono text-gray-900 truncate">
                    {file.ipfsCid}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(file.ipfsCid, "CID")}
                    className="ml-2 text-blue-600 hover:text-blue-500 h-5 w-5 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">Size</span>
                <p className="mt-1 text-sm text-gray-900">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              <div>
                <span className="text-xs font-medium text-gray-500">IPFS Gateway URL</span>
                <div className="mt-1 flex items-center">
                  <span className="text-sm font-mono text-gray-900 truncate">
                    {file.ipfsGatewayUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(file.ipfsGatewayUrl, "Gateway URL")}
                    className="ml-2 text-blue-600 hover:text-blue-500 h-5 w-5 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {isOwner && (
            <div className="mt-5 border-t border-gray-200 pt-5">
              <h4 className="text-sm font-medium text-gray-900">Shared With</h4>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {file.access && file.access.length > 0 ? (
                  file.access.map((access: FileAccessType) => (
                    <div key={access.id} className="flex items-center py-2">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <span className="text-xs font-medium">
                          {access.sharedWithWalletAddress.substring(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {access.permission.charAt(0).toUpperCase() + access.permission.slice(1)} Access
                        </p>
                        <p className="text-xs text-gray-500">
                          {access.sharedWithWalletAddress.substring(0, 6)}...
                          {access.sharedWithWalletAddress.substring(
                            access.sharedWithWalletAddress.length - 4
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAccess(access.id)}
                        disabled={isRemoving}
                        className="ml-auto text-gray-400 hover:text-red-500 h-5 w-5 p-0"
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    This file isn't shared with anyone
                  </p>
                )}
              </div>
              
              <div className="mt-4">
                <Button onClick={onShare} className="flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share File
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
