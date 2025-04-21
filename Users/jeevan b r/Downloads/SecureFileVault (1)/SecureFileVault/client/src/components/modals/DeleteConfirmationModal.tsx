import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File } from "@shared/schema";
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (fileId: number) => void;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  file, 
  onClose, 
  onConfirm,
  isDeleting
}: DeleteConfirmationModalProps) {
  const handleConfirmDelete = () => {
    if (!file) return;
    onConfirm(file.id);
  };
  
  if (!file) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="delete-confirmation-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-red-900">Delete Document</DialogTitle>
            <button 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p id="delete-confirmation-description" className="sr-only">
            Confirm deletion of document. This action cannot be undone.
          </p>
        </DialogHeader>
        
        <div className="px-6 py-4">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Document</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{file.name}</span>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-3"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
