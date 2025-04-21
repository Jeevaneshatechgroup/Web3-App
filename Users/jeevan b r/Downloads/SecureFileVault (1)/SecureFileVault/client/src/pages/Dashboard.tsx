// // import { useState, useEffect } from 'react';
// // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// // import { apiRequest } from '@/lib/queryClient';
// // import { File } from '@shared/schema';
// // import { useToast } from '@/hooks/use-toast';
// // import { ConnectedWallet, mintNFT } from '@/lib/web3';
// // import { 
// //   generateEncryptionKey, 
// //   exportKeyToBase64,
// //   importKeyFromBase64,
// //   encryptContent,
// //   decryptContent,
// //   generateWalletSpecificKey,
// //   storeFileEncryptionKey,
// //   getFileEncryptionKey
// // } from '@/lib/crypto';
// // import { Upload, PlusCircle } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import FileGridView from '@/components/FileGridView';
// // import FileViewerModal from '@/components/modals/FileViewerModal';
// // import FileUploadModal from '@/components/modals/FileUploadModal';
// // import ShareFileModal from '@/components/modals/ShareFileModal';
// // import MintNFTModal from '@/components/modals/MintNFTModal';
// // import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
// // import WalletStatus from '@/components/WalletStatus';

// // interface DashboardProps {
// //   wallet: ConnectedWallet | null;
// //   onSwitchNetwork: () => void;
// // }

// // export default function Dashboard({ wallet, onSwitchNetwork }: DashboardProps) {
// //   const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
// //   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
// //   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
// //   const [isMintModalOpen, setIsMintModalOpen] = useState(false);
// //   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
// //   const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();
  
// //   // Get user by wallet address
// //   const { data: userData } = useQuery({
// //     queryKey: [`/api/users/wallet/${wallet?.address}`],
// //     enabled: !!wallet?.address
// //   });
  
// //   // Get files for the logged in user
// //   const { data: files = [] } = useQuery<File[]>({
// //     queryKey: [`/api/files/user/${userData?.id}`],
// //     enabled: !!userData?.id
// //   });
  
// //   // File upload mutation
// //   const uploadMutation = useMutation({
// //     mutationFn: async (fileData: { userId: number, name: string, type: string, size: number, content: string }[]) => {
// //       // Process files without encryption
// //       const filePromises = fileData.map(async (file) => {
// //         try {
// //           console.log('Uploading file:', { 
// //             fileName: file.name, 
// //             fileType: file.type,
// //             contentLength: file.content.length
// //           });
          
// //           // Store file content without encryption
// //           const result = await apiRequest('POST', '/api/files', {
// //             ...file,
// //             content: file.content,
// //             isEncrypted: false // No encryption
// //           });
          
// //           if (!result) {
// //             console.error('Upload failed with empty response');
// //           }
          
// //           return result;
// //         } catch (error) {
// //           console.error('Error uploading file:', error);
// //           throw error;
// //         }
// //       });
      
// //       return Promise.all(filePromises);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
// //       setIsUploadModalOpen(false);
// //       toast({
// //         title: "Files uploaded successfully",
// //         description: "Your files have been uploaded and are now available.",
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Upload failed",
// //         description: error instanceof Error ? error.message : "Failed to upload files",
// //         variant: "destructive",
// //       });
// //     }
// //   });
  
// //   // Delete file mutation
// //   const deleteMutation = useMutation({
// //     mutationFn: async (fileId: number) => {
// //       return apiRequest('DELETE', `/api/files/${fileId}`);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
// //       setIsDeleteModalOpen(false);
// //       toast({
// //         title: "File deleted",
// //         description: "The file has been deleted successfully.",
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Deletion failed",
// //         description: error instanceof Error ? error.message : "Failed to delete file",
// //         variant: "destructive",
// //       });
// //     }
// //   });
  
// //   // Share file mutation
// //   const shareMutation = useMutation({
// //     mutationFn: async ({ 
// //       fileId, 
// //       walletAddress, 
// //       canEdit, 
// //       expiresAt 
// //     }: { 
// //       fileId: number; 
// //       walletAddress: string; 
// //       canEdit: boolean; 
// //       expiresAt: Date | null;
// //     }) => {
// //       try {
// //         console.log('Starting share process for file ID:', fileId);
        
// //         // Validate the wallet address
// //         if (!walletAddress || walletAddress.length < 10) {
// //           throw new Error('Invalid wallet address format');
// //         }
        
// //         // First fetch the file to ensure we have all the data
// //         const fileResponse = await fetch(`/api/files/${fileId}`);
// //         if (!fileResponse.ok) {
// //           throw new Error('Failed to fetch file data for sharing');
// //         }
        
// //         const fileData = await fileResponse.json();
        
// //         // Ensure expiresAt is properly formatted for the API
// //         const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : null;
        
// //         // No encryption is needed anymore
// //         // Just log the sharing action
// //         console.log('Sharing file:', { fileId });
        
// //         console.log('Sending share data:', {
// //           fileId,
// //           sharedByUserId: userData?.id,
// //           sharedToWalletAddress: walletAddress,
// //           canEdit,
// //           expiresAt: formattedExpiresAt
// //         });
        
// //         // Create the share
// //         return await fetch('/api/shares', {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json'
// //           },
// //           body: JSON.stringify({
// //             fileId,
// //             sharedByUserId: userData?.id,
// //             sharedToWalletAddress: walletAddress,
// //             canEdit,
// //             expiresAt: formattedExpiresAt
// //           })
// //         }).then(response => {
// //           if (!response.ok) {
// //             return response.json().then(err => {
// //               console.error('Share API error:', err);
// //               throw new Error(`${response.status}: ${JSON.stringify(err)}`);
// //             });
// //           }
// //           return response.json();
// //         });
// //       } catch (error) {
// //         console.error('Error in share mutation:', error);
// //         throw error;
// //       }
// //     },
// //     onSuccess: () => {
// //       setIsShareModalOpen(false);
// //       toast({
// //         title: "File shared successfully",
// //         description: "The recipient can now access this file using their wallet.",
// //       });
// //     },
// //     onError: (error) => {
// //       console.error('Share error details:', error);
// //       toast({
// //         title: "Sharing failed",
// //         description: error instanceof Error ? error.message : "Failed to share file. Please try again.",
// //         variant: "destructive",
// //       });
// //     }
// //   });
  
// //   // Mint NFT mutation
// //   const mintMutation = useMutation({
// //     mutationFn: async ({
// //       fileId, 
// //       name, 
// //       description, 
// //       network
// //     }: {
// //       fileId: number;
// //       name: string;
// //       description: string;
// //       network: string;
// //     }) => {
// //       if (!wallet) throw new Error("Wallet not connected");

// //       // Get the file content for IPFS upload
// //       const fileResponse = await fetch(`/api/files/${fileId}`);
// //       if (!fileResponse.ok) {
// //         throw new Error('Failed to fetch file for IPFS upload');
// //       }
// //       const fileData = await fileResponse.json();

