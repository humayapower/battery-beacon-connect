
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  paymentType: 'emi' | 'monthly_rent' | 'one_time_purchase';
  partnerId: string;
  batteryId: string;
  joinDate: string;
}

const AddCustomerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    paymentType: 'emi',
    partnerId: 'none',
    batteryId: 'none',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const [paymentPlan, setPaymentPlan] = useState({
    totalAmount: '',
    downPayment: '',
    emiCount: '',
    emiAmount: '',
    securityDeposit: '',
    monthlyRent: '',
    purchaseAmount: ''
  });
  const [files, setFiles] = useState({
    customerPhoto: null as File | null,
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addCustomer } = useCustomers();
  const { userRole, user } = useAuth();
  const [partners, setPartners] = useState<{ id: string; name: string; }[]>([]);
  const [batteries, setBatteries] = useState<{ id: string; serial_number: string; }[]>([]);

  // Auto-calculate EMI amount when total, down payment, or EMI count changes
  useEffect(() => {
    if (formData.paymentType === 'emi' && paymentPlan.totalAmount && paymentPlan.emiCount) {
      const total = parseFloat(paymentPlan.totalAmount);
      const downPayment = parseFloat(paymentPlan.downPayment) || 0;
      const emiCount = parseInt(paymentPlan.emiCount);
      
      if (total > downPayment && emiCount > 0) {
        const emiAmount = ((total - downPayment) / emiCount).toFixed(2);
        setPaymentPlan(prev => ({ ...prev, emiAmount }));
      }
    }
  }, [paymentPlan.totalAmount, paymentPlan.downPayment, paymentPlan.emiCount, formData.paymentType]);

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

    fetchPartners();
  }, [userRole, user, toast]);

  // Fetch batteries only when a partner is selected
  useEffect(() => {
    const fetchBatteries = async () => {
      try {
        // Only fetch batteries if a partner is selected (not 'none')
        if (formData.partnerId === 'none') {
          setBatteries([]);
          return;
        }

        let query = supabase
          .from('batteries')
          .select('id, serial_number')
          .eq('status', 'available');

        // Filter by selected partner
        if (formData.partnerId !== 'none') {
          query = query.eq('partner_id', formData.partnerId);
        } else if (userRole === 'partner') {
          // If current user is a partner, show their batteries
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

    fetchBatteries();
  }, [formData.partnerId, userRole, user, toast]);

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      // Upload files if present
      const uploadedUrls: any = {};
      
      if (files.customerPhoto) {
        const fileName = `${Date.now()}_customer_photo.${files.customerPhoto.name.split('.').pop()}`;
        uploadedUrls.customer_photo_url = await uploadFile(files.customerPhoto, 'customer-documents', `photos/${fileName}`);
      }

      if (files.aadhaarFront) {
        const fileName = `${Date.now()}_aadhaar_front.${files.aadhaarFront.name.split('.').pop()}`;
        uploadedUrls.aadhaar_front_url = await uploadFile(files.aadhaarFront, 'customer-documents', `aadhaar/${fileName}`);
      }

      if (files.aadhaarBack) {
        const fileName = `${Date.now()}_aadhaar_back.${files.aadhaarBack.name.split('.').pop()}`;
        uploadedUrls.aadhaar_back_url = await uploadFile(files.aadhaarBack, 'customer-documents', `aadhaar/${fileName}`);
      }

      setUploading(false);

      const customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        payment_type: formData.paymentType,
        partner_id: formData.partnerId === 'none' ? null : formData.partnerId,
        battery_id: formData.batteryId === 'none' ? null : formData.batteryId,
        join_date: formData.joinDate,
        status: 'active' as const,
        id_type: 'aadhaar',
        ...uploadedUrls,
        // Add billing plan data
        ...(formData.paymentType === 'emi' && {
          total_amount: paymentPlan.totalAmount ? parseFloat(paymentPlan.totalAmount) : undefined,
          down_payment: paymentPlan.downPayment ? parseFloat(paymentPlan.downPayment) : undefined,
          emi_count: paymentPlan.emiCount ? parseInt(paymentPlan.emiCount) : undefined,
          emi_amount: paymentPlan.emiAmount ? parseFloat(paymentPlan.emiAmount) : undefined,
          emi_start_date: formData.joinDate
        }),
        ...(formData.paymentType === 'monthly_rent' && {
          monthly_rent: paymentPlan.monthlyRent ? parseFloat(paymentPlan.monthlyRent) : undefined,
          security_deposit: paymentPlan.securityDeposit ? parseFloat(paymentPlan.securityDeposit) : undefined
        }),
        ...(formData.paymentType === 'one_time_purchase' && {
          purchase_amount: paymentPlan.purchaseAmount ? parseFloat(paymentPlan.purchaseAmount) : undefined
        })
      };

      const result = await addCustomer(customerData);

      if (result?.success) {
        toast({
          title: "Customer added successfully",
          description: `Customer ${formData.name} has been added with all documents.`,
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
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      paymentType: 'emi',
      partnerId: 'none',
      batteryId: 'none',
      joinDate: new Date().toISOString().split('T')[0],
    });
    setPaymentPlan({
      totalAmount: '',
      downPayment: '',
      emiCount: '',
      emiAmount: '',
      securityDeposit: '',
      monthlyRent: '',
      purchaseAmount: ''
    });
    setFiles({
      customerPhoto: null,
      aadhaarFront: null,
      aadhaarBack: null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="font-medium">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer's full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="joinDate" className="font-medium">Join Date *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="font-medium">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter customer's complete address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="customerPhoto" className="font-medium">Customer Photo</Label>
              <div className="mt-2">
                <Label
                  htmlFor="customerPhoto"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.customerPhoto ? files.customerPhoto.name : 'Click to upload customer photo'}
                    </p>
                  </div>
                  <Input
                    id="customerPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('customerPhoto', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Aadhaar Documents */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Aadhaar Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aadhaarFront" className="font-medium">Aadhaar Front</Label>
                <div className="mt-2">
                  <Label
                    htmlFor="aadhaarFront"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {files.aadhaarFront ? files.aadhaarFront.name : 'Upload Aadhaar Front'}
                      </p>
                    </div>
                    <Input
                      id="aadhaarFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarFront', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="aadhaarBack" className="font-medium">Aadhaar Back</Label>
                <div className="mt-2">
                  <Label
                    htmlFor="aadhaarBack"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {files.aadhaarBack ? files.aadhaarBack.name : 'Upload Aadhaar Back'}
                      </p>
                    </div>
                    <Input
                      id="aadhaarBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarBack', e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Assignment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRole === 'admin' && (
                <div>
                  <Label htmlFor="partner" className="font-medium">Assigned Partner</Label>
                  <Select value={formData.partnerId} onValueChange={(value) => setFormData(prev => ({ ...prev, partnerId: value, batteryId: 'none' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Partner</SelectItem>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="battery" className="font-medium">Assigned Battery</Label>
                <Select 
                  value={formData.batteryId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, batteryId: value }))}
                  disabled={formData.partnerId === 'none'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.partnerId === 'none' ? "Select a partner first" : "Select battery"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Battery</SelectItem>
                    {batteries.map((battery) => (
                      <SelectItem key={battery.id} value={battery.id}>{battery.serial_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.partnerId === 'none' && (
                  <p className="text-xs text-muted-foreground mt-1">Please select a partner to see available batteries</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            
            <div>
              <Label htmlFor="paymentType" className="font-medium">Payment Type *</Label>
              <Select value={formData.paymentType} onValueChange={(value: 'emi' | 'monthly_rent' | 'one_time_purchase') => setFormData(prev => ({ ...prev, paymentType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="monthly_rent">Subscription/Rent</SelectItem>
                  <SelectItem value="one_time_purchase">Full Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Plan Details */}
            {formData.paymentType === 'emi' && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="col-span-2 font-semibold">EMI Plan Details</h4>
                <div>
                  <Label htmlFor="totalAmount" className="font-medium">Total Amount (₹) *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={paymentPlan.totalAmount}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="Enter total amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="downPayment" className="font-medium">Down Payment (₹)</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    step="0.01"
                    value={paymentPlan.downPayment}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, downPayment: e.target.value }))}
                    placeholder="Enter down payment"
                  />
                </div>
                <div>
                  <Label htmlFor="emiCount" className="font-medium">EMI Count (months) *</Label>
                  <Input
                    id="emiCount"
                    type="number"
                    min="1"
                    value={paymentPlan.emiCount}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, emiCount: e.target.value }))}
                    placeholder="Number of EMIs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emiAmount" className="font-medium">EMI Amount (₹)</Label>
                  <Input
                    id="emiAmount"
                    type="number"
                    step="0.01"
                    value={paymentPlan.emiAmount}
                    readOnly
                    placeholder="Auto-calculated"
                    className="bg-muted"
                  />
                </div>
              </div>
            )}

            {formData.paymentType === 'monthly_rent' && (
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                <h4 className="col-span-2 font-semibold">Subscription Plan Details</h4>
                <div>
                  <Label htmlFor="monthlyRent" className="font-medium">Monthly Rent (₹) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    step="0.01"
                    value={paymentPlan.monthlyRent}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, monthlyRent: e.target.value }))}
                    placeholder="Monthly rent amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="securityDeposit" className="font-medium">Security Deposit (₹)</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    step="0.01"
                    value={paymentPlan.securityDeposit}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    placeholder="Security deposit"
                  />
                </div>
              </div>
            )}

            {formData.paymentType === 'one_time_purchase' && (
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-2">Purchase Details</h4>
                <div>
                  <Label htmlFor="purchaseAmount" className="font-medium">Purchase Amount (₹) *</Label>
                  <Input
                    id="purchaseAmount"
                    type="number"
                    step="0.01"
                    value={paymentPlan.purchaseAmount}
                    onChange={(e) => setPaymentPlan(prev => ({ ...prev, purchaseAmount: e.target.value }))}
                    placeholder="Full purchase amount"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={loading || uploading} className="flex-1">
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Uploading...' : 'Adding...'}
                </>
              ) : (
                'Add Customer'
              )}
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
