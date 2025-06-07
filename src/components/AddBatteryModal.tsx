
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Battery as BatteryIcon } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { Battery } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

type ModelName = 'MAXCHARGE' | 'FLUXON' | 'EXTRAGRID';
type BatteryStatus = 'available' | 'assigned' | 'maintenance' | 'faulty' | 'returned';

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
  warranty_start_date: string;
  status: BatteryStatus;
  location: string;
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
    warranty_start_date: '',
    status: 'available',
    location: '',
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
      warranty_start_date: '',
      status: 'available',
      location: '',
    });
    setError('');
  };

  const calculateWarrantyExpiry = (startDate: string, period: string) => {
    if (!startDate || !period) return null;
    const start = new Date(startDate);
    const months = parseInt(period);
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry.toISOString().split('T')[0];
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

    try {
      const warrantyExpiry = calculateWarrantyExpiry(formData.warranty_start_date, formData.warranty_period);
      
      const batteryData: Omit<Battery, 'id' | 'created_at' | 'updated_at'> = {
        serial_number: formData.serial_number.trim(),
        model: formData.model_number.trim(),
        model_name: formData.model_name,
        manufacturing_date: formData.manufacturing_date,
        voltage: parseFloat(formData.voltage),
        capacity: formData.capacity.trim(),
        imei_number: formData.imei_number.trim() || undefined,
        sim_number: formData.sim_number.trim() || undefined,
        status: formData.status,
        partner_id: null,
        customer_id: null,
        warranty_period: formData.warranty_period ? parseInt(formData.warranty_period) : undefined,
        warranty_expiry: warrantyExpiry,
        purchase_date: formData.warranty_start_date || null,
        location: formData.location.trim() || null,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BatteryIcon className="w-5 h-5" />
            <span>Add New Battery</span>
          </DialogTitle>
          <DialogDescription>
            Create a new battery with complete specifications and warranty information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
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
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
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
            </div>
          </div>

          {/* Status and Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Battery Status</Label>
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="faulty">Faulty</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Warehouse A, Shelf 1"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Warranty Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warranty_start_date">Warranty Start Date</Label>
                <Input
                  id="warranty_start_date"
                  type="date"
                  value={formData.warranty_start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, warranty_start_date: e.target.value }))}
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

              {formData.warranty_start_date && formData.warranty_period && (
                <div className="md:col-span-2">
                  <Label>Warranty End Date</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {calculateWarrantyExpiry(formData.warranty_start_date, formData.warranty_period) 
                      ? new Date(calculateWarrantyExpiry(formData.warranty_start_date, formData.warranty_period)!).toLocaleDateString()
                      : 'Invalid date/period'
                    }
                  </p>
                </div>
              )}
            </div>
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