// //       // Create metadata
// //       const metadata = {
// //         name,
// //         description,
// //         external_url: `https://gateway.pinata.cloud/ipfs/`,
// //         image: fileData.content,
// //         attributes: [
// //           { trait_type: "Type", value: fileData.type || "Document" },
// //           { trait_type: "Size", value: fileData.size || 0 },
// //           { trait_type: "Created", value: new Date().toISOString() },
// //           { trait_type: "Network", value: network },
// //           { trait_type: "Owner", value: wallet.address }
// //         ]
// //       };

// //       // Upload to Pinata
// //       const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'pinata_api_key':  '06a7f443e87c11c1a0e9',
// //           'pinata_secret_api_key':  '4aebc79982a6c31252b19f1a232eb360275de0df1e0f9b0de5485ba486a87f45'
// //         },
// //         body: JSON.stringify(metadata)
// //       });

// //       if (!pinataResponse.ok) {
// //         throw new Error('Failed to upload to IPFS via Pinata');
// //       }

// //       const pinataData = await pinataResponse.json();
// //       const ipfsHash = `ipfs://${pinataData.IpfsHash}`;
      
// //       // Create valid NFT metadata
// //       const nftMetadata = {
// //         name,
// //         description,
// //         image: ipfsHash,
// //         external_url: `https://bafybeie.ipfs.dweb.link/${cidSuffix}`, // For linking externally
// //         attributes: [
// //           { trait_type: "Type", value: selectedFile?.type || "Document" },
// //           { trait_type: "Size", value: selectedFile?.size || 0 },
// //           { trait_type: "Created", value: new Date().toISOString() },
// //           { trait_type: "Network", value: network },
// //           { trait_type: "Owner", value: wallet.address.slice(0, 8) + '...' + wallet.address.slice(-6) }
// //         ]
// //       };
      
// //       // In a real implementation, we would mint the NFT on the blockchain here
// //       // const receipt = await mintNFT(contractAddress, tokenURI, wallet);
      
// //       // Update the file record to mark it as an NFT
// //       return apiRequest('PATCH', `/api/files/${fileId}/mint`, {
// //         ipfsHash: ipfsHash,
// //         nftMetadata
// //       });
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
// //       setIsMintModalOpen(false);
// //       toast({
// //         title: "NFT minted",
// //         description: "Your file has been minted as an NFT successfully.",
// //       });
// //     },
// //     onError: (error) => {
// //       toast({
// //         title: "Minting failed",
// //         description: error instanceof Error ? error.message : "Failed to mint NFT",
// //         variant: "destructive",
// //       });
// //     }
// //   });
  
// //   // Handle file operations
// //   const handleViewFile = (file: File) => {
// //     setSelectedFile(file);
// //     setIsFileViewerOpen(true);
// //   };
  
// //   const handleDeleteFile = (file: File) => {
// //     setSelectedFile(file);
// //     setIsDeleteModalOpen(true);
// //   };
  
// //   // Download file mutation - to get the full file content before downloading
// //   const downloadMutation = useMutation({
// //     mutationFn: async (fileId: number) => {
// //       console.log('Fetching file for download, ID:', fileId);
// //       // Add a transform function to directly fetch and return JSON data
// //       const response = await fetch(`/api/files/${fileId}`);
// //       if (!response.ok) {
// //         throw new Error('Failed to fetch file');
// //       }
// //       return response.json();
// //     },
// //     onSuccess: async (fullFile: any) => {
// //       try {
// //         console.log('Received file data for download:', { 
// //           fileName: fullFile.name,
// //           fileType: fullFile.type,
// //           hasContent: !!fullFile.content,
// //           contentLength: fullFile.content ? fullFile.content.length : 0,
// //           isEncrypted: fullFile.isEncrypted
// //         });
        
// //         if (!fullFile || !fullFile.content) {
// //           throw new Error('File content is missing or empty');
// //         }
        
// //         // No encryption handling needed anymore
// //         const contentToProcess = fullFile.content;
        
// //         // Handle legacy encrypted files if they exist
// //         if (fullFile.isEncrypted) {
// //           console.log('Warning: Found encrypted file in storage');
// //           toast({
// //             title: "Legacy File Format",
// //             description: "This file was encrypted with the old system. It may not be accessible.",
// //             variant: "destructive",
// //           });
// //         }
        
// //         // Convert base64 to Blob
// //         const byteCharacters = atob(contentToProcess);
// //         const byteArrays = [];
        
// //         for (let offset = 0; offset < byteCharacters.length; offset += 512) {
// //           const slice = byteCharacters.slice(offset, offset + 512);
          
// //           const byteNumbers = new Array(slice.length);
// //           for (let i = 0; i < slice.length; i++) {
// //             byteNumbers[i] = slice.charCodeAt(i);
// //           }
          
// //           const byteArray = new Uint8Array(byteNumbers);
// //           byteArrays.push(byteArray);
// //         }
        
// //         const blob = new Blob(byteArrays, { type: fullFile.type });
        
// //         // Create a download link
// //         const link = document.createElement('a');
// //         link.href = URL.createObjectURL(blob);
// //         link.download = fullFile.name;
        
// //         // For testing, add a timestamp to avoid cache issues
// //         if (import.meta.env.DEV) {
// //           link.download = `${fullFile.name.split('.')[0]}_${Date.now()}.${fullFile.name.split('.').pop()}`;
// //         }
        
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
        
// //         toast({
// //           title: "Download started",
// //           description: `${fullFile.name} is being downloaded.`,
// //         });
// //       } catch (error) {
// //         console.error('Download process error:', error);
// //         toast({
// //           title: "Download failed",
// //           description: error instanceof Error ? error.message : "There was an error processing the file for download.",
// //           variant: "destructive",
// //         });
// //       }
// //     },
// //     onError: (error) => {
// //       console.error('Download fetch error:', error);
// //       toast({
// //         title: "Download failed",
// //         description: "There was an error retrieving the file.",
// //         variant: "destructive",
// //       });
// //     }
// //   });
  
// //   const handleDownloadFile = (file: File) => {
// //     downloadMutation.mutate(file.id);
// //   };
  
// //   const handleShareFile = (file: File) => {
// //     setSelectedFile(file);
// //     setIsShareModalOpen(true);
// //   };
  
// //   const handleMintAsNFT = (file: File) => {
// //     setSelectedFile(file);
// //     setIsMintModalOpen(true);
// //   };
  
// //   const handleViewNFT = (file: File) => {
// //     // Check if the file is minted as an NFT and has an IPFS hash
// //     if (!file.isNft || !file.ipfsHash) {
// //       toast({
// //         title: "NFT not found",
// //         description: "This file has not been minted as an NFT yet.",
// //         variant: "destructive",
// //       });
// //       return;
// //     }
    
// //     try {
// //       // Check if we should attempt to open a gateway URL or show local details
// //       // Get the metadata which might contain an external URL
// //       const metadata = file.nftMetadata as any;
// //       const externalUrl = metadata?.external_url;
      
