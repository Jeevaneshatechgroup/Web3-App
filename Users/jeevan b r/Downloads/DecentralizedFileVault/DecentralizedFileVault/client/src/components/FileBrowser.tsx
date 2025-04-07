import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import FileCard from "@/components/FileCard";
import { type File as FileType } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface FileBrowserProps {
  files: FileType[];
  sharedFiles: FileType[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  onOpenDetails: (fileId: number) => void;
  onOpenShareModal: (fileId: number) => void;
  walletAddress: string;
}

export default function FileBrowser({
  files,
  sharedFiles,
  isLoading,
  viewMode,
  onOpenDetails,
  onOpenShareModal,
  walletAddress,
}: FileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter files based on search query
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSharedFiles = sharedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(4)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full mt-4" />
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right">
            <Skeleton className="h-6 w-20 inline-block" />
            <Skeleton className="h-6 w-20 inline-block ml-2" />
          </div>
        </div>
      ));
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Files</h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="search"
            className="block w-full pl-10"
            placeholder="Search files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="myFiles">
        <TabsList className="mb-4">
          <TabsTrigger value="myFiles">My Files</TabsTrigger>
          <TabsTrigger value="sharedWithMe">Shared With Me</TabsTrigger>
        </TabsList>

        <TabsContent value="myFiles">
          {isLoading ? (
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
              {renderSkeletons()}
            </div>
          ) : filteredFiles.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-4 ${
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : ""
              }`}
            >
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onOpenDetails={() => onOpenDetails(file.id)}
                  onOpenShareModal={() => onOpenShareModal(file.id)}
                  walletAddress={walletAddress}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a file.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sharedWithMe">
          {isLoading ? (
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
              {renderSkeletons()}
            </div>
          ) : filteredSharedFiles.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-4 ${
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : ""
              }`}
            >
              {filteredSharedFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onOpenDetails={() => onOpenDetails(file.id)}
                  onOpenShareModal={() => onOpenShareModal(file.id)}
                  walletAddress={walletAddress}
                  isShared
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No shared files
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No files have been shared with you yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
