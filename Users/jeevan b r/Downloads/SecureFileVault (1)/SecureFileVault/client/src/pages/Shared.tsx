import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ConnectedWallet } from '@/lib/web3';
import { File, FileShare } from '@shared/schema';
import { formatFileSize } from '@/lib/utils';
import { formatRelative, isAfter } from 'date-fns';
import { FileText, FileImage, FileSpreadsheet, File as FileIcon, Clock, Calendar, Download, Eye, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { importKeyFromBase64, decryptContent, storeFileEncryptionKey, getFileEncryptionKey } from '@/lib/crypto';

interface SharedWithMeItem {
  share: FileShare;
  file: Omit<File, 'content'>;
}

interface SharedProps {
  wallet: ConnectedWallet | null;
}

export default function Shared({ wallet }: SharedProps) {
  const [viewingFile, setViewingFile] = useState<{ file: Omit<File, 'content'>; fullFile?: File | null } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Get shared files for this wallet
  const { data: sharedWithMe = [], isLoading } = useQuery<SharedWithMeItem[]>({
    queryKey: [`/api/shares/wallet/${wallet?.address}`],
    enabled: !!wallet?.address
  });
  
  // Fetch a single file with its content for viewing
  const fetchFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      console.log('Fetching shared file for viewing, ID:', fileId);
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      return response.json();
    },
    onSuccess: async (fullFile: File) => {
      try {
        // Check if we need to handle encryption
        if (fullFile.isEncrypted) {
          // First check if we already have a stored key for this file
          const existingKey = getFileEncryptionKey(fullFile.id);
          
          if (!existingKey) {
            // Find the share for this file
            const shareForFile = sharedWithMe.find(item => item.file.id === fullFile.id);
            
            if (!shareForFile || !shareForFile.share.encryptionKey) {
              throw new Error('Cannot access encryption key for this shared file');
            }
            
            // Store this key for future use
            storeFileEncryptionKey(fullFile.id, shareForFile.share.encryptionKey);
            
            console.log('Saved decryption key for shared file:', fullFile.id);
          }
        }
        
        // Update the state with the full file
        if (viewingFile) {
          setViewingFile({ ...viewingFile, fullFile });
        }
      } catch (error) {
        console.error('Error processing shared file:', error);
        toast({
          title: "Error processing file",
          description: error instanceof Error ? error.message : "Could not process the file content.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('File fetch error:', error);
      toast({
        title: "Error loading file",
        description: "Could not load the file content. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return <FileText className="text-red-500 h-16 w-16" />;
    } else if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <FileImage className="text-purple-500 h-16 w-16" />;
    } else if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) {
      return <FileSpreadsheet className="text-green-500 h-16 w-16" />;
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileText className="text-blue-500 h-16 w-16" />;
    } else {
      return <FileIcon className="text-gray-500 h-16 w-16" />;
    }
  };
  
  // Get file background color based on type
  const getFileBackgroundColor = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'bg-red-50';
    } else if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return 'bg-purple-50';
    } else if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) {
      return 'bg-green-50';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'bg-blue-50';
    } else {
      return 'bg-gray-100';
    }
  };
  
  // Check if share is expired
  const isShareExpired = (share: FileShare) => {
    if (!share.expiresAt) return false;
    return isAfter(new Date(), new Date(share.expiresAt));
  };
  
  // Handler for viewing a shared file
  const handleViewSharedFile = (item: SharedWithMeItem) => {
    if (isShareExpired(item.share)) return;
    
    setViewingFile({ file: item.file });
    setIsViewModalOpen(true);
    fetchFileMutation.mutate(item.file.id);
  };
  
  // Handler for downloading a shared file
  const handleDownloadSharedFile = async (item: SharedWithMeItem) => {
    if (isShareExpired(item.share)) return;
    
    try {
      // If we already have the full file content, use it
      if (viewingFile?.fullFile?.content) {
        downloadFile(viewingFile.fullFile);
        return;
      }
      
      // Otherwise fetch it
      console.log('Fetching file for download, ID:', item.file.id);
      const response = await fetch(`/api/files/${item.file.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const fullFile = await response.json();
      downloadFile(fullFile);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to download a file
  const downloadFile = async (file: File) => {
    try {
      if (!file || !file.content) {
        throw new Error('File content is missing');
      }
      
      let contentToProcess = file.content;
      
      // Handle legacy encrypted files if they exist
      if (file.isEncrypted) {
        console.log('Warning: Found encrypted file in storage');
        toast({
          title: "Legacy File Format",
          description: "This file was encrypted with the old system. It may not be accessible.",
          variant: "destructive",
        });
      }
      
      // Convert base64 to Blob
      const byteCharacters = atob(contentToProcess);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: file.type });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      
      // Add timestamp to filename in dev mode to avoid cache issues
      if (import.meta.env.DEV) {
        link.download = `${file.name.split('.')[0]}_${Date.now()}.${file.name.split('.').pop()}`;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `${file.name} is being downloaded.`,
      });
    } catch (error) {
      console.error('Download process error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "There was an error processing the file for download.",
        variant: "destructive",
      });
    }
  };
  
  // State to track content decryption process
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  
  // Process the file content when the viewer is opened
  useEffect(() => {
    if (!viewingFile?.fullFile) return;
    
    const file = viewingFile.fullFile;
    
    const processContent = async () => {
      try {
        setIsDecrypting(true);
        setDecryptionError(null);
        
        // Handle legacy encrypted files if they exist
        if (file.isEncrypted) {
          console.log('Warning: Trying to view legacy encrypted file:', { fileId: file.id });
          setDecryptionError('This file was encrypted with the old system and cannot be viewed directly. Try downloading it to see if it can be processed.');
          setDecryptedContent(null);
          return;
        }
        
        // Use the content directly (no decryption needed)
        setDecryptedContent(file.content);
        console.log('File content loaded successfully');
        
      } catch (err) {
        console.error('Error processing file content:', err);
        setDecryptionError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsDecrypting(false);
      }
    };
    
    processContent();
    
    // Cleanup when viewer is closed
    return () => {
      setDecryptedContent(null);
      setDecryptionError(null);
      setIsDecrypting(false);
    };
  }, [viewingFile?.fullFile]);
  
  // Render file preview in the viewer modal
  const renderFilePreview = () => {
    if (!viewingFile || !viewingFile.fullFile) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading file content...</p>
          </div>
        </div>
      );
    }
    
    // If we're decrypting the content, show loading
    if (isDecrypting) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Processing file content...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment for large files</p>
          </div>
        </div>
      );
    }
    
    // If we have a decryption error, show it
    if (decryptionError) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p className="font-medium">File Processing Error</p>
            <p className="text-sm mt-2">{decryptionError}</p>
            <p className="text-sm text-gray-500 mt-4">Try downloading the file or contacting the person who shared it with you.</p>
          </div>
        </div>
      );
    }
    
    // If we don't have decrypted content yet, handle that case
    if (!decryptedContent) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Content unavailable</p>
            <p className="text-sm text-gray-500 mt-2">Try downloading the file instead</p>
          </div>
        </div>
      );
    }
    
    const { fullFile } = viewingFile;
    const type = fullFile.type.toLowerCase();
    
    // Use the decrypted content for displaying files
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md overflow-auto">
          <img 
            src={`data:${fullFile.type};base64,${decryptedContent}`} 
            alt={fullFile.name} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (type.includes('pdf')) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <FileText className="mx-auto h-20 w-20 text-red-500 mb-4" />
            <p className="text-gray-600">PDF Preview</p>
            <p className="text-sm text-gray-500 mt-2">Click download to view this PDF</p>
          </div>
        </div>
      );
    } else if (type.includes('text') || type.includes('txt')) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="w-full h-full p-4 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {atob(decryptedContent)}
            </pre>
          </div>
        </div>
      );
    } else {
      let icon;
      if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) {
        icon = <FileSpreadsheet className="mx-auto h-20 w-20 text-green-500 mb-4" />;
      } else if (type.includes('word') || type.includes('doc')) {
        icon = <FileText className="mx-auto h-20 w-20 text-blue-500 mb-4" />;
      } else {
        icon = <FileIcon className="mx-auto h-20 w-20 text-gray-500 mb-4" />;
      }
      
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            {icon}
            <p className="text-gray-600">{fullFile.type.split('/')[1]?.toUpperCase() || 'Document'} File</p>
            <p className="text-sm text-gray-500 mt-2">Click download to view this file</p>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800 sm:truncate">Shared With Me</h1>
          <p className="mt-1 text-sm text-gray-500">
            Files and documents shared with your wallet
          </p>
        </div>
      </div>
      
      {/* Shared Files Grid */}
      <div className="mx-4 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="w-full h-32 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))
        ) : sharedWithMe.length > 0 ? (
          sharedWithMe.map((item) => (
            <Card key={item.share.id} className={`overflow-hidden ${isShareExpired(item.share) ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex mb-4">
                  <div className={`w-16 h-16 ${getFileBackgroundColor(item.file.type)} rounded-md flex items-center justify-center`}>
                    {getFileIcon(item.file.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-md font-medium text-gray-900 truncate">{item.file.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatFileSize(item.file.size)} • Shared {formatRelative(new Date(item.share.createdAt), new Date())}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={item.share.canEdit ? "default" : "outline"}>
                        {item.share.canEdit ? 'Can Edit' : 'View Only'}
                      </Badge>
                      {item.share.expiresAt && (
                        <Badge variant={isShareExpired(item.share) ? "destructive" : "secondary"}>
                          <Clock className="mr-1 h-3 w-3" />
                          {isShareExpired(item.share)
                            ? 'Expired'
                            : `Expires ${formatRelative(new Date(item.share.expiresAt), new Date())}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 border-t border-gray-200 flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={isShareExpired(item.share)}
                  onClick={() => handleViewSharedFile(item)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={isShareExpired(item.share)}
                  onClick={() => handleDownloadSharedFile(item)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-center">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shared files</h3>
              <p className="mt-1 text-sm text-gray-500">
                When someone shares a file with your wallet address, it will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* File Viewer Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => !open && setIsViewModalOpen(false)}>
        <DialogContent 
          className="sm:max-w-3xl" 
          aria-describedby="file-viewer-description"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium">
                {viewingFile?.file.name}
              </DialogTitle>
              <button 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setIsViewModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p id="file-viewer-description" className="sr-only">
              Viewing shared document. You can download this file or close the dialog.
            </p>
          </DialogHeader>
          
          <div className="py-4">
            {renderFilePreview()}
            
            {viewingFile?.fullFile && (
              <div className="flex items-center mt-4">
                <p className="text-sm text-gray-500 flex-grow">
                  {formatFileSize(viewingFile.fullFile.size)} • {viewingFile.fullFile.type}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="bg-gray-50 border-t border-gray-200 p-4">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="mr-3"
            >
              Close
            </Button>
            {viewingFile && (
              <Button
                variant="default"
                onClick={() => viewingFile.fullFile && downloadFile(viewingFile.fullFile)}
                disabled={!viewingFile.fullFile?.content}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
