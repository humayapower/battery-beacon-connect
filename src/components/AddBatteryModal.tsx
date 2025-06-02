
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from 'lucide-react';
import { useBatteries, Battery } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

type BatteryStatus = 'Available' | 'Assigned' | 'Maintenance';

interface BatteryFormData {
  battery_id: string;
  model: string;
  capacity: string;
  status: BatteryStatus;
  location: string;
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
}

const AddBatteryModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BatteryFormData>({
    battery_id: '',
    model: '',
    capacity: '',
    status: 'Available',
    location: '',
    purchase_date: '',
    warranty_expiry: '',
    last_maintenance: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addBattery } = useBatteries();
  const { user, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const batteryData: Omit<Battery, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        partner_id: userRole === 'admin' ? null : user?.id || null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
        last_maintenance: formData.last_maintenance || null,
        location: formData.location || null,
      };

      const result = await addBattery(batteryData);
      
      if (result.success) {
        setOpen(false);
        setFormData({
          battery_id: '',
          model: '',
          capacity: '',
          status: 'Available',
          location: '',
          purchase_date: '',
          warranty_expiry: '',
          last_maintenance: '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add battery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Battery</DialogTitle>
          <DialogDescription>
            Enter the battery information to add it to the inventory.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="battery_id">Battery ID *</Label>
              <Input
                id="battery_id"
                type="text"
                placeholder="e.g., BAT-001"
                value={formData.battery_id}
                onChange={(e) => setFormData(prev => ({ ...prev, battery_id: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                type="text"
                placeholder="e.g., PowerMax 5000"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="text"
                placeholder="e.g., 5kWh"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: BatteryStatus) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Warehouse A, Shelf 3"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_maintenance">Last Maintenance</Label>
              <Input
                id="last_maintenance"
                type="date"
                value={formData.last_maintenance}
                onChange={(e) => setFormData(prev => ({ ...prev, last_maintenance: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
