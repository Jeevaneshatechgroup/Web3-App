import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File } from "@shared/schema";
import { X, Award, Info, FileText, FileImage, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface MintNFTModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onMint: (fileId: number, name: string, description: string, network: string) => void;
  isMinting: boolean;
}

type NetworkOption = 'ethereum' | 'polygon' | 'optimism' | 'arbitrum';

export default function MintNFTModal({ 
  isOpen, 
  file, 
  onClose, 
  onMint,
  isMinting 
}: MintNFTModalProps) {
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [network, setNetwork] = useState<NetworkOption>('ethereum');
  
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileIcon className="text-gray-500 h-10 w-10" />;
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return <FileText className="text-red-500 h-10 w-10" />;
    } else if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
      return <FileImage className="text-purple-500 h-10 w-10" />;
    } else if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) {
      return <FileSpreadsheet className="text-green-500 h-10 w-10" />;
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileText className="text-blue-500 h-10 w-10" />;
    } else {
      return <FileIcon className="text-gray-500 h-10 w-10" />;
    }
  };
  
  const handleMintNFT = () => {
    if (!file) return;
    onMint(file.id, nftName, description, network);
  };
  
  const handleCloseModal = () => {
    onClose();
  };
  
  const resetForm = () => {
    if (file) {
      setNftName(file.name);
      setDescription('');
    } else {
      setNftName('');
      setDescription('');
    }
    setNetwork('ethereum');
  };
  
  if (file && nftName === '' && isOpen) {
    resetForm();
  }
  
  if (!file) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">Mint as NFT</DialogTitle>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={handleCloseModal}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="mb-4 text-center">
            <div className="relative mx-auto w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center mb-4">
              {getFileIcon(file.type)}
              <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-700">
                  Minting this document as an NFT will create a permanent record of ownership on the blockchain.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="nft-name" className="block text-sm font-medium text-gray-700 mb-1">
              NFT Name
            </Label>
            <Input
              id="nft-name"
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="nft-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </Label>
            <Textarea
              id="nft-description"
              placeholder="Add a description for your NFT"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="blockchain-network" className="block text-sm font-medium text-gray-700 mb-1">
              Blockchain Network
            </Label>
            <Select
              value={network}
              onValueChange={(value) => setNetwork(value as NetworkOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="optimism">Optimism</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            variant="solid"
            onClick={handleMintNFT}
            disabled={nftName.trim() === '' || isMinting}
            className="bg-accent hover:bg-accent/90"
          >
            <Award className="mr-2 h-4 w-4" />
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
