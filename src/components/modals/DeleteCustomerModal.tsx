
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
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';

interface DeleteCustomerModalProps {
  customerId: string | null;
  customerName: string;
  batteryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteCustomerModal = ({
  customerId,
  customerName,
  batteryId,
  isOpen,
  onClose,
  onSuccess
}: DeleteCustomerModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refetch: refetchCustomers } = useCustomers();
  const { refetch: refetchBatteries } = useBatteries();

  const handleDelete = async () => {
    if (!customerId) return;

    setLoading(true);
    try {
      // Check if customer has any pending transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (transactionError) throw transactionError;

      if (transactions && transactions.length > 0) {
        toast({
          title: "Cannot delete customer",
          description: "This customer has transaction history. Deletion is not allowed to maintain data integrity.",
          variant: "destructive",
        });
        return;
      }

      // Check if customer has any pending EMIs
      const { data: emis, error: emiError } = await supabase
        .from('emis')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (emiError) throw emiError;

      if (emis && emis.length > 0) {
        toast({
          title: "Cannot delete customer",
          description: "This customer has EMI records. Deletion is not allowed to maintain payment history.",
          variant: "destructive",
        });
        return;
      }

      // Check if customer has any rent records
      const { data: rents, error: rentError } = await supabase
        .from('monthly_rents')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (rentError) throw rentError;

      if (rents && rents.length > 0) {
        toast({
          title: "Cannot delete customer",
          description: "This customer has rental payment records. Deletion is not allowed to maintain payment history.",
          variant: "destructive",
        });
        return;
      }

      // If customer has a battery, make it available
      if (batteryId) {
        const { error: batteryError } = await supabase
          .from('batteries')
          .update({ 
            customer_id: null, 
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', batteryId);

        if (batteryError) throw batteryError;
      }

      // Delete customer
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (deleteError) throw deleteError;

      // Refresh data
      await Promise.all([refetchCustomers(), refetchBatteries()]);

      toast({
        title: "Customer deleted successfully",
        description: `${customerName} has been removed from the system.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error deleting customer",
        description: error.message || "Failed to delete customer. Please try again.",
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
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{customerName}</strong>? 
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
            {loading ? "Deleting..." : "Delete Customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCustomerModal;