// //       // For this demo, create a custom viewer instead of attempting to access IPFS gateways
// //       // In production, you would use a real IPFS gateway like Infura, Pinata, or a public gateway
      
// //       // Create a data URL with HTML content showing NFT details
// //       const htmlContent = `
// //         <!DOCTYPE html>
// //         <html>
// //         <head>
// //           <title>NFT Details - ${file.name}</title>
// //           <style>
// //             body {
// //               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
// //               line-height: 1.6;
// //               color: #333;
// //               max-width: 800px;
// //               margin: 0 auto;
// //               padding: 2rem;
// //               background: linear-gradient(to bottom, #f9f9f9, #f1f1f1);
// //             }
// //             .container {
// //               background-color: white;
// //               border-radius: 8px;
// //               box-shadow: 0 2px 10px rgba(0,0,0,0.1);
// //               padding: 2rem;
// //             }
// //             .header {
// //               border-bottom: 1px solid #eee;
// //               padding-bottom: 1rem;
// //               margin-bottom: 1rem;
// //             }
// //             h1 {
// //               color: #2563eb;
// //               margin-top: 0;
// //             }
// //             .detail {
// //               display: flex;
// //               margin-bottom: 1rem;
// //             }
// //             .detail-label {
// //               font-weight: bold;
// //               width: 150px;
// //               flex-shrink: 0;
// //             }
// //             .badge {
// //               display: inline-block;
// //               background-color: #dbeafe;
// //               color: #1e40af;
// //               border-radius: 9999px;
// //               padding: 0.25rem 0.75rem;
// //               font-size: 0.875rem;
// //               font-weight: 500;
// //             }
// //             pre {
// //               background-color: #f7fafc;
// //               border-radius: 4px;
// //               padding: 1rem;
// //               overflow-x: auto;
// //             }
// //             .footer {
// //               margin-top: 2rem;
// //               font-size: 0.875rem;
// //               color: #6b7280;
// //               text-align: center;
// //             }
// //             .note {
// //               background-color: #fffbeb;
// //               border-left: 4px solid #f59e0b;
// //               padding: 1rem;
// //               margin-top: 2rem;
// //             }
// //           </style>
// //         </head>
// //         <body>
// //           <div class="container">
// //             <div class="header">
// //               <h1>NFT Information</h1>
// //               <p>Decentralized File Storage NFT</p>
// //               <span class="badge">Demo Mode</span>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">Name:</div>
// //               <div>${file.name}</div>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">File Type:</div>
// //               <div>${file.type}</div>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">Size:</div>
// //               <div>${file.size} bytes</div>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">Minted:</div>
// //               <div>${new Date(file.uploadedAt).toLocaleString()}</div>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">Content CID:</div>
// //               <div>${file.ipfsHash}</div>
// //             </div>
            
// //             <div class="detail">
// //               <div class="detail-label">Owner:</div>
// //               <div>${wallet?.address || 'Unknown'}</div>
// //             </div>
            
// //             ${file.nftMetadata ? `
// //             <h2>Metadata</h2>
// //             <pre>${JSON.stringify(file.nftMetadata, null, 2)}</pre>
// //             ` : ''}
            
// //             <div class="note">
// //               <strong>Note:</strong> This is a demonstration view. In a production environment, this would link to the actual NFT on a marketplace or blockchain explorer.
// //             </div>
// //           </div>
          
// //           <div class="footer">
// //             Decentralized Identity - Web3 Secure File Storage
// //           </div>
// //         </body>
// //         </html>
// //       `;
      
// //       // Create a Blob with the HTML content
// //       const blob = new Blob([htmlContent], { type: 'text/html' });
// //       const dataUrl = URL.createObjectURL(blob);
      
// //       // Notify the user
// //       toast({
// //         title: "Opening NFT Details",
// //         description: "Showing NFT information in a new tab.",
// //       });
      
// //       // Open in a new browser tab
// //       window.open(dataUrl, '_blank');
// //     } catch (error) {
// //       console.error('Error displaying NFT details:', error);
// //       toast({
// //         title: "Failed to display NFT details",
// //         description: "There was an error showing the NFT information.",
// //         variant: "destructive",
// //       });
// //     }
// //   };
  
// //   const handleUploadFiles = (filesData: Array<{ name: string; type: string; size: number; content: string }>) => {
// //     if (!userData?.id) {
// //       toast({
// //         title: "Upload failed",
// //         description: "You need to be logged in to upload files",
// //         variant: "destructive",
// //       });
// //       return;
// //     }
    
// //     // Prepare file data with userId
// //     const fileData = filesData.map(file => ({
// //       ...file,
// //       userId: userData.id
// //     }));
    
// //     uploadMutation.mutate(fileData);
// //   };
  
// //   const handleShareSubmit = (fileId: number, walletAddress: string, canEdit: boolean, expiresAt: Date | null) => {
// //     shareMutation.mutate({ fileId, walletAddress, canEdit, expiresAt });
// //   };
  
// //   const handleDeleteConfirm = (fileId: number) => {
// //     deleteMutation.mutate(fileId);
// //   };
  
// //   const handleMintNFT = (fileId: number, name: string, description: string, network: string) => {
// //     mintMutation.mutate({ fileId, name, description, network });
// //   };
  
// //   return (
// //     <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
// //       {/* Page Header */}
// //       <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
// //         <div className="flex-1 min-w-0">
// //           <h1 className="text-2xl font-semibold text-gray-800 sm:truncate">My Documents</h1>
// //           <p className="mt-1 text-sm text-gray-500">
// //             Securely store, view, and share your important files
// //           </p>
// //         </div>
// //         <div className="mt-4 flex md:mt-0 md:ml-4">
// //           <Button 
// //             onClick={() => setIsUploadModalOpen(true)}
// //             className="ml-3 inline-flex items-center"
// //           >
// //             <Upload className="mr-2 h-4 w-4" />
// //             Upload Files
// //           </Button>
// //         </div>
// //       </div>
      
// //       {/* Wallet Status */}
// //       <WalletStatus 
// //         wallet={wallet} 
// //         onSwitchNetwork={onSwitchNetwork} 
// //       />
      
// //       {/* File Grid */}
// //       <FileGridView 
// //         files={files}
// //         onViewFile={handleViewFile}
// //         onDeleteFile={handleDeleteFile}
// //         onDownloadFile={handleDownloadFile}
// //         onShareFile={handleShareFile}
// //         onMintAsNFT={handleMintAsNFT}
// //         onViewNFT={handleViewNFT}
// //       />
      
// //       {/* Modals */}
// //       <FileViewerModal 
// //         isOpen={isFileViewerOpen}
// //         file={selectedFile}
// //         onClose={() => setIsFileViewerOpen(false)}
// //         onDownload={handleDownloadFile}
// //         onShare={handleShareFile}
// //         onMintNFT={handleMintAsNFT}
// //       />
      
