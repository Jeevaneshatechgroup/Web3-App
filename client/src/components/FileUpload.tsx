import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { FileIcon, FileText, Video, Image, Music, Code, FolderArchive } from "lucide-react";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
};

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Returns appropriate icon component based on file type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-16 w-16 text-blue-500" />;
    }
    if (type.startsWith("video/")) {
      return <Video className="h-16 w-16 text-red-500" />;
    }
    if (type === "application/pdf") {
      return <FileText className="h-16 w-16 text-orange-500" />;
    }
    if (type.startsWith("audio/")) {
      return <Music className="h-16 w-16 text-green-500" />;
    }
    if (type.includes("javascript") || type.includes("html") || type.includes("css") || type.includes("json")) {
      return <Code className="h-16 w-16 text-gray-700" />;
    }
    if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("gzip")) {
      return <FolderArchive className="h-16 w-16 text-purple-500" />;
    }
    
    // Default file icon for other types
    return <FileIcon className="h-16 w-16 text-gray-500" />;
  };

  const handleFileChange = (file: File) => {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 50MB."
      });
      return;
    }

    setFile(file);
    setFileType(file.type);
    onFileSelect(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files
      setPreview(null);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null as any); // Notify parent that file was removed
  };

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return sizeInBytes + " B";
    if (sizeInBytes < 1024 * 1024) return (sizeInBytes / 1024).toFixed(1) + " KB";
    return (sizeInBytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload NFT Asset
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        This file will be stored on IPFS via Pinata and linked to your NFT metadata.
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supported file types: JPG, PNG, GIF, SVG, MP4, PDF, audio files, and more.
      </p>
      
      {!file ? (
        <div className="mt-4">
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="dropzone flex flex-col items-center justify-center h-52 rounded-lg cursor-pointer border-2 border-dashed border-primary/40 hover:border-primary/70 hover:bg-primary/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Drag and drop your file here</p>
            <p className="mt-1 text-xs text-gray-500">Max file size: 50MB</p>
            
            <button 
              onClick={handleBrowseClick}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Files
            </button>
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        <div className="mt-4 relative">
          <Card className="flex flex-col items-center p-6 border border-green-200 rounded-lg bg-green-50">
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ready for IPFS
              </span>
            </div>
            
            <div className="w-full flex justify-center mb-4">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-[250px] object-contain rounded-md shadow-md" 
                />
              ) : (
                <div className="h-40 w-40 flex items-center justify-center bg-white rounded-md shadow-md">
                  {fileType && getFileIcon(fileType)}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center">
                <FileIcon className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-base font-medium text-gray-800">{file.name}</span>
                <span className="ml-2 text-sm text-gray-500">{formatFileSize(file.size)}</span>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button 
                  onClick={handleBrowseClick}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Replace File
                </button>
                
                <button 
                  onClick={removeFile}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Remove File
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p>
          <span className="font-semibold">Note:</span> Your file will be uploaded to IPFS via Pinata when you mint your NFT.
          Once uploaded to IPFS, files cannot be modified or deleted.
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
