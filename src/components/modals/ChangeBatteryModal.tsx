
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChangeBatteryModalProps {
  customerId: string | null;
  currentBatteryId: string | null;
  partnerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangeBatteryModal = ({ 
  customerId, 
  currentBatteryId, 
  partnerId, 
  isOpen, 
  onClose, 
  onSuccess 
}: ChangeBatteryModalProps) => {
  const [selectedBatteryId, setSelectedBatteryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableBatteries, setAvailableBatteries] = useState<any[]>([]);
  
  const { batteries, refetch: refetchBatteries } = useBatteries();
  const { refetch: refetchCustomers } = useCustomers();
  const { toast } = useToast();

  // Fetch available batteries for the partner
  useEffect(() => {
    if (partnerId && isOpen) {
      const partnerBatteries = batteries.filter(
        battery => 
          battery.partner_id === partnerId && 
          battery.status === 'available' && 
          !battery.customer_id
      );
      setAvailableBatteries(partnerBatteries);
    }
  }, [batteries, partnerId, isOpen]);

  const handleBatteryChange = async () => {
    if (!customerId || !selectedBatteryId || !currentBatteryId) {
      toast({
        title: "Error",
        description: "Missing required information for battery change.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Start a transaction-like operation
      // 1. Remove current battery from customer (make it available)
      const { error: currentBatteryError } = await supabase
        .from('batteries')
        .update({ 
          customer_id: null, 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentBatteryId);

      if (currentBatteryError) throw currentBatteryError;

      // 2. Assign new battery to customer
      const { error: newBatteryError } = await supabase
        .from('batteries')
        .update({ 
          customer_id: customerId, 
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBatteryId);

      if (newBatteryError) throw newBatteryError;

      // 3. Update customer's battery_id
      const { error: customerError } = await supabase
        .from('customers')
        .update({ 
          battery_id: selectedBatteryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (customerError) throw customerError;

      // Refresh data
      await Promise.all([refetchBatteries(), refetchCustomers()]);

      toast({
        title: "Battery Changed Successfully",
        description: "The customer's battery has been updated.",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error changing battery:', error);
      toast({
        title: "Error changing battery",
        description: error.message || "Failed to change battery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentBattery = batteries.find(b => b.id === currentBatteryId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Change Customer Battery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Battery Info */}
          {currentBattery && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Current Battery</h3>
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{currentBattery.serial_number}</p>
                      <p className="text-sm text-gray-600">{currentBattery.model} - {currentBattery.capacity}</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-100">
                      <Battery className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Available Batteries */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Available Batteries ({availableBatteries.length})
            </h3>
            
            {availableBatteries.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <Battery className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No available batteries found for this partner.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBatteries.map((battery) => (
                  <Card 
                    key={battery.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBatteryId === battery.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedBatteryId(battery.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{battery.serial_number}</p>
                          <p className="text-sm text-gray-600">{battery.model}</p>
                          <p className="text-sm text-gray-500">{battery.capacity}</p>
                          {battery.location && (
                            <p className="text-xs text-gray-400">📍 {battery.location}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Available
                          </Badge>
                          {selectedBatteryId === battery.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBatteryChange}
              disabled={!selectedBatteryId || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Changing Battery...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Change Battery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeBatteryModal;