// //       <FileUploadModal 
// //         isOpen={isUploadModalOpen}
// //         onClose={() => setIsUploadModalOpen(false)}
// //         onUpload={handleUploadFiles}
// //         isUploading={uploadMutation.isPending}
// //       />
      
// //       <ShareFileModal 
// //         isOpen={isShareModalOpen}
// //         file={selectedFile}
// //         onClose={() => setIsShareModalOpen(false)}
// //         onShare={handleShareSubmit}
// //         isSharing={shareMutation.isPending}
// //       />
      
// //       <MintNFTModal 
// //         isOpen={isMintModalOpen}
// //         file={selectedFile}
// //         onClose={() => setIsMintModalOpen(false)}
// //         onMint={handleMintNFT}
// //         isMinting={mintMutation.isPending}
// //       />
      
// //       <DeleteConfirmationModal 
// //         isOpen={isDeleteModalOpen}
// //         file={selectedFile}
// //         onClose={() => setIsDeleteModalOpen(false)}
// //         onConfirm={handleDeleteConfirm}
// //         isDeleting={deleteMutation.isPending}
// //       />
// //     </div>
// //   );
// // }

// import { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';
// import { File } from '@shared/schema';
// import { useToast } from '@/hooks/use-toast';
// import { ConnectedWallet, mintNFT } from '@/lib/web3';
// import { 
//   generateEncryptionKey, 
//   exportKeyToBase64,
//   importKeyFromBase64,
//   encryptContent,
//   decryptContent,
//   generateWalletSpecificKey,
//   storeFileEncryptionKey,
//   getFileEncryptionKey
// } from '@/lib/crypto';
// import { Upload, PlusCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import FileGridView from '@/components/FileGridView';
// import FileViewerModal from '@/components/modals/FileViewerModal';
// import FileUploadModal from '@/components/modals/FileUploadModal';
// import ShareFileModal from '@/components/modals/ShareFileModal';
// import MintNFTModal from '@/components/modals/MintNFTModal';
// import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
// import WalletStatus from '@/components/WalletStatus';

// interface DashboardProps {
//   wallet: ConnectedWallet | null;
//   onSwitchNetwork: () => void;
// }

// export default function Dashboard({ wallet, onSwitchNetwork }: DashboardProps) {
//   const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [isMintModalOpen, setIsMintModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
  
//   // Get user by wallet address
//   const { data: userData } = useQuery({
//     queryKey: [`/api/users/wallet/${wallet?.address}`],
//     enabled: !!wallet?.address
//   });
  
//   // Get files for the logged in user
//   const { data: files = [] } = useQuery<File[]>({
//     queryKey: [`/api/files/user/${userData?.id}`],
//     enabled: !!userData?.id
//   });
  
//   // File upload mutation
//   const uploadMutation = useMutation({
//     mutationFn: async (fileData: { userId: number, name: string, type: string, size: number, content: string }[]) => {
//       // Process files without encryption
//       const filePromises = fileData.map(async (file) => {
//         try {
//           console.log('Uploading file:', { 
//             fileName: file.name, 
//             fileType: file.type,
//             contentLength: file.content.length
//           });
          
//           // Store file content without encryption
//           const result = await apiRequest('POST', '/api/files', {
//             ...file,
//             content: file.content,
//             isEncrypted: false // No encryption
//           });
          
//           if (!result) {
//             console.error('Upload failed with empty response');
//           }
          
//           return result;
//         } catch (error) {
//           console.error('Error uploading file:', error);
//           throw error;
//         }
//       });
      
//       return Promise.all(filePromises);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
//       setIsUploadModalOpen(false);
//       toast({
//         title: "Files uploaded successfully",
//         description: "Your files have been uploaded and are now available.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Upload failed",
//         description: error instanceof Error ? error.message : "Failed to upload files",
//         variant: "destructive",
//       });
//     }
//   });
  
//   // Delete file mutation
//   const deleteMutation = useMutation({
//     mutationFn: async (fileId: number) => {
//       return apiRequest('DELETE', `/api/files/${fileId}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
//       setIsDeleteModalOpen(false);
//       toast({
//         title: "File deleted",
//         description: "The file has been deleted successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Deletion failed",
//         description: error instanceof Error ? error.message : "Failed to delete file",
//         variant: "destructive",
//       });
//     }
//   });
  
//   // Share file mutation
//   const shareMutation = useMutation({
//     mutationFn: async ({ 
//       fileId, 
//       walletAddress, 
//       canEdit, 
//       expiresAt 
//     }: { 
//       fileId: number; 
//       walletAddress: string; 
//       canEdit: boolean; 
//       expiresAt: Date | null;
//     }) => {
//       try {
//         console.log('Starting share process for file ID:', fileId);
        
//         // Validate the wallet address
//         if (!walletAddress || walletAddress.length < 10) {
//           throw new Error('Invalid wallet address format');
//         }
        
//         // First fetch the file to ensure we have all the data
//         const fileResponse = await fetch(`/api/files/${fileId}`);
//         if (!fileResponse.ok) {
//           throw new Error('Failed to fetch file data for sharing');
//         }
        
//         const fileData = await fileResponse.json();
        
//         // Ensure expiresAt is properly formatted for the API
//         const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : null;
        
//         // No encryption is needed anymore
//         // Just log the sharing action
//         console.log('Sharing file:', { fileId });
        
//         console.log('Sending share data:', {
//           fileId,
//           sharedByUserId: userData?.id,
//           sharedToWalletAddress: walletAddress,
//           canEdit,
//           expiresAt: formattedExpiresAt
//         });
        
//         // Create the share
//         return await fetch('/api/shares', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             fileId,
//             sharedByUserId: userData?.id,
//             sharedToWalletAddress: walletAddress,
//             canEdit,
//             expiresAt: formattedExpiresAt
//           })
//         }).then(response => {
//           if (!response.ok) {
//             return response.json().then(err => {
//               console.error('Share API error:', err);
//               throw new Error(`${response.status}: ${JSON.stringify(err)}`);
//             });
//           }
//           return response.json();
//         });
//       } catch (error) {
//         console.error('Error in share mutation:', error);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       setIsShareModalOpen(false);
//       toast({
//         title: "File shared successfully",
//         description: "The recipient can now access this file using their wallet.",
//       });
//     },
//     onError: (error) => {
//       console.error('Share error details:', error);
//       toast({
//         title: "Sharing failed",
//         description: error instanceof Error ? error.message : "Failed to share file. Please try again.",
//         variant: "destructive",
//       });
//     }
//   });
  
//   // Mint NFT mutation
//   const mintMutation = useMutation({
//     mutationFn: async ({
//       fileId, 
//       name, 
//       description, 
//       network
//     }: {
//       fileId: number;
//       name: string;
//       description: string;
//       network: string;
//     }) => {
//       if (!wallet) throw new Error("Wallet not connected");

