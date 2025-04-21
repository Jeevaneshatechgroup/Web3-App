import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File } from "@shared/schema";
import { Download, Share2, Award, X, FileText, FileImage, FileSpreadsheet, File as FileIcon, AlertCircle } from 'lucide-react';
import { importKeyFromBase64, decryptContent, getFileEncryptionKey, storeFileEncryptionKey } from '@/lib/crypto';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface FileViewerModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onDownload: (file: File) => void;
  onShare: (file: File) => void;
  onMintNFT: (file: File) => void;
}

export default function FileViewerModal({ 
  isOpen, 
  file, 
  onClose, 
  onDownload, 
  onShare, 
  onMintNFT 
}: FileViewerModalProps) {
  if (!file) return null;
  
  const { toast } = useToast();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!file) return;
    
    const processFileContent = async () => {
      try {
        setLoadingContent(true);
        setError(null);
        
        if (file.isEncrypted) {
          console.log('Warning: Trying to view legacy encrypted file:', { fileId: file.id });
          setError('This file was encrypted with the old system and cannot be viewed directly. Try downloading it to see if it can be processed.');
          setFileContent(null);
          return;
        }
        
        setFileContent(file.content);
        console.log('File content loaded successfully');
        
      } catch (err) {
        console.error('Error processing file content:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to process file content';
        setError(errorMessage);
        setFileContent(null);
        
        toast({
          title: "Error viewing file",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingContent(false);
      }
    };
    
    processFileContent();
  }, [file]);
  
  const getFilePreview = () => {
    if (loadingContent) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    const type = file.type.toLowerCase();
    
    if (!fileContent) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div className="text-center">
            <FileIcon className="mx-auto h-20 w-20 text-gray-500 mb-4" />
            <p className="text-gray-600">Content unavailable</p>
            <p className="text-sm text-gray-500 mt-2">Try downloading the file instead</p>
          </div>
        </div>
      );
    }
    
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-md overflow-auto">
          <img 
            src={`data:${file.type};base64,${fileContent}`} 
            alt={file.name} 
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
              {atob(fileContent)}
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
            <p className="text-gray-600">{file.type.split('/')[1].toUpperCase()} File</p>
            <p className="text-sm text-gray-500 mt-2">Click download to view this file</p>
          </div>
        </div>
      );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl" aria-describedby="file-preview-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">{file.name}</DialogTitle>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p id="file-preview-description" className="text-sm text-gray-500 mt-1">
            View, share, or download your file
          </p>
        </DialogHeader>
        
        <div className="px-6 py-4">
          {getFilePreview()}
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => onDownload(file)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => onShare(file)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          {!file.isNft && (
            <Button
              onClick={() => onMintNFT(file)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all"
            >
              <Award className="mr-2 h-5 w-5" />
              Mint as NFT
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
