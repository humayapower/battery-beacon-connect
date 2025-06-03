
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Battery as BatteryIcon } from 'lucide-react';
import { useBatteries, Battery } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

type ModelName = 'MAXCHARGE' | 'FLUXON' | 'EXTRAGRID';

interface BatteryFormData {
  serial_number: string;
  model_name: ModelName | '';
  model_number: string;
  manufacturing_date: string;
  voltage: string;
  capacity: string;
  imei_number: string;
  sim_number: string;
  warranty_period: string;
}

const AddBatteryModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BatteryFormData>({
    serial_number: '',
    model_name: '',
    model_number: '',
    manufacturing_date: '',
    voltage: '',
    capacity: '',
    imei_number: '',
    sim_number: '',
    warranty_period: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addBattery } = useBatteries();
  const { userRole } = useAuth();

  // Only show for admin users
  if (userRole !== 'admin') {
    return null;
  }

  const resetForm = () => {
    setFormData({
      serial_number: '',
      model_name: '',
      model_number: '',
      manufacturing_date: '',
      voltage: '',
      capacity: '',
      imei_number: '',
      sim_number: '',
      warranty_period: '',
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.serial_number.trim()) {
      setError('Serial number is required');
      setLoading(false);
      return;
    }

    if (!formData.model_name) {
      setError('Model name is required');
      setLoading(false);
      return;
    }

    if (!formData.model_number.trim()) {
      setError('Model number is required');
      setLoading(false);
      return;
    }

    if (!formData.manufacturing_date) {
      setError('Manufacturing date is required');
      setLoading(false);
      return;
    }

    if (!formData.voltage.trim()) {
      setError('Voltage is required');
      setLoading(false);
      return;
    }

    if (!formData.capacity.trim()) {
      setError('Capacity is required');
      setLoading(false);
      return;
    }

    if (!formData.imei_number.trim()) {
      setError('IMEI number is required');
      setLoading(false);
      return;
    }

    if (!formData.sim_number.trim()) {
      setError('SIM number is required');
      setLoading(false);
      return;
    }

    if (!formData.warranty_period.trim()) {
      setError('Warranty period is required');
      setLoading(false);
      return;
    }

    try {
      const batteryData: Omit<Battery, 'id' | 'created_at' | 'updated_at'> = {
        serial_number: formData.serial_number.trim(),
        model: formData.model_number.trim(), // Use model_number for the model field
        model_name: formData.model_name,
        manufacturing_date: formData.manufacturing_date,
        voltage: parseFloat(formData.voltage),
        capacity: formData.capacity.trim(),
        imei_number: formData.imei_number.trim(),
        sim_number: formData.sim_number.trim(),
        status: 'available',
        partner_id: null, // Unassigned to any partner initially
        customer_id: null, // Unassigned to any customer initially
        warranty_period: parseInt(formData.warranty_period),
        warranty_expiry: null,
        location: null,
        purchase_date: null,
        last_maintenance: null,
      };

      const result = await addBattery(batteryData);
      
      if (result.success) {
        setOpen(false);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add battery');
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
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BatteryIcon className="w-5 h-5" />
            <span>Add New Battery (Admin Only)</span>
          </DialogTitle>
          <DialogDescription>
            Create a new battery in the system. Battery will be unassigned and available for partner assignment.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                type="text"
                placeholder="e.g., SN-BAT-001"
                value={formData.serial_number}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model_name">Model Name *</Label>
              <Select
                value={formData.model_name}
                onValueChange={(value: ModelName) => 
                  setFormData(prev => ({ ...prev, model_name: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAXCHARGE">MAXCHARGE</SelectItem>
                  <SelectItem value="FLUXON">FLUXON</SelectItem>
                  <SelectItem value="EXTRAGRID">EXTRAGRID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model_number">Model Number *</Label>
              <Input
                id="model_number"
                type="text"
                placeholder="e.g., MX-2024-Pro"
                value={formData.model_number}
                onChange={(e) => setFormData(prev => ({ ...prev, model_number: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturing_date">Manufacturing Date *</Label>
              <Input
                id="manufacturing_date"
                type="date"
                value={formData.manufacturing_date}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voltage">Voltage (V) *</Label>
              <Input
                id="voltage"
                type="number"
                step="0.1"
                placeholder="e.g., 12"
                value={formData.voltage}
                onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Ah) *</Label>
              <Input
                id="capacity"
                type="text"
                placeholder="e.g., 100Ah"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei_number">IMEI Number *</Label>
              <Input
                id="imei_number"
                type="text"
                placeholder="e.g., 123456789012345"
                value={formData.imei_number}
                onChange={(e) => setFormData(prev => ({ ...prev, imei_number: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sim_number">SIM Number *</Label>
              <Input
                id="sim_number"
                type="text"
                placeholder="e.g., 89012345678901234567"
                value={formData.sim_number}
                onChange={(e) => setFormData(prev => ({ ...prev, sim_number: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warranty_period">Warranty Period (months) *</Label>
            <Input
              id="warranty_period"
              type="number"
              placeholder="e.g., 24"
              value={formData.warranty_period}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty_period: e.target.value }))}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Battery
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatteryModal;
