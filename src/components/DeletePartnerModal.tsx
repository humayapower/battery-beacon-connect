
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from 'lucide-react';
import { usePartners } from '@/hooks/usePartners';
import { useToast } = from '@/hooks/use-toast';
import { Partner } from '@/types';

interface DeletePartnerModalProps {
  partner: Partner;
  onPartnerDeleted?: () => void;
}

const DeletePartnerModal = ({ partner, onPartnerDeleted }: DeletePartnerModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { deletePartner } = usePartners();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deletePartner(partner.id);
      if (result.success) {
        setOpen(false);
        onPartnerDeleted?.();
      }
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Delete Partner</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the partner and update all associated batteries and customers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Partner to delete:</strong> {partner.name} ({partner.username})
              <br />
              <strong>Phone:</strong> {partner.phone}
              {partner.battery_count && partner.battery_count > 0 && (
                <>
                  <br />
                  <strong>Assigned Batteries:</strong> {partner.battery_count}
                </>
              )}
              {partner.customer_count && partner.customer_count > 0 && (
                <>
                  <br />
                  <strong>Customers:</strong> {partner.customer_count}
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Partner
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePartnerModal;