//       // Get the file content for IPFS upload
//       const fileResponse = await fetch(`/api/files/${fileId}`);
//       if (!fileResponse.ok) {
//         throw new Error('Failed to fetch file for IPFS upload');
//       }
//       const fileData = await fileResponse.json();

//       // Create metadata
//       const metadata = {
//         name,
//         description,
//         external_url: `https://gateway.pinata.cloud/ipfs/`,
//         image: fileData.content,
//         attributes: [
//           { trait_type: "Type", value: fileData.type || "Document" },
//           { trait_type: "Size", value: fileData.size || 0 },
//           { trait_type: "Created", value: new Date().toISOString() },
//           { trait_type: "Network", value: network },
//           { trait_type: "Owner", value: wallet.address }
//         ]
//       };

//       // Upload to Pinata
//       const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'pinata_api_key':  '06a7f443e87c11c1a0e9',
//           'pinata_secret_api_key': '4aebc79982a6c31252b19f1a232eb360275de0df1e0f9b0de5485ba486a87f45'
//         },
//         body: JSON.stringify(metadata)
//       });

//       if (!pinataResponse.ok) {
//         throw new Error('Failed to upload to IPFS via Pinata');
//       }

//       const pinataData = await pinataResponse.json();
//       const ipfsHash = `ipfs://${pinataData.IpfsHash}`;
      
//       // Create valid NFT metadata
//       const nftMetadata = {
//         name,
//         description,
//         image: ipfsHash,
//         external_url: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`,
//         attributes: [
//           { trait_type: "Type", value: selectedFile?.type || "Document" },
//           { trait_type: "Size", value: selectedFile?.size || 0 },
//           { trait_type: "Created", value: new Date().toISOString() },
//           { trait_type: "Network", value: network },
//           { trait_type: "Owner", value: wallet.address.slice(0, 8) + '...' + wallet.address.slice(-6) }
//         ]
//       };
      
//       // In a real implementation, we would mint the NFT on the blockchain here
//       // const receipt = await mintNFT(contractAddress, tokenURI, wallet);
      
//       // Update the file record to mark it as an NFT
//       return apiRequest('PATCH', `/api/files/${fileId}/mint`, {
//         ipfsHash: ipfsHash,
//         nftMetadata
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
//       setIsMintModalOpen(false);
//       toast({
//         title: "NFT minted",
//         description: "Your file has been minted as an NFT successfully.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Minting failed",
//         description: error instanceof Error ? error.message : "Failed to mint NFT",
//         variant: "destructive",
//       });
//     }
//   });
  
//   // Handle file operations
//   const handleViewFile = (file: File) => {
//     setSelectedFile(file);
//     setIsFileViewerOpen(true);
//   };
  
//   const handleDeleteFile = (file: File) => {
//     setSelectedFile(file);
//     setIsDeleteModalOpen(true);
//   };
  
//   // Download file mutation - to get the full file content before downloading
//   const downloadMutation = useMutation({
//     mutationFn: async (fileId: number) => {
//       console.log('Fetching file for download, ID:', fileId);
//       // Add a transform function to directly fetch and return JSON data
//       const response = await fetch(`/api/files/${fileId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch file');
//       }
//       return response.json();
//     },
//     onSuccess: async (fullFile: any) => {
//       try {
//         console.log('Received file data for download:', { 
//           fileName: fullFile.name,
//           fileType: fullFile.type,
//           hasContent: !!fullFile.content,
//           contentLength: fullFile.content ? fullFile.content.length : 0,
//           isEncrypted: fullFile.isEncrypted
//         });
        
//         if (!fullFile || !fullFile.content) {
//           throw new Error('File content is missing or empty');
//         }
        
//         // No encryption handling needed anymore
//         const contentToProcess = fullFile.content;
        
//         // Handle legacy encrypted files if they exist
//         if (fullFile.isEncrypted) {
//           console.log('Warning: Found encrypted file in storage');
//           toast({
//             title: "Legacy File Format",
//             description: "This file was encrypted with the old system. It may not be accessible.",
//             variant: "destructive",
//           });
//         }
        
//         // Convert base64 to Blob
//         const byteCharacters = atob(contentToProcess);
//         const byteArrays = [];
        
//         for (let offset = 0; offset < byteCharacters.length; offset += 512) {
//           const slice = byteCharacters.slice(offset, offset + 512);
          
//           const byteNumbers = new Array(slice.length);
//           for (let i = 0; i < slice.length; i++) {
//             byteNumbers[i] = slice.charCodeAt(i);
//           }
          
//           const byteArray = new Uint8Array(byteNumbers);
//           byteArrays.push(byteArray);
//         }
        
//         const blob = new Blob(byteArrays, { type: fullFile.type });
        
//         // Create a download link
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = fullFile.name;
        
//         // For testing, add a timestamp to avoid cache issues
//         if (import.meta.env.DEV) {
//           link.download = `${fullFile.name.split('.')[0]}_${Date.now()}.${fullFile.name.split('.').pop()}`;
//         }
        
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
        
//         toast({
//           title: "Download started",
//           description: `${fullFile.name} is being downloaded.`,
//         });
//       } catch (error) {
//         console.error('Download process error:', error);
//         toast({
//           title: "Download failed",
//           description: error instanceof Error ? error.message : "There was an error processing the file for download.",
//           variant: "destructive",
//         });
//       }
//     },
//     onError: (error) => {
//       console.error('Download fetch error:', error);
//       toast({
//         title: "Download failed",
//         description: "There was an error retrieving the file.",
//         variant: "destructive",
//       });
//     }
//   });
  
//   const handleDownloadFile = (file: File) => {
//     downloadMutation.mutate(file.id);
//   };
  
//   const handleShareFile = (file: File) => {
//     setSelectedFile(file);
//     setIsShareModalOpen(true);
//   };
  
//   const handleMintAsNFT = (file: File) => {
//     setSelectedFile(file);
//     setIsMintModalOpen(true);
//   };
  
//   const handleViewNFT = (file: File) => {
//     // Check if the file is minted as an NFT and has an IPFS hash
//     if (!file.isNft || !file.ipfsHash) {
//       toast({
//         title: "NFT not found",
//         description: "This file has not been minted as an NFT yet.",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     try {
//       // Check if we should attempt to open a gateway URL or show local details
//       // Get the metadata which might contain an external URL
//       const metadata = file.nftMetadata as any;
//       const externalUrl = metadata?.external_url;
      
//       // For this demo, create a custom viewer instead of attempting to access IPFS gateways
//       // In production, you would use a real IPFS gateway like Infura, Pinata, or a public gateway
      
