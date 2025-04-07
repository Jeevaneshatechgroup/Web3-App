import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type File as DbFile, type FileAccess } from "@shared/schema";

export function useFilesList(walletAddress?: string) {
  const { toast } = useToast();
  
  const filesQuery = useQuery({
    queryKey: ["/api/files", walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      if (!walletAddress) return { ownedFiles: [], sharedFiles: [] };
      
      const response = await fetch(`/api/files?walletAddress=${walletAddress}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
  });
  
  return {
    ...filesQuery,
    files: filesQuery.data?.ownedFiles || [],
    sharedFiles: filesQuery.data?.sharedFiles || [],
  };
}

export function useFileDetails(fileId: number, walletAddress?: string) {
  return useQuery({
    queryKey: [`/api/files/${fileId}`, walletAddress],
    enabled: !!walletAddress && fileId > 0,
    queryFn: async () => {
      if (!walletAddress) return null;
      
      const response = await fetch(`/api/files/${fileId}?walletAddress=${walletAddress}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
  });
}

export function useFileUpload() {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  
  const uploadMutation = useMutation({
    mutationFn: async ({ file, walletAddress }: { file: File; walletAddress: string }) => {
      setCurrentFile({
        name: file.name,
        size: file.size,
      });
      setProgress(0);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("walletAddress", walletAddress);
      
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("IPFS upload error response:", errorData);
        throw new Error(errorData.message || "Failed to upload file");
      }
      
      setProgress(100);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded to IPFS and pinned.",
      });
      
      // Invalidate files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      
      // Reset progress and current file after a short delay
      setTimeout(() => {
        setProgress(0);
        setCurrentFile(null);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      
      setProgress(0);
      setCurrentFile(null);
    },
  });
  
  return {
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    progress,
    currentFile,
  };
}

export function useFileDelete() {
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async ({ fileId, walletAddress }: { fileId: number; walletAddress: string }) => {
      const response = await apiRequest("DELETE", `/api/files/${fileId}`, { walletAddress });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete file");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "Your file has been deleted successfully.",
      });
      
      // Invalidate files query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });
  
  return {
    deleteFile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useFileShare() {
  const { toast } = useToast();
  
  const shareMutation = useMutation({
    mutationFn: async ({
      fileId,
      ownerWalletAddress,
      sharedWithWalletAddress,
      permission,
    }: {
      fileId: number;
      ownerWalletAddress: string;
      sharedWithWalletAddress: string;
      permission: string;
    }) => {
      const response = await apiRequest("POST", `/api/files/${fileId}/share`, {
        ownerWalletAddress,
        sharedWithWalletAddress,
        permission,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share file");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "File Shared",
        description: `Access granted to wallet address ${variables.sharedWithWalletAddress.slice(0, 6)}...${variables.sharedWithWalletAddress.slice(-4)}`,
      });
      
      // Invalidate the specific file query to refresh access list
      queryClient.invalidateQueries({ queryKey: [`/api/files/${variables.fileId}`] });
    },
    onError: (error) => {
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Failed to share file",
        variant: "destructive",
      });
    },
  });
  
  return {
    shareFile: shareMutation.mutate,
    isSharing: shareMutation.isPending,
  };
}

export function useRemoveAccess() {
  const { toast } = useToast();
  
  const removeAccessMutation = useMutation({
    mutationFn: async ({
      fileId,
      accessId,
      walletAddress,
    }: {
      fileId: number;
      accessId: number;
      walletAddress: string;
    }) => {
      const response = await apiRequest("DELETE", `/api/files/${fileId}/access/${accessId}`, {
        walletAddress,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove access");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Access Removed",
        description: "File access has been revoked successfully.",
      });
      
      // Invalidate the specific file query to refresh access list
      queryClient.invalidateQueries({ queryKey: [`/api/files/${variables.fileId}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Access",
        description: error instanceof Error ? error.message : "Failed to remove file access",
        variant: "destructive",
      });
    },
  });
  
  return {
    removeAccess: removeAccessMutation.mutate,
    isRemoving: removeAccessMutation.isPending,
  };
}
