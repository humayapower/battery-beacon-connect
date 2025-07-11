
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChangeBatteryModalProps {
  customerId: string;
  currentBatteryId?: string;
  partnerId?: string;
  onBatteryChanged?: () => void;
}

const ChangeBatteryModal = ({ customerId, currentBatteryId, partnerId, onBatteryChanged }: ChangeBatteryModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState('');
  const [loading, setLoading] = useState(false);
  const [batteries, setBatteries] = useState<{ id: string; serial_number: string; model: string; }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvailableBatteries = async () => {
      if (!partnerId) return;

      try {
        const { data, error } = await supabase
          .from('batteries')
          .select('id, serial_number, model')
          .eq('partner_id', partnerId)
          .eq('status', 'available');

        if (error) throw error;

        setBatteries(data || []);
      } catch (error: any) {
        console.error('Error fetching batteries:', error);
        toast({
          title: "Error fetching batteries",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchAvailableBatteries();
    }
  }, [isOpen, partnerId, toast]);

  const handleChangeBattery = async () => {
    if (!selectedBattery) {
      toast({
        title: "Please select a battery",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update customer's battery
      const { error: customerError } = await supabase
        .from('customers')
        .update({ battery_id: selectedBattery })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Set new battery status to assigned
      const { error: newBatteryError } = await supabase
        .from('batteries')
        .update({ 
          customer_id: customerId,
          status: 'assigned'
        })
        .eq('id', selectedBattery);

      if (newBatteryError) throw newBatteryError;

      // Return old battery to available pool if it exists
      if (currentBatteryId) {
        const { error: oldBatteryError } = await supabase
          .from('batteries')
          .update({ 
            customer_id: null,
            status: 'available'
          })
          .eq('id', currentBatteryId);

        if (oldBatteryError) throw oldBatteryError;
      }

      toast({
        title: "Battery changed successfully",
        description: "Customer's battery has been updated.",
      });

      setIsOpen(false);
      setSelectedBattery('');
      onBatteryChanged?.();
    } catch (error: any) {
      console.error('Error changing battery:', error);
      toast({
        title: "Error changing battery",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Change Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Change Battery
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="battery" className="font-medium">Select New Battery</Label>
            <Select value={selectedBattery} onValueChange={setSelectedBattery}>
              <SelectTrigger>
                <SelectValue placeholder="Choose available battery" />
              </SelectTrigger>
              <SelectContent>
                {batteries.length === 0 ? (
                  <SelectItem value="none" disabled>No available batteries</SelectItem>
                ) : (
                  batteries.map((battery) => (
                    <SelectItem key={battery.id} value={battery.id}>
                      {battery.serial_number} - {battery.model}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {batteries.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No available batteries from the same partner
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleChangeBattery} 
              disabled={loading || !selectedBattery || batteries.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Change Battery
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeBatteryModal;