//       // Create a data URL with HTML content showing NFT details
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>NFT Details - ${file.name}</title>
//           <style>
//             body {
//               font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//               max-width: 800px;
//               margin: 0 auto;
//               padding: 2rem;
//               background: linear-gradient(to bottom, #f9f9f9, #f1f1f1);
//             }
//             .container {
//               background-color: white;
//               border-radius: 8px;
//               box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//               padding: 2rem;
//             }
//             .header {
//               border-bottom: 1px solid #eee;
//               padding-bottom: 1rem;
//               margin-bottom: 1rem;
//             }
//             h1 {
//               color: #2563eb;
//               margin-top: 0;
//             }
//             .detail {
//               display: flex;
//               margin-bottom: 1rem;
//             }
//             .detail-label {
//               font-weight: bold;
//               width: 150px;
//               flex-shrink: 0;
//             }
//             .badge {
//               display: inline-block;
//               background-color: #dbeafe;
//               color: #1e40af;
//               border-radius: 9999px;
//               padding: 0.25rem 0.75rem;
//               font-size: 0.875rem;
//               font-weight: 500;
//             }
//             pre {
//               background-color: #f7fafc;
//               border-radius: 4px;
//               padding: 1rem;
//               overflow-x: auto;
//             }
//             .footer {
//               margin-top: 2rem;
//               font-size: 0.875rem;
//               color: #6b7280;
//               text-align: center;
//             }
//             .note {
//               background-color: #fffbeb;
//               border-left: 4px solid #f59e0b;
//               padding: 1rem;
//               margin-top: 2rem;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="header">
//               <h1>NFT Information</h1>
//               <p>Decentralized File Storage NFT</p>
//               <span class="badge">Demo Mode</span>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">Name:</div>
//               <div>${file.name}</div>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">File Type:</div>
//               <div>${file.type}</div>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">Size:</div>
//               <div>${file.size} bytes</div>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">Minted:</div>
//               <div>${new Date(file.uploadedAt).toLocaleString()}</div>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">Content CID:</div>
//               <div>${file.ipfsHash}</div>
//             </div>
            
//             <div class="detail">
//               <div class="detail-label">Owner:</div>
//               <div>${wallet?.address || 'Unknown'}</div>
//             </div>
            
//             ${file.nftMetadata ? `
//             <h2>Metadata</h2>
//             <pre>${JSON.stringify(file.nftMetadata, null, 2)}</pre>
//             ` : ''}
            
//             <div class="note">
//               <strong>Note:</strong> This is a demonstration view. In a production environment, this would link to the actual NFT on a marketplace or blockchain explorer.
//             </div>
//           </div>
          
//           <div class="footer">
//             Decentralized Identity - Web3 Secure File Storage
//           </div>
//         </body>
//         </html>
//       `;
      
//       // Create a Blob with the HTML content
//       const blob = new Blob([htmlContent], { type: 'text/html' });
//       const dataUrl = URL.createObjectURL(blob);
      
//       // Notify the user
//       toast({
//         title: "Opening NFT Details",
//         description: "Showing NFT information in a new tab.",
//       });
      
//       // Open in a new browser tab
//       window.open(dataUrl, '_blank');
//     } catch (error) {
//       console.error('Error displaying NFT details:', error);
//       toast({
//         title: "Failed to display NFT details",
//         description: "There was an error showing the NFT information.",
//         variant: "destructive",
//       });
//     }
//   };
  
//   const handleUploadFiles = (filesData: Array<{ name: string; type: string; size: number; content: string }>) => {
//     if (!userData?.id) {
//       toast({
//         title: "Upload failed",
//         description: "You need to be logged in to upload files",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     // Prepare file data with userId
//     const fileData = filesData.map(file => ({
//       ...file,
//       userId: userData.id
//     }));
    
//     uploadMutation.mutate(fileData);
//   };
  
//   const handleShareSubmit = (fileId: number, walletAddress: string, canEdit: boolean, expiresAt: Date | null) => {
//     shareMutation.mutate({ fileId, walletAddress, canEdit, expiresAt });
//   };
  
//   const handleDeleteConfirm = (fileId: number) => {
//     deleteMutation.mutate(fileId);
//   };
  
//   const handleMintNFT = (fileId: number, name: string, description: string, network: string) => {
//     mintMutation.mutate({ fileId, name, description, network });
//   };
  
//   return (
//     <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//       {/* Page Header */}
//       <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
//         <div className="flex-1 min-w-0">
//           <h1 className="text-2xl font-semibold text-gray-800 sm:truncate">My Documents</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Securely store, view, and share your important files
//           </p>
//         </div>
//         <div className="mt-4 flex md:mt-0 md:ml-4">
//           <Button 
//             onClick={() => setIsUploadModalOpen(true)}
//             className="ml-3 inline-flex items-center"
//           >
//             <Upload className="mr-2 h-4 w-4" />
//             Upload Files
//           </Button>
//         </div>
//       </div>
      
//       {/* Wallet Status */}
//       <WalletStatus 
//         wallet={wallet} 
//         onSwitchNetwork={onSwitchNetwork} 
//       />
      
//       {/* File Grid */}
//       <FileGridView 
//         files={files}
//         onViewFile={handleViewFile}
//         onDeleteFile={handleDeleteFile}
//         onDownloadFile={handleDownloadFile}
//         onShareFile={handleShareFile}
//         onMintAsNFT={handleMintAsNFT}
//         onViewNFT={handleViewNFT}
//       />
      
//       {/* Modals */}
//       <FileViewerModal 
//         isOpen={isFileViewerOpen}
//         file={selectedFile}
//         onClose={() => setIsFileViewerOpen(false)}
//         onDownload={handleDownloadFile}
//         onShare={handleShareFile}
//         onMintNFT={handleMintAsNFT}
//       />
      
//       <FileUploadModal 
//         isOpen={isUploadModalOpen}
//         onClose={() => setIsUploadModalOpen(false)}
//         onUpload={handleUploadFiles}
//         isUploading={uploadMutation.isPending}
//       />
      
//       <ShareFileModal 
//         isOpen={isShareModalOpen}
//         file={selectedFile}
//         onClose={() => setIsShareModalOpen(false)}
//         onShare={handleShareSubmit}
//         isSharing={shareMutation.isPending}
//       />
      
//       <MintNFTModal 
//         isOpen={isMintModalOpen}
//         file={selectedFile}
//         onClose={() => setIsMintModalOpen(false)}
//         onMint={handleMintNFT}
//         isMinting={mintMutation.isPending}
//       />
      
