
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Battery } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AddBatteryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    model: '',
    modelName: '',
    capacity: '',
    voltage: '',
    manufacturingDate: '',
    purchaseDate: '',
    location: '',
    partnerId: 'none',
    imeiNumber: '',
    simNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<{ id: string; name: string; }[]>([]);
  const { toast } = useToast();
  const { addBattery } = useBatteries();
  const { userRole, user } = useAuth();

  useEffect(() => {
    const fetchPartners = async () => {
      if (userRole === 'admin') {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name')
            .eq('role', 'partner');

          if (error) throw error;
          setPartners(data || []);
        } catch (error: any) {
          console.error('Error fetching partners:', error);
          toast({
            title: "Error fetching partners",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    };

    fetchPartners();
  }, [userRole, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const batteryData = {
      serial_number: formData.serialNumber,
      model: formData.model,
      model_name: formData.modelName || undefined,
      capacity: formData.capacity,
      voltage: formData.voltage ? parseFloat(formData.voltage) : undefined,
      manufacturing_date: formData.manufacturingDate || undefined,
      purchase_date: formData.purchaseDate || undefined,
      location: formData.location || undefined,
      partner_id: userRole === 'partner' ? user?.id : (formData.partnerId === 'none' ? null : formData.partnerId),
      imei_number: formData.imeiNumber || undefined,
      sim_number: formData.simNumber || undefined,
      status: 'available' as const
    };

    const result = await addBattery(batteryData);
    
    if (result?.success) {
      setIsOpen(false);
      resetForm();
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      serialNumber: '',
      model: '',
      modelName: '',
      capacity: '',
      voltage: '',
      manufacturingDate: '',
      purchaseDate: '',
      location: '',
      partnerId: 'none',
      imeiNumber: '',
      simNumber: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Battery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 -m-6 mb-6 rounded-t-2xl">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Plus className="w-6 h-6 text-white" />
            </div>
            Add New Battery
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 p-6 glass-card border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Battery className="w-4 h-4 text-white" />
              </div>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber" className="font-medium">Serial Number *</Label>
                <Input
                  id="serialNumber"
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Enter serial number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="model" className="font-medium">Model *</Label>
                <Input
                  id="model"
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Enter model"
                  required
                />
              </div>

              <div>
                <Label htmlFor="modelName" className="font-medium">Model Name</Label>
                <Input
                  id="modelName"
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
                  placeholder="Enter model name"
                />
              </div>

              <div>
                <Label htmlFor="capacity" className="font-medium">Capacity *</Label>
                <Input
                  id="capacity"
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="e.g., 150Ah"
                  required
                />
              </div>

              <div>
                <Label htmlFor="voltage" className="font-medium">Voltage (V)</Label>
                <Input
                  id="voltage"
                  type="number"
                  step="0.1"
                  value={formData.voltage}
                  onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))}
                  placeholder="e.g., 12"
                />
              </div>

              <div>
                <Label htmlFor="location" className="font-medium">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4 p-6 glass-card border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manufacturingDate" className="font-medium">Manufacturing Date</Label>
                <Input
                  id="manufacturingDate"
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="purchaseDate" className="font-medium">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Connectivity */}
          <div className="space-y-4 p-6 glass-card border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Connectivity</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imeiNumber" className="font-medium">IMEI Number</Label>
                <Input
                  id="imeiNumber"
                  type="text"
                  value={formData.imeiNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, imeiNumber: e.target.value }))}
                  placeholder="Enter IMEI number"
                />
              </div>

              <div>
                <Label htmlFor="simNumber" className="font-medium">SIM Number</Label>
                <Input
                  id="simNumber"
                  type="text"
                  value={formData.simNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, simNumber: e.target.value }))}
                  placeholder="Enter SIM number"
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          {userRole === 'admin' && (
            <div className="space-y-4 p-6 glass-card border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Assignment</h3>
              
              <div>
                <Label htmlFor="partner" className="font-medium">Assign to Partner</Label>
                <Select value={formData.partnerId} onValueChange={(value) => setFormData(prev => ({ ...prev, partnerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Partner</SelectItem>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Battery...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Battery
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => {setIsOpen(false); resetForm();}} className="glass-card border-0 shadow-sm hover:shadow-md transition-all duration-200">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatteryModal;
