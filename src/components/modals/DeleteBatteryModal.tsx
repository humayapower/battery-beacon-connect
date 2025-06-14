
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
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';

interface DeleteBatteryModalProps {
  batteryId: string | null;
  batterySerial: string;
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteBatteryModal = ({
  batteryId,
  batterySerial,
  customerId,
  isOpen,
  onClose,
  onSuccess
}: DeleteBatteryModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refetch: refetchBatteries } = useBatteries();
  const { refetch: refetchCustomers } = useCustomers();

  const handleDelete = async () => {
    if (!batteryId) return;

    setLoading(true);
    try {
      // Check if battery is assigned to a customer
      if (customerId) {
        toast({
          title: "Cannot delete battery",
          description: "This battery is currently assigned to a customer. Please unassign it first before deletion.",
          variant: "destructive",
        });
        return;
      }

      // Check if battery has any transaction history
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('id')
        .eq('battery_id', batteryId)
        .limit(1);

      if (transactionError) throw transactionError;

      if (transactions && transactions.length > 0) {
        toast({
          title: "Cannot delete battery",
          description: "This battery has transaction history. Deletion is not allowed to maintain data integrity.",
          variant: "destructive",
        });
        return;
      }

      // Delete battery
      const { error: deleteError } = await supabase
        .from('batteries')
        .delete()
        .eq('id', batteryId);

      if (deleteError) throw deleteError;

      // Refresh data
      await Promise.all([refetchBatteries(), refetchCustomers()]);

      toast({
        title: "Battery deleted successfully",
        description: `Battery ${batterySerial} has been removed from the system.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error deleting battery:', error);
      toast({
        title: "Error deleting battery",
        description: error.message || "Failed to delete battery. Please try again.",
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
          <AlertDialogTitle>Delete Battery</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete battery <strong>{batterySerial}</strong>? 
            This action cannot be undone. The system will check for any assignments before deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Battery"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBatteryModal;
