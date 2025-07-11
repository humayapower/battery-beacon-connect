
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AddBatteryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    model_name: '',
    capacity: '',
    voltage: '',
    manufacturing_date: '',
    purchase_date: '',
    warranty_expiry: '',
    imei_number: '',
    sim_number: '',
    location: '',
    partner_id: userRole === 'partner' ? user?.id : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const batteryData = {
        ...formData,
        voltage: formData.voltage ? parseFloat(formData.voltage) : null,
        manufacturing_date: formData.manufacturing_date || null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        partner_id: formData.partner_id || null,
        status: 'available'
      };

      const { error } = await supabase
        .from('batteries')
        .insert([batteryData]);

      if (error) throw error;

      toast({
        title: "Battery added successfully",
        description: "The battery has been added to the inventory.",
      });

      setIsOpen(false);
      setFormData({
        serial_number: '',
        model: '',
        model_name: '',
        capacity: '',
        voltage: '',
        manufacturing_date: '',
        purchase_date: '',
        warranty_expiry: '',
        imei_number: '',
        sim_number: '',
        location: '',
        partner_id: userRole === 'partner' ? user?.id : ''
      });
      
      // Refresh the page to show the new battery
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error adding battery",
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
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Battery</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="48V_20Ah">48V 20Ah</SelectItem>
                  <SelectItem value="48V_25Ah">48V 25Ah</SelectItem>
                  <SelectItem value="60V_20Ah">60V 20Ah</SelectItem>
                  <SelectItem value="60V_25Ah">60V 25Ah</SelectItem>
                  <SelectItem value="72V_20Ah">72V 20Ah</SelectItem>
                  <SelectItem value="72V_25Ah">72V 25Ah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model_name">Model Name</Label>
              <Input
                id="model_name"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                placeholder="e.g., LiFePO4"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 20Ah"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voltage">Voltage (V)</Label>
              <Input
                id="voltage"
                type="number"
                step="0.1"
                value={formData.voltage}
                onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                placeholder="e.g., 48.0"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Storage location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturing_date">Manufacturing Date</Label>
              <Input
                id="manufacturing_date"
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
            <Input
              id="warranty_expiry"
              type="date"
              value={formData.warranty_expiry}
              onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imei_number">IMEI Number</Label>
              <Input
                id="imei_number"
                value={formData.imei_number}
                onChange={(e) => setFormData({ ...formData, imei_number: e.target.value })}
                placeholder="Device IMEI"
              />
            </div>
            <div>
              <Label htmlFor="sim_number">SIM Number</Label>
              <Input
                id="sim_number"
                value={formData.sim_number}
                onChange={(e) => setFormData({ ...formData, sim_number: e.target.value })}
                placeholder="SIM card number"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Battery'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatteryModal;
