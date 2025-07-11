import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Upload, X, Battery, FileText, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Battery as BatteryType } from '@/types';
import FileUpload from '@/components/shared/FileUpload';
import { useAutoScheduling } from '@/hooks/useAutoScheduling';
import { PaymentCalculations } from '@/utils/paymentCalculations';

const AddCustomerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const { scheduleEMIPayments, scheduleRentalPayments } = useAutoScheduling();

  // Available batteries state
  const [availableBatteries, setAvailableBatteries] = useState<BatteryType[]>([]);
  const [loadingBatteries, setLoadingBatteries] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    phone: '',
    address: '',
    join_date: new Date().toISOString().split('T')[0], // Today's date
    
    // Assignment
    partner_id: userRole === 'partner' ? user?.id : '',
    battery_id: '',
    
    // Payment Information
    payment_type: '',
    
    // EMI specific
    total_amount: '',
    down_payment: '',
    emi_count: '',
    warranty_start_date: '',
    warranty_duration: '',
    
    // Rental specific
    monthly_rent: '',
    security_deposit: '',
    
    // Document uploads
    customer_photo_url: '',
    id_type: 'aadhaar',
    aadhaar_front_url: '',
    aadhaar_back_url: '',
    pan_card_url: ''
  });

  // Load available batteries when modal opens or partner changes
  useEffect(() => {
    if (isOpen && formData.partner_id) {
      loadAvailableBatteries();
    }
  }, [isOpen, formData.partner_id]);

  const loadAvailableBatteries = async () => {
    setLoadingBatteries(true);
    try {
      const { data, error } = await supabase
        .from('batteries')
        .select('*')
        .eq('partner_id', formData.partner_id)
        .eq('status', 'available')
        .is('customer_id', null);

      if (error) throw error;
      setAvailableBatteries(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading batteries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingBatteries(false);
    }
  };

  const calculateEMIAmount = () => {
    const total = parseFloat(formData.total_amount);
    const down = parseFloat(formData.down_payment);
    const count = parseInt(formData.emi_count);
    
    if (total && down && count && total > down) {
      return (total - down) / count;
    }
    return 0;
  };

  const calculateNextDueDate = () => {
    if (formData.join_date) {
      return PaymentCalculations.calculateNextDueDate(formData.join_date);
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.payment_type) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.battery_id) {
        throw new Error('Please select a battery');
      }

      // Prepare customer data
      const customerData: any = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address || null,
        partner_id: formData.partner_id,
        battery_id: formData.battery_id,
        payment_type: formData.payment_type,
        join_date: formData.join_date,
        status: 'active',
        customer_photo_url: formData.customer_photo_url || null,
        id_type: formData.id_type,
        aadhaar_front_url: formData.aadhaar_front_url || null,
        aadhaar_back_url: formData.aadhaar_back_url || null,
        pan_card_url: formData.pan_card_url || null
      };

      // Add payment-specific fields
      if (formData.payment_type === 'emi') {
        const emiAmount = calculateEMIAmount();
        customerData.total_amount = parseFloat(formData.total_amount);
        customerData.down_payment = parseFloat(formData.down_payment);
        customerData.emi_count = parseInt(formData.emi_count);
        customerData.emi_amount = emiAmount;
        customerData.next_due_date = calculateNextDueDate();
      } else if (formData.payment_type === 'monthly_rent') {
        customerData.monthly_rent = parseFloat(formData.monthly_rent);
        customerData.security_deposit = parseFloat(formData.security_deposit) || 0;
        customerData.next_due_date = calculateNextDueDate();
      } else if (formData.payment_type === 'full_purchase') {
        customerData.purchase_amount = parseFloat(formData.total_amount);
        customerData.down_payment = parseFloat(formData.down_payment) || 0;
      }

      // Insert customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (customerError) throw customerError;

      // Update battery status and assignment
      const batteryUpdateData: any = {
        customer_id: customer.id,
        status: 'assigned',
        updated_at: new Date().toISOString()
      };

      // Add warranty information for EMI and full purchase
      if ((formData.payment_type === 'emi' || formData.payment_type === 'full_purchase') && 
          formData.warranty_start_date && formData.warranty_duration) {
        const warrantyStart = new Date(formData.warranty_start_date);
        const warrantyExpiry = new Date(warrantyStart);
        warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + parseInt(formData.warranty_duration));
        
        batteryUpdateData.warranty_expiry = warrantyExpiry.toISOString().split('T')[0];
      }

      const { error: batteryError } = await supabase
        .from('batteries')
        .update(batteryUpdateData)
        .eq('id', formData.battery_id);

      if (batteryError) throw batteryError;

      // Auto-schedule payments
      if (formData.payment_type === 'emi') {
        await scheduleEMIPayments(
          customer.id,
          parseFloat(formData.total_amount),
          parseFloat(formData.down_payment),
          parseInt(formData.emi_count),
          formData.join_date
        );
      } else if (formData.payment_type === 'monthly_rent') {
        await scheduleRentalPayments(
          customer.id,
          parseFloat(formData.monthly_rent),
          formData.join_date
        );
      }

      toast({
        title: "Customer added successfully",
        description: `${formData.name} has been added with ${formData.payment_type} plan.`,
      });

      setIsOpen(false);
      resetForm();
      window.location.reload();
      
    } catch (error: any) {
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
    setFormData({
      name: '',
      phone: '',
      address: '',
      join_date: new Date().toISOString().split('T')[0],
      partner_id: userRole === 'partner' ? user?.id : '',
      battery_id: '',
      payment_type: '',
      total_amount: '',
      down_payment: '',
      emi_count: '',
      warranty_start_date: '',
      warranty_duration: '',
      monthly_rent: '',
      security_deposit: '',
      customer_photo_url: '',
      id_type: 'aadhaar',
      aadhaar_front_url: '',
      aadhaar_back_url: '',
      pan_card_url: ''
    });
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const partnerOptions = [
    { value: 'partner1', label: 'Partner One' },
    { value: 'partner2', label: 'Partner Two' },
    { value: 'partner3', label: 'Partner Three' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter customer's full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter customer's address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="join_date">Joining Date *</Label>
                  <Input
                    id="join_date"
                    type="date"
                    value={formData.join_date}
                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Document Upload */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Photo */}
                <div>
                  <Label>Customer Photo</Label>
                  <FileUpload
                    bucket="customer-documents"
                    onUpload={(url) => setFormData({ ...formData, customer_photo_url: url })}
                    accept="image/*"
                    label="Upload Customer Photo"
                    currentFile={formData.customer_photo_url}
                  />
                </div>

                {/* ID Type Selection */}
                <div>
                  <Label htmlFor="id_type">ID Document Type</Label>
                  <Select value={formData.id_type} onValueChange={(value) => setFormData({ ...formData, id_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                      <SelectItem value="other">Other Government ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Aadhaar Documents */}
                {formData.id_type === 'aadhaar' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Aadhaar Front</Label>
                      <FileUpload
                        bucket="customer-documents"
                        onUpload={(url) => setFormData({ ...formData, aadhaar_front_url: url })}
                        accept="image/*"
                        label="Upload Aadhaar Front"
                        currentFile={formData.aadhaar_front_url}
                      />
                    </div>
                    <div>
                      <Label>Aadhaar Back</Label>
                      <FileUpload
                        bucket="customer-documents"
                        onUpload={(url) => setFormData({ ...formData, aadhaar_back_url: url })}
                        accept="image/*"
                        label="Upload Aadhaar Back"
                        currentFile={formData.aadhaar_back_url}
                      />
                    </div>
                  </div>
                )}

                {/* PAN Card */}
                <div>
                  <Label>PAN Card (Optional)</Label>
                  <FileUpload
                    bucket="customer-documents"
                    onUpload={(url) => setFormData({ ...formData, pan_card_url: url })}
                    accept="image/*"
                    label="Upload PAN Card"
                    currentFile={formData.pan_card_url}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Battery Assignment */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === 'admin' && (
                  <div>
                    <Label htmlFor="partner_id">Select Partner *</Label>
                    <Select value={formData.partner_id} onValueChange={(value) => setFormData({ ...formData, partner_id: value, battery_id: '' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerOptions.map((partner) => (
                          <SelectItem key={partner.value} value={partner.value}>{partner.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="battery_id">Select Battery *</Label>
                  <Select 
                    value={formData.battery_id} 
                    onValueChange={(value) => setFormData({ ...formData, battery_id: value })}
                    disabled={!formData.partner_id || loadingBatteries}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingBatteries ? "Loading batteries..." : "Select a battery"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatteries.map((battery) => (
                        <SelectItem key={battery.id} value={battery.id}>
                          {battery.serial_number} - {battery.model} ({battery.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.partner_id && availableBatteries.length === 0 && !loadingBatteries && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No available batteries found for this partner
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment Plans - Only show if battery is selected */}
          {currentStep === 4 && formData.battery_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Type Selection */}
                <div>
                  <Label>Payment Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {['emi', 'monthly_rent', 'full_purchase'].map((type) => (
                      <Card 
                        key={type}
                        className={`cursor-pointer transition-colors ${
                          formData.payment_type === type ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({ ...formData, payment_type: type })}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="font-medium capitalize">
                            {type === 'emi' ? 'EMI Plan' : type === 'monthly_rent' ? 'Monthly Rent' : 'Full Purchase'}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {type === 'emi' && 'Pay in installments'}
                            {type === 'monthly_rent' && 'Monthly rental payments'}
                            {type === 'full_purchase' && 'One-time purchase'}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* EMI Plan Details */}
                {formData.payment_type === 'emi' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">EMI Plan Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="total_amount">Total Amount (₹) *</Label>
                        <Input
                          id="total_amount"
                          type="number"
                          value={formData.total_amount}
                          onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                          placeholder="Enter total amount"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="down_payment">Down Payment (₹) *</Label>
                        <Input
                          id="down_payment"
                          type="number"
                          value={formData.down_payment}
                          onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                          placeholder="Enter down payment"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="emi_count">EMI Count *</Label>
                        <Select value={formData.emi_count} onValueChange={(value) => setFormData({ ...formData, emi_count: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select EMI count" />
                          </SelectTrigger>
                          <SelectContent>
                            {[6, 9, 12, 18, 24, 36].map((count) => (
                              <SelectItem key={count} value={count.toString()}>
                                {count} months
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Warranty Information */}
                    <Separator />
                    <h5 className="font-medium text-blue-800">Warranty Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="warranty_start_date">Warranty Start Date</Label>
                        <Input
                          id="warranty_start_date"
                          type="date"
                          value={formData.warranty_start_date}
                          onChange={(e) => setFormData({ ...formData, warranty_start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="warranty_duration">Warranty Duration (Years)</Label>
                        <Select value={formData.warranty_duration} onValueChange={(value) => setFormData({ ...formData, warranty_duration: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warranty period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* EMI Calculation Summary */}
                    {formData.total_amount && formData.down_payment && formData.emi_count && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h6 className="font-medium mb-2">EMI Summary</h6>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Loan Amount:</span>
                            <span>₹{(parseFloat(formData.total_amount) - parseFloat(formData.down_payment)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly EMI:</span>
                            <span>₹{calculateEMIAmount().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Due Date:</span>
                            <span>{calculateNextDueDate()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Monthly Rent Details */}
                {formData.payment_type === 'monthly_rent' && (
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Monthly Rent Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthly_rent">Monthly Rent (₹) *</Label>
                        <Input
                          id="monthly_rent"
                          type="number"
                          value={formData.monthly_rent}
                          onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                          placeholder="Enter monthly rent"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                        <Input
                          id="security_deposit"
                          type="number"
                          value={formData.security_deposit}
                          onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                          placeholder="Enter security deposit"
                        />
                      </div>
                    </div>

                    {/* Rent Summary */}
                    {formData.monthly_rent && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h6 className="font-medium mb-2">Rent Summary</h6>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Monthly Rent:</span>
                            <span>₹{parseFloat(formData.monthly_rent).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Due Date:</span>
                            <span>{calculateNextDueDate()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Purchase Details */}
                {formData.payment_type === 'full_purchase' && (
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Full Purchase Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total_amount">Purchase Amount (₹) *</Label>
                        <Input
                          id="total_amount"
                          type="number"
                          value={formData.total_amount}
                          onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                          placeholder="Enter purchase amount"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="down_payment">Amount Paid (₹)</Label>
                        <Input
                          id="down_payment"
                          type="number"
                          value={formData.down_payment}
                          onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                          placeholder="Enter amount paid"
                        />
                      </div>
                    </div>

                    {/* Warranty Information */}
                    <Separator />
                    <h5 className="font-medium text-purple-800">Warranty Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="warranty_start_date">Warranty Start Date</Label>
                        <Input
                          id="warranty_start_date"
                          type="date"
                          value={formData.warranty_start_date}
                          onChange={(e) => setFormData({ ...formData, warranty_start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="warranty_duration">Warranty Duration (Years)</Label>
                        <Select value={formData.warranty_duration} onValueChange={(value) => setFormData({ ...formData, warranty_duration: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warranty period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.name || !formData.phone)) ||
                    (currentStep === 3 && !formData.battery_id)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading || !formData.payment_type}
                >
                  {loading ? 'Adding Customer...' : 'Add Customer'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
