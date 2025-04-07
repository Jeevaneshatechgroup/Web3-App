import React from "react";
import { Progress } from "@/components/ui/progress";
import { useFilesList } from "@/hooks/useFiles";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, formatFileSize } from "@/lib/walletUtils";
import { Separator } from "@/components/ui/separator";

// Category item component
type CategoryItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ icon, label, isActive = false, onClick }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
      isActive
        ? "bg-blue-50 text-primary"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    {icon}
    {label}
  </a>
);

export default function Sidebar() {
  const { user } = useWallet();
  const { files, isLoading } = useFilesList(user.walletAddress);
  
  // Calculate storage usage
  const usedBytes = files.reduce((total, file) => total + file.size, 0);
  const maxBytes = 1024 * 1024 * 1024; // 1GB limit
  const usagePercentage = Math.min(100, (usedBytes / maxBytes) * 100);
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Storage</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your decentralized storage stats</p>
        
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Usage</span>
              <span className="text-sm font-medium text-gray-900">
                {formatFileSize(usedBytes)} / {formatFileSize(maxBytes)}
              </span>
            </div>
            <Progress className="mt-1 h-2" value={usagePercentage} />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Files</span>
              <span className="text-sm font-medium text-gray-900">
                {isLoading ? "Loading..." : files.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-md font-medium text-gray-900">Categories</h3>
        
        <nav className="mt-3 space-y-1">
          <CategoryItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
            label="All Files"
            isActive={true}
          />
          <CategoryItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            label="Images"
          />
          <CategoryItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            label="Documents"
          />
          <CategoryItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            }
            label="Archives"
          />
          <CategoryItem
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            }
            label="Videos"
          />
        </nav>
      </div>
      
      <Separator />
      
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-900">Shared Access</h3>
          <button type="button" className="text-sm text-primary font-medium hover:text-blue-600">
            Manage
          </button>
        </div>
        
        <div className="mt-3 space-y-2">
          {/* This would be populated with actual users who have access */}
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <span className="text-xs font-medium">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">{formatAddress("0x1a2b3c4d5e6f7890")}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <span className="text-xs font-medium">AS</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Alice Smith</p>
              <p className="text-xs text-gray-500">{formatAddress("0x4d5e6f7890abcdef")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
