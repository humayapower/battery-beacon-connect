
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from 'lucide-react';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

type CustomerStatus = 'Active' | 'Pending' | 'Inactive';

interface CustomerFormData {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  battery_id: string;
  status: CustomerStatus;
  monthly_fee: string;
}

const AddCustomerModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    battery_id: '',
    status: 'Pending',
    monthly_fee: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { addCustomer } = useCustomers();
  const { batteries } = useBatteries();
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
      setFormData(prev => ({ ...prev, customer_id: generateCustomerId() }));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
        customer_id: formData.customer_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address || null,
        payment_type: 'monthly_rent',
        partner_id: userRole === 'admin' ? null : user?.id || null,
        battery_id: formData.battery_id === 'none' ? null : formData.battery_id || null,
        monthly_amount: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        join_date: new Date().toISOString().split('T')[0],
        status: formData.status.toLowerCase() as 'active' | 'inactive' | 'suspended',
      };

      const result = await addCustomer(customerData);
      
      if (result.success) {
        setOpen(false);
        setFormData({
          customer_id: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          battery_id: '',
          status: 'Pending',
          monthly_fee: '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the customer information to add them to your client base.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +1-555-0123"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
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
