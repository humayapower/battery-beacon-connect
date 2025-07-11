
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AssignBatteryToPartnerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [loading, setLoading] = useState(false);
  const [batteries, setBatteries] = useState<{ id: string; serial_number: string; model: string; }[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string; }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unassigned batteries
        const { data: batteriesData, error: batteriesError } = await supabase
          .from('batteries')
          .select('id, serial_number, model')
          .is('partner_id', null)
          .eq('status', 'available');

        if (batteriesError) throw batteriesError;

        // Fetch partners
        const { data: partnersData, error: partnersError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'partner');

        if (partnersError) throw partnersError;

        setBatteries(batteriesData || []);
        setPartners(partnersData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, toast]);

  const handleAssign = async () => {
    if (!selectedBattery || !selectedPartner) {
      toast({
        title: "Please select both battery and partner",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('batteries')
        .update({ 
          partner_id: selectedPartner,
          status: 'available'
        })
        .eq('id', selectedBattery);

      if (error) throw error;

      toast({
        title: "Battery assigned successfully",
        description: "Battery has been assigned to the partner.",
      });

      setIsOpen(false);
      setSelectedBattery('');
      setSelectedPartner('');
    } catch (error: any) {
      console.error('Error assigning battery:', error);
      toast({
        title: "Error assigning battery",
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
        <Button variant="outline" className="glass-card border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Battery to Partner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="battery" className="font-medium">Select Battery</Label>
            <Select value={selectedBattery} onValueChange={setSelectedBattery}>
              <SelectTrigger>
                <SelectValue placeholder="Choose battery to assign" />
              </SelectTrigger>
              <SelectContent>
                {batteries.map((battery) => (
                  <SelectItem key={battery.id} value={battery.id}>
                    {battery.serial_number} - {battery.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="partner" className="font-medium">Select Partner</Label>
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Choose partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleAssign} 
              disabled={loading || !selectedBattery || !selectedPartner}
              className="flex-1"
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

export default AssignBatteryToPartnerModal;
