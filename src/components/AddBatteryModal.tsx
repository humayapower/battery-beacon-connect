
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

type ModelName = 'Maxcharge' | 'Fluxon' | 'Extragrid';

interface BatteryFormData {
  serial_number: string;
  model: string;
  model_name: ModelName | '';
  manufacturing_date: string;
  voltage: string;
  capacity: string;
  imei_number: string;
  sim_number: string;
  warranty_period: string;
  warranty_expiry: string;
}

const AddBatteryModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BatteryFormData>({
    serial_number: '',
    model: '',
    model_name: '',
    manufacturing_date: '',
    voltage: '',
    capacity: '',
    imei_number: '',
    sim_number: '',
    warranty_period: '',
    warranty_expiry: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addBattery } = useBatteries();
  const { user, userRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

    if (!formData.capacity.trim()) {
      setError('Capacity is required');
      setLoading(false);
      return;
    }

    try {
      const batteryData: Omit<Battery, 'id' | 'created_at' | 'updated_at'> = {
        serial_number: formData.serial_number,
        model: formData.model || formData.model_name,
        model_name: formData.model_name as ModelName,
        manufacturing_date: formData.manufacturing_date || null,
        voltage: formData.voltage ? parseFloat(formData.voltage) : null,
        capacity: formData.capacity,
        imei_number: formData.imei_number || null,
        sim_number: formData.sim_number || null,
        status: 'available',
        partner_id: userRole === 'admin' ? null : user?.id || null,
        warranty_period: formData.warranty_period ? parseInt(formData.warranty_period) : null,
        warranty_expiry: formData.warranty_expiry || null,
        customer_id: null,
        location: null,
        purchase_date: null,
        last_maintenance: null,
      };

      const result = await addBattery(batteryData);
      
      if (result.success) {
        setOpen(false);
        setFormData({
          serial_number: '',
          model: '',
          model_name: '',
          manufacturing_date: '',
          voltage: '',
          capacity: '',
          imei_number: '',
          sim_number: '',
          warranty_period: '',
          warranty_expiry: '',
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BatteryIcon className="w-5 h-5" />
            <span>Add New Battery</span>
          </DialogTitle>
          <DialogDescription>
            Enter battery information. Required fields are marked with *. Status will be automatically set to "Available".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Primary Information</h3>
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
                    setFormData(prev => ({ ...prev, model_name: value, model: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maxcharge">Maxcharge</SelectItem>
                    <SelectItem value="Fluxon">Fluxon</SelectItem>
                    <SelectItem value="Extragrid">Extragrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="voltage">Voltage (V)</Label>
                <Input
                  id="voltage"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 12.0"
                  value={formData.voltage}
                  onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturing_date">Manufacturing Date</Label>
                <Input
                  id="manufacturing_date"
                  type="date"
                  value={formData.manufacturing_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imei_number">IMEI Number</Label>
                <Input
                  id="imei_number"
                  type="text"
                  placeholder="e.g., 123456789012345"
                  value={formData.imei_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, imei_number: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Connectivity & Tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Connectivity & Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sim_number">SIM Number</Label>
                <Input
                  id="sim_number"
                  type="text"
                  placeholder="e.g., 89012345678901234567"
                  value={formData.sim_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, sim_number: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="warranty_period">Warranty Period (months)</Label>
                <Input
                  id="warranty_period"
                  type="number"
                  placeholder="e.g., 24"
                  value={formData.warranty_period}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_period: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Warranty Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry Date</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Battery
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
