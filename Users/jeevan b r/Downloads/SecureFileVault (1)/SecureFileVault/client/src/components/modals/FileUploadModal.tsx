// import { useState, useRef, ChangeEvent } from 'react';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { X, Upload, FolderOpen, File, Trash2 } from 'lucide-react';
// import { formatFileSize } from '@/lib/utils';

// interface FileUploadModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onUpload: (files: Array<{ name: string; type: string; size: number; content: string }>) => void;
//   isUploading: boolean;
// }

// export default function FileUploadModal({ 
//   isOpen, 
//   onClose, 
//   onUpload, 
//   isUploading 
// }: FileUploadModalProps) {
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newFiles = Array.from(e.target.files);
//       setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
//     }
//   };
  
//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
    
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const newFiles = Array.from(e.dataTransfer.files);
//       setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
//     }
//   };
  
//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//   };
  
//   const handleRemoveFile = (index: number) => {
//     setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
//   };
  
//   const handleUpload = async () => {
//     const processedFiles = await Promise.all(
//       selectedFiles.map(async (file) => {
//         return new Promise<{ name: string; type: string; size: number; content: string }>((resolve) => {
//           const reader = new FileReader();
//           reader.onload = (e) => {
//             if (e.target && e.target.result) {
//               // Extract the base64 part of the data URL
//               const base64Content = e.target.result.toString().split(',')[1];
//               resolve({
//                 name: file.name,
//                 type: file.type || 'application/octet-stream',
//                 size: file.size,
//                 content: base64Content
//               });
//             }
//           };
//           reader.readAsDataURL(file);
//         });
//       })
//     );
    
//     onUpload(processedFiles);
//   };
  
//   const handleBrowseFiles = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };
  
//   const handleCloseModal = () => {
//     setSelectedFiles([]);
//     onClose();
//   };
  
//   return (
//     <Dialog open={isOpen} onOpenChange={handleCloseModal}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <div className="flex items-center justify-between">
//             <DialogTitle className="text-lg font-medium text-gray-900">Upload Files</DialogTitle>
//             <button 
//               className="text-gray-500 hover:text-gray-700 focus:outline-none"
//               onClick={handleCloseModal}
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </DialogHeader>
        
//         <div className="px-6 py-4">
//           <div 
//             className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//           >
//             <div className="text-center">
//               <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <p className="text-xl font-medium text-gray-700">Drag and drop files here</p>
//               <p className="text-sm text-gray-500 mt-1">or</p>
//             </div>
//             <div className="mt-4">
//               <Button onClick={handleBrowseFiles}>
//                 <FolderOpen className="mr-2 h-4 w-4" />
//                 Browse Files
//               </Button>
//               <input 
//                 ref={fileInputRef}
//                 id="file-upload" 
//                 type="file" 
//                 multiple 
//                 className="sr-only" 
//                 onChange={handleFileSelect}
//               />
//             </div>
//           </div>
          
//           {selectedFiles.length > 0 && (
//             <div className="mt-6">
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h4>
//               <div className="max-h-40 overflow-y-auto">
//                 {selectedFiles.map((file, index) => (
//                   <div key={index} className="py-2 flex items-center">
//                     <div className="flex-shrink-0 mr-2">
//                       <File className="h-5 w-5 text-gray-500" />
//                     </div>
//                     <div className="flex-1 overflow-hidden">
//                       <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
//                       <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
//                     </div>
//                     <button 
//                       className="text-gray-500 hover:text-gray-700 ml-2"
//                       onClick={() => handleRemoveFile(index)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
        
//         <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
//           <Button
//             variant="outline"
//             onClick={handleCloseModal}
//             className="mr-3"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleUpload}
//             disabled={selectedFiles.length === 0 || isUploading}
//           >
//             <Upload className="mr-2 h-4 w-4" />
//             {isUploading ? 'Uploading...' : 'Upload'}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, FolderOpen, File, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: Array<{ name: string; type: string; size: number; content: string }>) => void;
  isUploading: boolean;
}

export default function FileUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  isUploading 
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleUpload = async () => {
    const processedFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        return new Promise<{ name: string; type: string; size: number; content: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              const base64Content = e.target.result.toString().split(',')[1];
              resolve({
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                content: base64Content
              });
            }
          };
          reader.readAsDataURL(file);
        });
      })
    );
    
    onUpload(processedFiles);
  };
  
  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCloseModal = () => {
    setSelectedFiles([]);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">Upload Files</DialogTitle>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={handleCloseModal}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-700">Drag and drop files here</p>
              <p className="text-sm text-gray-500 mt-1">or</p>
            </div>
            <div className="mt-4">
              <Button onClick={handleBrowseFiles}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
              <input 
                ref={fileInputRef}
                id="file-upload" 
                type="file" 
                multiple 
                className="sr-only" 
                onChange={handleFileSelect}
              />
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="py-2 flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      <File className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-gray-700 ml-2"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            className="mr-3"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
