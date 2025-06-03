
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from 'lucide-react';
import { useCustomers, CustomerWithBattery } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from './FileUpload';

type CustomerStatus = 'active' | 'inactive' | 'suspended';
type IdType = 'aadhaar' | 'pan';

interface CustomerFormData {
  customer_id: string;
  name: string;
  phone: string;
  address: string;
  battery_id: string;
  status: string;
  monthly_fee: string;
  partner_id: string;
  customer_photo_url: string;
  id_type: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  pan_card_url: string;
}

const AddCustomerModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_id: '',
    name: '',
    phone: '',
    address: '',
    battery_id: '',
    status: 'active',
    monthly_fee: '',
    partner_id: '',
    customer_photo_url: '',
    id_type: '',
    aadhaar_front_url: '',
    aadhaar_back_url: '',
    pan_card_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addCustomer } = useCustomers();
  const { batteries } = useBatteries();
  const { partners } = usePartners();
  const { user, userRole } = useAuth();

  const availableBatteries = batteries.filter(battery => 
    battery.status === 'available' && 
    (userRole === 'admin' || battery.partner_id === user?.id)
  );

  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CUS-${timestamp}`;
  };

  useEffect(() => {
    if (open && !formData.customer_id) {
      setFormData(prev => ({ 
        ...prev, 
        customer_id: generateCustomerId(),
        partner_id: userRole === 'partner' ? user?.id || '' : ''
      }));
    }
  }, [open, userRole, user?.id]);

  const resetForm = () => {
    setFormData({
      customer_id: '',
      name: '',
      phone: '',
      address: '',
      battery_id: '',
      status: 'active',
      monthly_fee: '',
      partner_id: '',
      customer_photo_url: '',
      id_type: '',
      aadhaar_front_url: '',
      aadhaar_back_url: '',
      pan_card_url: '',
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.id_type) {
      setError('ID type is required');
      return false;
    }
    if (formData.id_type === 'aadhaar') {
      if (!formData.aadhaar_front_url || !formData.aadhaar_back_url) {
        setError('Both Aadhaar front and back photos are required');
        return false;
      }
    }
    if (formData.id_type === 'pan' && !formData.pan_card_url) {
      setError('PAN card photo is required');
      return false;
    }
    if (userRole === 'admin' && !formData.partner_id) {
      setError('Partner selection is required for admin');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const customerData: Omit<CustomerWithBattery, 'id' | 'created_at' | 'updated_at' | 'batteries'> = {
        customer_id: formData.customer_id,
        name: formData.name,
        phone: formData.phone,
        email: null,
        address: formData.address || null,
        payment_type: 'monthly_rent',
        monthly_amount: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        partner_id: formData.partner_id || null,
        battery_id: formData.battery_id === 'none' || !formData.battery_id ? null : formData.battery_id,
        join_date: new Date().toISOString().split('T')[0],
        last_payment_date: null,
        status: formData.status as CustomerStatus,
        customer_photo_url: formData.customer_photo_url || null,
        id_type: formData.id_type as IdType,
        aadhaar_front_url: formData.aadhaar_front_url || null,
        aadhaar_back_url: formData.aadhaar_back_url || null,
        pan_card_url: formData.pan_card_url || null,
      };

      const result = await addCustomer(customerData);
      
      if (result.success) {
        setOpen(false);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the customer information including identity proof documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer ID</Label>
                <Input
                  id="customer_id"
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +91-9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">Monthly Fee ($)</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 450.00"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                required
              />
            </div>

            {/* Customer Photo */}
            <FileUpload
              label="Customer Photo"
              value={formData.customer_photo_url}
              onChange={(url) => setFormData(prev => ({ ...prev, customer_photo_url: url || '' }))}
            />
          </div>

          {/* Identity Proof Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Identity Proof *</h3>
            
            <div className="space-y-2">
              <Label htmlFor="id_type">ID Type *</Label>
              <Select
                value={formData.id_type}
                onValueChange={(value: IdType) => setFormData(prev => ({ 
                  ...prev, 
                  id_type: value,
                  aadhaar_front_url: '',
                  aadhaar_back_url: '',
                  pan_card_url: ''
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.id_type === 'aadhaar' && (
              <div className="grid grid-cols-2 gap-4">
                <FileUpload
                  label="Aadhaar Front Photo"
                  required
                  value={formData.aadhaar_front_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, aadhaar_front_url: url || '' }))}
                />
                <FileUpload
                  label="Aadhaar Back Photo"
                  required
                  value={formData.aadhaar_back_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, aadhaar_back_url: url || '' }))}
                />
              </div>
            )}

            {formData.id_type === 'pan' && (
              <FileUpload
                label="PAN Card Photo"
                required
                value={formData.pan_card_url}
                onChange={(url) => setFormData(prev => ({ ...prev, pan_card_url: url || '' }))}
              />
            )}
          </div>

          {/* Admin-specific Partner Selection */}
          {userRole === 'admin' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Partner Assignment</h3>
              <div className="space-y-2">
                <Label htmlFor="partner_id">Associated Partner *</Label>
                <Select
                  value={formData.partner_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, partner_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name} - {partner.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Options</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="battery_id">Assign Battery</Label>
                <Select
                  value={formData.battery_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, battery_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select battery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No battery assigned</SelectItem>
                    {availableBatteries.map((battery) => (
                      <SelectItem key={battery.id} value={battery.id}>
                        {battery.serial_number} - {battery.model} ({battery.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CustomerStatus) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              {loading ? 'Adding...' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
