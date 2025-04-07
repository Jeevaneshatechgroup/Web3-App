import React, { useCallback, useState, useRef } from "react";
import { useFileUpload } from "@/hooks/useFiles";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/walletUtils";

interface FileUploaderProps {
  walletAddress: string;
}

export default function FileUploader({ walletAddress }: FileUploaderProps) {
  const { uploadFile, isUploading, progress, currentFile } = useFileUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      
      const file = files[0];
      
      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return;
      }
      
      uploadFile({ file, walletAddress });
    },
    [uploadFile, walletAddress]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  return (
    <div className="mb-8">
      <div
        className={`max-w-full bg-white rounded-lg border border-dashed ${
          isDragOver ? "border-primary" : "border-gray-300 hover:border-primary"
        } transition-colors`}
      >
        <div
          className="p-6 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Drag and drop your files here
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                or{" "}
                <span className="text-primary hover:text-blue-600 cursor-pointer font-medium">
                  browse
                </span>{" "}
                to upload
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports all file types up to 100MB
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && currentFile && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-gray-400 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">{currentFile.name}</span>
            </div>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
