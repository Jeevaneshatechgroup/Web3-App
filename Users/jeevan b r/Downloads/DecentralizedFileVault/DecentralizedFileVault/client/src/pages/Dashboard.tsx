import React, { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useLocation } from "wouter";
import { useFilesList } from "@/hooks/useFiles";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileUploader from "@/components/FileUploader";
import FileBrowser from "@/components/FileBrowser";
import FileDetailsModal from "@/components/FileDetailsModal";
import ShareModal from "@/components/ShareModal";
import { type File as FileType } from "@shared/schema";

export default function Dashboard() {
  const { user, isConnected } = useWallet();
  const [, setLocation] = useLocation();
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileDetailsOpen, setFileDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get files from API
  const { files, sharedFiles, isLoading, error } = useFilesList(
    user.walletAddress
  );

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  const handleOpenDetails = (fileId: number) => {
    setSelectedFileId(fileId);
    setFileDetailsOpen(true);
  };

  const handleOpenShareModal = (fileId: number) => {
    setSelectedFileId(fileId);
    setShareModalOpen(true);
  };

  if (!isConnected) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Files</h1>
              <p className="mt-1 text-sm text-gray-500">
                Upload, manage and share your files securely on IPFS.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Grid View
              </button>
            </div>
          </div>

          <FileUploader walletAddress={user.walletAddress} />

          <FileBrowser
            files={files}
            sharedFiles={sharedFiles}
            isLoading={isLoading}
            viewMode={viewMode}
            onOpenDetails={handleOpenDetails}
            onOpenShareModal={handleOpenShareModal}
            walletAddress={user.walletAddress}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedFileId && (
        <>
          <FileDetailsModal
            fileId={selectedFileId}
            isOpen={fileDetailsOpen}
            onClose={() => setFileDetailsOpen(false)}
            onShare={() => {
              setFileDetailsOpen(false);
              setShareModalOpen(true);
            }}
            walletAddress={user.walletAddress}
          />

          <ShareModal
            fileId={selectedFileId}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            walletAddress={user.walletAddress}
          />
        </>
      )}
    </div>
  );
}
