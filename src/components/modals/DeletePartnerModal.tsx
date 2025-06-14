
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';

interface DeletePartnerModalProps {
  partnerId: string | null;
  partnerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const DeletePartnerModal = ({ partnerId, partnerName, isOpen, onClose }: DeletePartnerModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refetch } = useOptimizedPartners();

  const handleDelete = async () => {
    if (!partnerId) return;

    setLoading(true);
    try {
      // Check if partner has any batteries
      const { data: batteries, error: batteryError } = await supabase
        .from('batteries')
        .select('id')
        .eq('partner_id', partnerId)
        .limit(1);

      if (batteryError) throw batteryError;

      if (batteries && batteries.length > 0) {
        toast({
          title: "Cannot delete partner",
          description: "This partner has batteries assigned. Please reassign or delete all batteries first.",
          variant: "destructive",
        });
        return;
      }

      // Check if partner has any customers
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('partner_id', partnerId)
        .limit(1);

      if (customerError) throw customerError;

      if (customers && customers.length > 0) {
        toast({
          title: "Cannot delete partner",
          description: "This partner has customers assigned. Please reassign or delete all customers first.",
          variant: "destructive",
        });
        return;
      }

      // Check if partner has any transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('partner_id', partnerId)
        .limit(1);

      if (transactionError) throw transactionError;

      if (transactions && transactions.length > 0) {
        toast({
          title: "Cannot delete partner",
          description: "This partner has transaction history. Deletion is not allowed to maintain data integrity.",
          variant: "destructive",
        });
        return;
      }

      // Delete partner
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', partnerId);

      if (deleteError) throw deleteError;

      await refetch();

      toast({
        title: "Partner deleted successfully",
        description: `${partnerName} has been removed from the system.`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error deleting partner",
        description: error.message || "Failed to delete partner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Partner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete partner <strong>{partnerName}</strong>? 
            This action cannot be undone. The system will check for any linked records before deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Partner"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePartnerModal;