//       <DeleteConfirmationModal 
//         isOpen={isDeleteModalOpen}
//         file={selectedFile}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={handleDeleteConfirm}
//         isDeleting={deleteMutation.isPending}
//       />
//     </div>
//   );

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { File } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { ConnectedWallet, mintNFT } from '@/lib/web3';
import { 
  generateEncryptionKey, 
  exportKeyToBase64,
  importKeyFromBase64,
  encryptContent,
  decryptContent,
  generateWalletSpecificKey,
  storeFileEncryptionKey,
  getFileEncryptionKey
} from '@/lib/crypto';
import { Upload, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileGridView from '@/components/FileGridView';
import FileViewerModal from '@/components/modals/FileViewerModal';
import FileUploadModal from '@/components/modals/FileUploadModal';
import ShareFileModal from '@/components/modals/ShareFileModal';
import MintNFTModal from '@/components/modals/MintNFTModal';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import WalletStatus from '@/components/WalletStatus';



interface DashboardProps {
  wallet: ConnectedWallet | null;
  onSwitchNetwork: () => void;
}

export default function Dashboard({ wallet, onSwitchNetwork }: DashboardProps) {
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: userData } = useQuery({
    queryKey: [`/api/users/wallet/${wallet?.address}`],
    enabled: !!wallet?.address
  });
  
  const { data: files = [] } = useQuery<File[]>({
    queryKey: [`/api/files/user/${userData?.id}`],
    enabled: !!userData?.id
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (fileData: { userId: number, name: string, type: string, size: number, content: string }[]) => {
      const filePromises = fileData.map(async (file) => {
        try {
          console.log('Uploading file:', { 
            fileName: file.name, 
            fileType: file.type,
            contentLength: file.content.length
          });
          
          const result = await apiRequest('POST', '/api/files', {
            ...file,
            content: file.content,
            isEncrypted: false 
          });
          
          if (!result) {
            console.error('Upload failed with empty response');
          }
          
          return result;
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        }
      });
      
      return Promise.all(filePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
      setIsUploadModalOpen(false);
      toast({
        title: "Files uploaded successfully",
        description: "Your files have been uploaded and are now available.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
      setIsDeleteModalOpen(false);
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    }
  });
  
  const shareMutation = useMutation({
    mutationFn: async ({ 
      fileId, 
      walletAddress, 
      canEdit, 
      expiresAt 
    }: { 
      fileId: number; 
      walletAddress: string; 
      canEdit: boolean; 
      expiresAt: Date | null;
    }) => {
      try {
        console.log('Starting share process for file ID:', fileId);
        
        if (!walletAddress || walletAddress.length < 10) {
          throw new Error('Invalid wallet address format');
        }
        
        const fileResponse = await fetch(`/api/files/${fileId}`);
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch file data for sharing');
        }
        
        const fileData = await fileResponse.json();
        
        const formattedExpiresAt = expiresAt ? expiresAt.toISOString() : null;
        
        console.log('Sharing file:', { fileId });
        
        console.log('Sending share data:', {
          fileId,
          sharedByUserId: userData?.id,
          sharedToWalletAddress: walletAddress,
          canEdit,
          expiresAt: formattedExpiresAt
        });
        
        return await fetch('/api/shares', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId,
            sharedByUserId: userData?.id,
            sharedToWalletAddress: walletAddress,
            canEdit,
            expiresAt: formattedExpiresAt
          })
        }).then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              console.error('Share API error:', err);
              throw new Error(`${response.status}: ${JSON.stringify(err)}`);
            });
          }
          return response.json();
        });
      } catch (error) {
        console.error('Error in share mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsShareModalOpen(false);
      toast({
        title: "File shared successfully",
        description: "The recipient can now access this file using their wallet.",
      });
    },
    onError: (error) => {
      console.error('Share error details:', error);
      toast({
        title: "Sharing failed",
        description: error instanceof Error ? error.message : "Failed to share file. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const mintMutation = useMutation({
    mutationFn: async ({
      fileId, 
      name, 
      description, 
      network
    }: {
      fileId: number;
      name: string;
      description: string;
      network: string;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");

      const fileResponse = await fetch(`/api/files/${fileId}`);
      if (!fileResponse.ok) {
        throw new Error('Failed to fetch file for IPFS upload');
      }
      const fileData = await fileResponse.json();

      const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           'pinata_api_key':  '29f42ab0a2535c681471',
          'pinata_secret_api_key':  'ada2580fec5e1be49f3c4d0419829a4a8dd531c74b0247b1b4243d2df06d6210'
        },
        body: JSON.stringify({
          pinataContent: fileData.content,
          pinataMetadata: {
            name: `${name}_image`
          }
        })
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const imageData = await imageResponse.json();
      const imageUrl = `ipfs://${imageData.IpfsHash}`;

      const metadata = {
        name,
        description,
        image: imageUrl,
        external_url: `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`,
        attributes: [
          { trait_type: "Type", value: fileData.type || "Document" },
          { trait_type: "Size", value: fileData.size || 0 },
          { trait_type: "Created", value: new Date().toISOString() },
          { trait_type: "Network", value: network },
          { trait_type: "Owner", value: wallet.address }
        ]
      };

      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key':  '06a7f443e87c11c1a0e9',
          'pinata_secret_api_key':  '4aebc79982a6c31252b19f1a232eb360275de0df1e0f9b0de5485ba486a87f45'
        },
        body: JSON.stringify(metadata)
      });

      if (!pinataResponse.ok) {
        throw new Error('Failed to upload to IPFS via Pinata');
      }

      const pinataData = await pinataResponse.json();
      const ipfsHash = `ipfs://${pinataData.IpfsHash}`;
      
      const nftMetadata = {
        name,
        description,
        image: ipfsHash,
        external_url: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`,
        attributes: [
          { trait_type: "Type", value: selectedFile?.type || "Document" },
          { trait_type: "Size", value: selectedFile?.size || 0 },
          { trait_type: "Created", value: new Date().toISOString() },
          { trait_type: "Network", value: network },
          { trait_type: "Owner", value: wallet.address.slice(0, 8) + '...' + wallet.address.slice(-6) }
        ]
      };
      
           
      return apiRequest('PATCH', `/api/files/${fileId}/mint`, {
        ipfsHash: ipfsHash,
        nftMetadata
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/user/${userData?.id}`] });
      setIsMintModalOpen(false);
      toast({
        title: "NFT minted",
        description: "Your file has been minted as an NFT successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Minting failed",
        description: error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      });
    }
  });
  
  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setIsFileViewerOpen(true);
  };
  
  const handleDeleteFile = (file: File) => {
    setSelectedFile(file);
    setIsDeleteModalOpen(true);
  };
  
  const downloadMutation = useMutation({
    mutationFn: async (fileId: number) => {
      console.log('Fetching file for download, ID:', fileId);
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      return response.json();
    },
    onSuccess: async (fullFile: any) => {
      try {
        console.log('Received file data for download:', { 
          fileName: fullFile.name,
          fileType: fullFile.type,
          hasContent: !!fullFile.content,
          contentLength: fullFile.content ? fullFile.content.length : 0,
          isEncrypted: fullFile.isEncrypted
        });
        
        if (!fullFile || !fullFile.content) {
          throw new Error('File content is missing or empty');
        }
        
        const contentToProcess = fullFile.content;
        
        if (fullFile.isEncrypted) {
          console.log('Warning: Found encrypted file in storage');
          toast({
            title: "Legacy File Format",
            description: "This file was encrypted with the old system. It may not be accessible.",
            variant: "destructive",
          });
        }
        
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
        
        const blob = new Blob(byteArrays, { type: fullFile.type });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fullFile.name;
        
        if (import.meta.env.DEV) {
          link.download = `${fullFile.name.split('.')[0]}_${Date.now()}.${fullFile.name.split('.').pop()}`;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: `${fullFile.name} is being downloaded.`,
        });
      } catch (error) {
        console.error('Download process error:', error);
        toast({
          title: "Download failed",
          description: error instanceof Error ? error.message : "There was an error processing the file for download.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Download fetch error:', error);
      toast({
        title: "Download failed",
        description: "There was an error retrieving the file.",
        variant: "destructive",
      });
    }
  });

  const contractAddress = "0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const Dashboard = () => {
  const { walletAddress } = useWallet();
  const [metadataList, setMetadataList] = useState<any[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return;

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        const cids: string[] = await contract.getFilesSharedWithUser(walletAddress);

        const metadata = await Promise.all(
          cids.map(async (cid) => {
            const url = `${PINATA_GATEWAY}${cid}`;
            const res = await axios.get(url);
            return { cid, ...res.data };
          })
        );

        setMetadataList(metadata);
      } catch (err) {
        console.error("Error fetching NFTs from IPFS:", err);
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Shared Files</h1>
      {metadataList.length === 0 ? (
        <p>No files shared with this wallet yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metadataList.map((nft, idx) => (
            <div key={idx} className="border p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{nft.name}</h3>
              <p className="text-sm text-gray-600">{nft.description}</p>
              {nft.image && (
                <img
                  src={nft.image.replace("ipfs://", PINATA_GATEWAY)}
                  alt={nft.name}
                  className="mt-2 rounded"
                />
              )}
              <p className="text-xs mt-2 break-all">CID: {nft.cid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



  const handleDownloadFile = (file: File) => {
    downloadMutation.mutate(file.id);
  };
  
  const handleShareFile = (file: File) => {
    setSelectedFile(file);
    setIsShareModalOpen(true);
  };
  
  const handleMintAsNFT = (file: File) => {
    setSelectedFile(file);
    setIsMintModalOpen(true);
  };
  
  const handleViewNFT = (file: File) => {
    if (!file.isNft || !file.ipfsHash) {
      toast({
        title: "NFT not found",
        description: "This file has not been minted as an NFT yet.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const metadata = file.nftMetadata as any;
      const externalUrl = metadata?.external_url;
      
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NFT Details - ${file.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              background: linear-gradient(to bottom, #f9f9f9, #f1f1f1);
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              padding: 2rem;
            }
            .header {
              border-bottom: 1px solid #eee;
              padding-bottom: 1rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #2563eb;
              margin-top: 0;
            }
            .detail {
              display: flex;
              margin-bottom: 1rem;
            }
            .detail-label {
              font-weight: bold;
              width: 150px;
              flex-shrink: 0;
            }
            .badge {
              display: inline-block;
              background-color: #dbeafe;
              color: #1e40af;
              border-radius: 9999px;
              padding: 0.25rem 0.75rem;
              font-size: 0.875rem;
              font-weight: 500;
            }
            pre {
              background-color: #f7fafc;
              border-radius: 4px;
              padding: 1rem;
              overflow-x: auto;
            }
            .footer {
              margin-top: 2rem;
              font-size: 0.875rem;
              color: #6b7280;
              text-align: center;
            }
            .note {
              background-color: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 1rem;
              margin-top: 2rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NFT Information</h1>
              <p>Decentralized File Storage NFT</p>
            </div>
            
            <div class="detail">
              <div class="detail-label">Name:</div>
              <div>${file.name}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">File Type:</div>
              <div>${file.type}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Size:</div>
              <div>${file.size} bytes</div>
            </div>
            
            <div class="detail">
              <div class="detail-label" style="color: red;">Minted:</div>
              <div>${new Date(file.uploadedAt).toLocaleString()}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Content CID:</div>
              <div>${file.ipfsHash}</div>
            </div>
            
            <div class="detail">
              <div class="detail-label">Owner:</div>
              <div>${wallet?.address || 'Unknown'}</div>
            </div>
            
            ${file.nftMetadata ? `
            <h2>Metadata</h2>
            <pre>${JSON.stringify(file.nftMetadata, null, 2)}</pre>
            ` : ''}
            
            <div class="note">
              <strong>Note:</strong> This is a demonstration view. In a production environment, this would link to the actual NFT on a marketplace or blockchain explorer.
            </div>
          </div>
          
          <div class="footer">
            Decentralized Identity - Web3 Secure File Storage
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const dataUrl = URL.createObjectURL(blob);
      
      toast({
        title: "Opening NFT Details",
        description: "Showing NFT information in a new tab.",
      });
      
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Error displaying NFT details:', error);
      toast({
        title: "Failed to display NFT details",
        description: "There was an error showing the NFT information.",
        variant: "destructive",
      });
    }
  };
  
  const handleUploadFiles = (filesData: Array<{ name: string; type: string; size: number; content: string }>) => {
    if (!userData?.id) {
      toast({
        title: "Upload failed",
        description: "You need to be logged in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    const fileData = filesData.map(file => ({
      ...file,
      userId: userData.id
    }));
    
    uploadMutation.mutate(fileData);
  };
  
  const handleShareSubmit = (fileId: number, walletAddress: string, canEdit: boolean, expiresAt: Date | null) => {
    shareMutation.mutate({ fileId, walletAddress, canEdit, expiresAt });
  };
  
  const handleDeleteConfirm = (fileId: number) => {
    deleteMutation.mutate(fileId);
  };
  
  const handleMintNFT = (fileId: number, name: string, description: string, network: string) => {
    mintMutation.mutate({ fileId, name, description, network });
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

      <div className="md:flex md:items-center md:justify-between px-4 sm:px-0 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800 sm:truncate">My Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Securely store, view, and share your important files
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="ml-3 inline-flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>
      
      <WalletStatus 
        wallet={wallet} 
        onSwitchNetwork={onSwitchNetwork} 
      />
      
      <FileGridView 
        files={files}
        onViewFile={handleViewFile}
        onDeleteFile={handleDeleteFile}
        onDownloadFile={handleDownloadFile}
        onShareFile={handleShareFile}
        onMintAsNFT={handleMintAsNFT}
        onViewNFT={handleViewNFT}
      />
      
      <FileViewerModal 
        isOpen={isFileViewerOpen}
        file={selectedFile}
        onClose={() => setIsFileViewerOpen(false)}
        onDownload={handleDownloadFile}
        onShare={handleShareFile}
        onMintNFT={handleMintAsNFT}
      />
      
      <FileUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFiles}
        isUploading={uploadMutation.isPending}
      />
      
      <ShareFileModal 
        isOpen={isShareModalOpen}
        file={selectedFile}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareSubmit}
        isSharing={shareMutation.isPending}
      />
      
      <MintNFTModal 
        isOpen={isMintModalOpen}
        file={selectedFile}
        onClose={() => setIsMintModalOpen(false)}
        onMint={handleMintNFT}
        isMinting={mintMutation.isPending}
      />
      
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        file={selectedFile}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
