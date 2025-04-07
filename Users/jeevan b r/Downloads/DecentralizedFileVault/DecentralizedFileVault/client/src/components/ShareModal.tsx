import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFileShare } from "@/hooks/useFiles";
import { isValidEthereumAddress } from "@/lib/walletUtils";
import { Share2 } from "lucide-react";

interface ShareModalProps {
  fileId: number;
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export default function ShareModal({
  fileId,
  isOpen,
  onClose,
  walletAddress,
}: ShareModalProps) {
  const [shareAddress, setShareAddress] = useState("");
  const [permission, setPermission] = useState("view");
  const [addressError, setAddressError] = useState("");
  const { shareFile, isSharing } = useFileShare();

  const validateAddress = (address: string) => {
    if (!address) {
      setAddressError("Wallet address is required");
      return false;
    }

    if (!isValidEthereumAddress(address)) {
      setAddressError("Invalid Ethereum wallet address");
      return false;
    }

    if (address.toLowerCase() === walletAddress.toLowerCase()) {
      setAddressError("You can't share with yourself");
      return false;
    }

    setAddressError("");
    return true;
  };

  const handleShare = () => {
    if (!validateAddress(shareAddress)) return;

    shareFile({
      fileId,
      ownerWalletAddress: walletAddress,
      sharedWithWalletAddress: shareAddress,
      permission,
    }, {
      onSuccess: () => {
        onClose();
        setShareAddress("");
        setPermission("view");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share access to this file with other Exodus wallet users.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet-address">Exodus Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x0000...0000"
              value={shareAddress}
              onChange={(e) => {
                setShareAddress(e.target.value);
                if (addressError) validateAddress(e.target.value);
              }}
              className={addressError ? "border-red-500" : ""}
            />
            {addressError && (
              <p className="text-sm text-red-500">{addressError}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="permission">Permission</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger id="permission">
                <SelectValue placeholder="Select permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="download">View and Download</SelectItem>
                <SelectItem value="full">Full Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
