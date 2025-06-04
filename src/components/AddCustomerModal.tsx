import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AddCustomerModalProps {
  // You can add props here if needed
}

const AddCustomerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentType, setPaymentType] = useState<'emi' | 'monthly_rent' | 'one_time_purchase'>('emi');
  const [partnerId, setPartnerId] = useState<string | 'none'>('none');
  const [batteryId, setBatteryId] = useState<string | 'none'>('none');
  const [joinDate, setJoinDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addCustomer } = useCustomers();
  const { userRole, user } = useAuth();
  const [partners, setPartners] = useState<{ id: string; name: string; }[]>([]);
  const [batteries, setBatteries] = useState<{ id: string; serial_number: string; }[]>([]);
  const [paymentPlan, setPaymentPlan] = useState({
    totalAmount: '',
    downPayment: '',
    emiCount: '',
    emiAmount: '',
    securityDeposit: '',
    monthlyRent: '',
    purchaseAmount: ''
  });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'partner');

        if (error) {
          console.error('Error fetching partners:', error);
          toast({
            title: "Error fetching partners",
            description: error.message,
            variant: "destructive",
          });
        }

        setPartners(data || []);
      } catch (error: any) {
        console.error('Error fetching partners:', error);
        toast({
          title: "Error fetching partners",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    const fetchBatteries = async () => {
      try {
        let query = supabase
          .from('batteries')
          .select('id, serial_number')
          .eq('status', 'available');

        if (userRole === 'partner') {
          query = query.eq('partner_id', user?.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching batteries:', error);
           toast({
            title: "Error fetching batteries",
            description: error.message,
            variant: "destructive",
          });
        }

        setBatteries(data || []);
      } catch (error: any) {
        console.error('Error fetching batteries:', error);
        toast({
          title: "Error fetching batteries",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchPartners();
    fetchBatteries();
  }, [userRole, user, toast]);

  const handlePaymentPlanChange = (field: string, value: string) => {
    setPaymentPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = {
        name,
        phone,
        email: email || undefined,
        address: address || undefined,
        payment_type: paymentType,
        partner_id: partnerId === 'none' ? null : partnerId,
        battery_id: batteryId === 'none' ? null : batteryId,
        join_date: joinDate,
        status: 'active',
        // Add billing plan data
        ...(paymentType === 'emi' && {
          total_amount: paymentPlan.totalAmount ? parseFloat(paymentPlan.totalAmount) : undefined,
          down_payment: paymentPlan.downPayment ? parseFloat(paymentPlan.downPayment) : undefined,
          emi_count: paymentPlan.emiCount ? parseInt(paymentPlan.emiCount) : undefined,
          emi_amount: paymentPlan.emiAmount ? parseFloat(paymentPlan.emiAmount) : undefined,
          emi_start_date: joinDate
        }),
        ...(paymentType === 'monthly_rent' && {
          monthly_rent: paymentPlan.monthlyRent ? parseFloat(paymentPlan.monthlyRent) : undefined,
          security_deposit: paymentPlan.securityDeposit ? parseFloat(paymentPlan.securityDeposit) : undefined
        }),
        ...(paymentType === 'one_time_purchase' && {
          purchase_amount: paymentPlan.purchaseAmount ? parseFloat(paymentPlan.purchaseAmount) : undefined
        })
      };

      const result = await addCustomer(customerData);

      if (result?.success) {
        toast({
          title: "Customer added successfully",
          description: `Customer ${name} has been added.`,
        });
        setIsOpen(false);
        resetForm();
      } else {
        toast({
          title: "Error adding customer",
          description: result?.error?.message || 'Failed to add customer.',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error adding customer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPaymentType('emi');
    setPartnerId('none');
    setBatteryId('none');
    setJoinDate('');
    setPaymentPlan({
      totalAmount: '',
      downPayment: '',
      emiCount: '',
      emiAmount: '',
      securityDeposit: '',
      monthlyRent: '',
      purchaseAmount: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter customer address"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emi">EMI</SelectItem>
                <SelectItem value="monthly_rent">Monthly Rent</SelectItem>
                <SelectItem value="one_time_purchase">One-time Purchase</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {userRole === 'admin' && (
            <div>
              <Label htmlFor="partner">Partner</Label>
              <Select value={partnerId} onValueChange={setPartnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="battery">Battery</Label>
            <Select value={batteryId} onValueChange={setBatteryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select battery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {batteries.map((battery) => (
                  <SelectItem key={battery.id} value={battery.id}>{battery.serial_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="joinDate">Join Date</Label>
            <Input
              id="joinDate"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>

          {/* Payment Plan Details */}
          {paymentType === 'emi' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-blue-50">
              <h3 className="col-span-2 font-semibold text-blue-800">EMI Plan Details</h3>
              <div>
                <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={paymentPlan.totalAmount}
                  onChange={(e) => handlePaymentPlanChange('totalAmount', e.target.value)}
                  placeholder="Enter total amount"
                />
              </div>
              <div>
                <Label htmlFor="downPayment">Down Payment (₹)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  step="0.01"
                  value={paymentPlan.downPayment}
                  onChange={(e) => handlePaymentPlanChange('downPayment', e.target.value)}
                  placeholder="Enter down payment"
                />
              </div>
              <div>
                <Label htmlFor="emiCount">EMI Count (months)</Label>
                <Input
                  id="emiCount"
                  type="number"
                  min="1"
                  value={paymentPlan.emiCount}
                  onChange={(e) => handlePaymentPlanChange('emiCount', e.target.value)}
                  placeholder="Enter number of EMIs"
                />
              </div>
              <div>
                <Label htmlFor="emiAmount">EMI Amount (₹)</Label>
                <Input
                  id="emiAmount"
                  type="number"
                  step="0.01"
                  value={paymentPlan.emiAmount}
                  onChange={(e) => handlePaymentPlanChange('emiAmount', e.target.value)}
                  placeholder="Enter EMI amount"
                />
              </div>
            </div>
          )}

          {paymentType === 'monthly_rent' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-green-50">
              <h3 className="col-span-2 font-semibold text-green-800">Monthly Rent Plan Details</h3>
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  step="0.01"
                  value={paymentPlan.monthlyRent}
                  onChange={(e) => handlePaymentPlanChange('monthlyRent', e.target.value)}
                  placeholder="Enter monthly rent"
                />
              </div>
              <div>
                <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  step="0.01"
                  value={paymentPlan.securityDeposit}
                  onChange={(e) => handlePaymentPlanChange('securityDeposit', e.target.value)}
                  placeholder="Enter security deposit"
                />
              </div>
            </div>
          )}

          {paymentType === 'one_time_purchase' && (
            <div className="p-4 border rounded-lg bg-purple-50">
              <h3 className="font-semibold text-purple-800 mb-2">One-time Purchase Details</h3>
              <div>
                <Label htmlFor="purchaseAmount">Purchase Amount (₹)</Label>
                <Input
                  id="purchaseAmount"
                  type="number"
                  step="0.01"
                  value={paymentPlan.purchaseAmount}
                  onChange={(e) => handlePaymentPlanChange('purchaseAmount', e.target.value)}
                  placeholder="Enter purchase amount"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Customer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => {setIsOpen(false); resetForm();}}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
