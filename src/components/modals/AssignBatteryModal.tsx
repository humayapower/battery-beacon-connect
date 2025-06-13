
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Battery as BatteryIcon } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AssignBatteryModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [unassignedBatteries, setUnassignedBatteries] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { batteries, updateBattery, refetch } = useBatteries();
  const { partners } = usePartners();
  const { userRole } = useAuth();
  const { toast } = useToast();

  // Only show for admin users
  if (userRole !== 'admin') {
    return null;
  }

  useEffect(() => {
    // Filter batteries that are not assigned to any partner
    const unassigned = batteries.filter(battery => !battery.partner_id);
    setUnassignedBatteries(unassigned);
  }, [batteries]);

  const resetForm = () => {
    setSelectedBattery('');
    setSelectedPartner('');
    setError('');
  };

  const handleAssign = async () => {
    if (!selectedBattery || !selectedPartner) {
      setError('Please select both a battery and a partner');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateBattery(selectedBattery, {
        partner_id: selectedPartner,
        status: 'available' // Available to the partner but not assigned to customer
      });

      if (result.success) {
        toast({
          title: "Battery assigned successfully",
          description: "The battery has been assigned to the selected partner.",
        });
        
        setOpen(false);
        resetForm();
        refetch(); // Refresh the battery list
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign battery');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Battery to Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BatteryIcon className="w-5 h-5" />
            <span>Assign Battery to Partner</span>
          </DialogTitle>
          <DialogDescription>
            Select an unassigned battery and a partner to assign it to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="battery-select">Select Battery</Label>
            <Select value={selectedBattery} onValueChange={setSelectedBattery}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an unassigned battery" />
              </SelectTrigger>
              <SelectContent>
                {unassignedBatteries.length > 0 ? (
                  unassignedBatteries.map((battery) => (
                    <SelectItem key={battery.id} value={battery.id}>
                      {battery.serial_number} - {battery.model} ({battery.capacity})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-batteries" disabled>
                    No unassigned batteries available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner-select">Select Partner</Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.length > 0 ? (
                  partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name} ({partner.username})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-partners" disabled>
                    No partners available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={loading || !selectedBattery || !selectedPartner || unassignedBatteries.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Battery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignBatteryModal;
