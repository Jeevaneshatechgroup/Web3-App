import { useState } from 'react';
import { File } from '@shared/schema';
import { Eye, Download, Share2, Award, Trash2, ExternalLink, File as FileIcon, FileText, FileImage, FileSpreadsheet } from 'lucide-react';
import { formatRelative, parseISO } from 'date-fns';
import { formatFileSize } from '@/lib/utils';

export interface FileGridViewProps {
  files: File[];
  onViewFile: (file: File) => void;
  onDeleteFile: (file: File) => void;
  onDownloadFile: (file: File) => void;
  onShareFile: (file: File) => void;
  onMintAsNFT: (file: File) => void;
  onViewNFT: (file: File) => void;
}

type ViewType = 'grid' | 'list';
type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc';

export default function FileGridView({ 
  files, 
  onViewFile, 
  onDeleteFile, 
  onDownloadFile, 
  onShareFile, 
  onMintAsNFT,
  onViewNFT 
}: FileGridViewProps) {
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  
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
  
  const formatDate = (dateString: Date) => {
    try {
      return formatRelative(dateString, new Date());
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const sortedFiles = [...files].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'date_asc':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'size_desc':
        return b.size - a.size;
      case 'size_asc':
        return a.size - b.size;
      default:
        return 0;
    }
  });
  
  return (
    <>
      <div className="mx-4 sm:mx-0 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="inline-flex shadow-sm rounded-md">
            <button 
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-md hover:bg-gray-50 ${viewType === 'grid' ? 'text-primary bg-white' : 'text-gray-700 bg-white'}`}
              onClick={() => setViewType('grid')}
            >
              <i className="fas fa-th-large mr-2"></i>
              Grid
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-md hover:bg-gray-50 ${viewType === 'list' ? 'text-primary bg-white' : 'text-gray-700 bg-white'}`}
              onClick={() => setViewType('list')}
            >
              <i className="fas fa-list mr-2"></i>
              List
            </button>
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-500">
            <span>{files.length}</span> documents
          </div>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center">
          <label htmlFor="sort" className="text-sm font-medium text-gray-500 mr-2">Sort by:</label>
          <select 
            id="sort" 
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="date_desc">Date (Newest)</option>
            <option value="date_asc">Date (Oldest)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">Size (Largest)</option>
            <option value="size_asc">Size (Smallest)</option>
          </select>
        </div>
      </div>
      
      <div className="mx-4 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedFiles.map((file) => (
          <div key={file.id} className="file-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 flex-1 flex flex-col relative">
              {file.isNft && (
                <div className="absolute top-2 right-2 bg-accent text-white rounded-full px-2 py-1 text-xs font-medium">
                  <Award className="h-3 w-3 inline mr-1" /> Minted
                </div>
              )}
              
              <div className={`w-full h-32 rounded-md flex items-center justify-center mb-4 ${getFileBackgroundColor(file.type)}`}>
                {getFileIcon(file.type)}
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{file.name}</h3>
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>{formatFileSize(file.size)}</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    className="text-gray-500 hover:text-gray-700" 
                    title="View"
                    onClick={() => onViewFile(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-gray-500 hover:text-gray-700" 
                    title="Download"
                    onClick={() => onDownloadFile(file)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-gray-500 hover:text-gray-700" 
                    title="Share"
                    onClick={() => onShareFile(file)}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  {file.isNft ? (
                    <button 
                      className="flex items-center text-accent hover:text-accent/80" 
                      title="View NFT"
                      onClick={() => onViewNFT(file)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      <span className="text-xs">View NFT</span>
                    </button>
                  ) : (
                    <button 
                      className="flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:from-indigo-600 hover:to-purple-600 shadow-sm" 
                      title="Mint as NFT"
                      onClick={() => onMintAsNFT(file)}
                    >
                      <Award className="h-4 w-4 mr-1" />
                      <span className="text-xs">Mint NFT</span>
                    </button>
                  )}
                  <button 
                    className="text-red-500 hover:text-red-600" 
                    title="Delete"
                    onClick={() => onDeleteFile(file)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {files.length === 0 && (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="text-center">
              <FileIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a new document.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
