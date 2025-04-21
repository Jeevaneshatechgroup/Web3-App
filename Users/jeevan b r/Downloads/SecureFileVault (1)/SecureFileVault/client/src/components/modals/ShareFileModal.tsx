import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File } from "@shared/schema";
import { X, Share2, Eye, Edit } from 'lucide-react';
import { addDays, addWeeks, format } from 'date-fns';
import { ethers } from 'ethers';

interface ShareFileModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onShare: (fileId: number, walletAddress: string, canEdit: boolean, expiresAt: Date | null) => void;
  isSharing: boolean;
}

type Permission = 'view' | 'edit';
type Expiration = '1day' | '1week' | 'never';

export default function ShareFileModal({ 
  isOpen, 
  file, 
  onClose, 
  onShare,
  isSharing 
}: ShareFileModalProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  const [expiration, setExpiration] = useState<Expiration>('1week');
  const [isWalletValid, setIsWalletValid] = useState(false);
  
  const validateWalletAddress = (address: string) => {
    try {
      return ethers.isAddress(address);
    } catch (e) {
      return false;
    }
  };
  
  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setWalletAddress(address);
    if (import.meta.env.DEV) {
      setIsWalletValid(address.length >= 10);
    } else {
      setIsWalletValid(validateWalletAddress(address));
    }
  };
  
  const handleShare = () => {
    if (!file || !isWalletValid) {
      console.error('Cannot share: File is missing or wallet address is invalid', { 
        fileExists: !!file, 
        isWalletValid 
      });
      return;
    }
    
    let expiresAt: Date | null = null;
    
    if (expiration === '1day') {
      expiresAt = addDays(new Date(), 1);
    } else if (expiration === '1week') {
      expiresAt = addWeeks(new Date(), 1);
    }
    
    console.log('Sharing file', { 
      fileId: file.id, 
      walletAddress, 
      canEdit: permission === 'edit', 
      expiresAt 
    });
    
    onShare(file.id, walletAddress, permission === 'edit', expiresAt);
  };
  
  const handleCloseModal = () => {
    setWalletAddress('');
    setPermission('view');
    setExpiration('1week');
    setIsWalletValid(false);
    onClose();
  };
  
  if (!file) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-md" aria-describedby="share-document-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">Share Document</DialogTitle>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={handleCloseModal}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p id="share-document-description" className="text-sm text-gray-500 mt-1">
            Share your document with other users by entering their wallet address
          </p>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Share <span className="font-medium text-gray-900">{file.name}</span> with other users
          </p>
          
          <div className="mb-4">
            <Label htmlFor="wallet-address" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient's Wallet Address
            </Label>
            <Input
              id="wallet-address"
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={handleWalletAddressChange}
              className={`${!walletAddress ? '' : (isWalletValid ? 'border-green-500' : 'border-red-500')}`}
            />
            {walletAddress && !isWalletValid && (
              <p className="mt-1 text-xs text-red-500">Please enter a valid Ethereum wallet address</p>
            )}
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</Label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <div 
                className={`cursor-pointer flex p-3 border rounded-md shadow-sm text-sm font-medium ${
                  permission === 'view' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setPermission('view')}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Only
              </div>
              <div 
                className={`cursor-pointer flex p-3 border rounded-md shadow-sm text-sm font-medium ${
                  permission === 'edit' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setPermission('edit')}
              >
                <Edit className="mr-2 h-4 w-4" />
                View & Edit
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Expiration</Label>
            <div className="mt-1 grid grid-cols-3 gap-3">
              <div 
                className={`cursor-pointer flex p-3 justify-center border rounded-md shadow-sm text-sm font-medium ${
                  expiration === '1day' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setExpiration('1day')}
              >
                1 Day
              </div>
              <div 
                className={`cursor-pointer flex p-3 justify-center border rounded-md shadow-sm text-sm font-medium ${
                  expiration === '1week' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setExpiration('1week')}
              >
                1 Week
              </div>
              <div 
                className={`cursor-pointer flex p-3 justify-center border rounded-md shadow-sm text-sm font-medium ${
                  expiration === 'never' 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setExpiration('never')}
              >
                Never
              </div>
            </div>
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
            onClick={handleShare}
            disabled={!isWalletValid || isSharing}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
