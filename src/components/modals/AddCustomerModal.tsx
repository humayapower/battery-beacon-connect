
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, CreditCard, FileText, Upload, X, Phone, MapPin, Calendar, User, Battery, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/shared/FileUpload';
import { Battery as BatteryType } from '@/types';

interface Partner {
  id: string;
  name: string;
  phone: string;
  username: string;
}

const AddCustomerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [batteries, setBatteries] = useState<BatteryType[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customer_id: '',
    id_type: 'aadhaar',
    payment_type: 'monthly_rent',
    monthly_rent: '',
    monthly_amount: '',
    emi_amount: '',
    emi_count: '',
    down_payment: '',
    security_deposit: '',
    total_amount: '',
    purchase_amount: '',
    partner_id: userRole === 'partner' ? user?.id : '',
    battery_id: '',
    join_date: new Date().toISOString().split('T')[0],
    emi_start_date: '',
    customer_photo_url: '',
    aadhaar_front_url: '',
    aadhaar_back_url: '',
    pan_card_url: ''
  });

  // Fetch partners and batteries on component mount
  useEffect(() => {
    if (isOpen) {
      fetchPartnersAndBatteries();
    }
  }, [isOpen, userRole, user?.id]);

  const fetchPartnersAndBatteries = async () => {
    try {
      // Fetch partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('users')
        .select('id, name, phone, username')
        .eq('role', 'partner');

      if (partnersError) throw partnersError;
      setPartners(partnersData || []);

      // Fetch available batteries based on user role
      let batteriesQuery = supabase
        .from('batteries')
        .select('*')
        .eq('status', 'available')
        .is('customer_id', null);

      if (userRole === 'partner') {
        batteriesQuery = batteriesQuery.eq('partner_id', user?.id);
      }

      const { data: batteriesData, error: batteriesError } = await batteriesQuery;

      if (batteriesError) throw batteriesError;
      
      // Cast the status to the correct type
      const typedBatteries: BatteryType[] = (batteriesData || []).map(battery => ({
        ...battery,
        status: battery.status as BatteryType['status']
      }));
      
      setBatteries(typedBatteries);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.phone.trim()) {
        throw new Error('Name and phone are required');
      }

      // Payment type specific validations
      if (formData.payment_type === 'monthly_rent' && !formData.monthly_rent) {
        throw new Error('Monthly rent amount is required');
      }

      if (formData.payment_type === 'emi') {
        if (!formData.emi_amount || !formData.emi_count || !formData.total_amount || !formData.down_payment) {
          throw new Error('EMI amount, EMI count, total amount, and down payment are required for EMI customers');
        }
      }

      if (formData.payment_type === 'one_time_purchase' && !formData.purchase_amount) {
        throw new Error('Purchase amount is required for one-time purchase');
      }

      const customerData = {
        ...formData,
        monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : null,
        monthly_amount: formData.monthly_amount ? parseFloat(formData.monthly_amount) : null,
        emi_amount: formData.emi_amount ? parseFloat(formData.emi_amount) : null,
        emi_count: formData.emi_count ? parseInt(formData.emi_count) : null,
        down_payment: formData.down_payment ? parseFloat(formData.down_payment) : null,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
        purchase_amount: formData.purchase_amount ? parseFloat(formData.purchase_amount) : null,
        partner_id: formData.partner_id || null,
        battery_id: formData.battery_id || null,
        emi_start_date: formData.emi_start_date || null,
        status: 'active'
      };

      const { error } = await supabase
        .from('customers')
        .insert([customerData]);

      if (error) throw error;

      toast({
        title: "Customer added successfully",
        description: "The customer has been added to the system.",
      });

      setIsOpen(false);
      resetForm();
      
      // Refresh the page to show the new customer
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
      email: '',
      address: '',
      customer_id: '',
      id_type: 'aadhaar',
      payment_type: 'monthly_rent',
      monthly_rent: '',
      monthly_amount: '',
      emi_amount: '',
      emi_count: '',
      down_payment: '',
      security_deposit: '',
      total_amount: '',
      purchase_amount: '',
      partner_id: userRole === 'partner' ? user?.id : '',
      battery_id: '',
      join_date: new Date().toISOString().split('T')[0],
      emi_start_date: '',
      customer_photo_url: '',
      aadhaar_front_url: '',
      aadhaar_back_url: '',
      pan_card_url: ''
    });
    setActiveTab('personal');
  };

  const handleFileUpload = (field: string) => (url: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: url || ''
    }));
  };

  const removeFile = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateAndProceed = (nextTab: string) => {
    const currentTabIndex = ['personal', 'documents', 'assignment', 'payment'].indexOf(activeTab);
    const nextTabIndex = ['personal', 'documents', 'assignment', 'payment'].indexOf(nextTab);
    
    if (nextTabIndex > currentTabIndex) {
      // Validate current tab before proceeding
      if (activeTab === 'personal') {
        if (!formData.name.trim() || !formData.phone.trim()) {
          toast({
            title: "Validation Error",
            description: "Name and phone are required in personal information.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    setActiveTab(nextTab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" data-add-customer-trigger>
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Users className="w-5 h-5" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={validateAndProceed} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Assignment
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] w-full pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
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
                          placeholder="Enter full name"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer_id">Customer ID</Label>
                        <Input
                          id="customer_id"
                          value={formData.customer_id}
                          onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                          placeholder="Enter customer ID"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter full address"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="id_type">ID Type</Label>
                        <Select value={formData.id_type} onValueChange={(value) => setFormData({ ...formData, id_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="voter_id">Voter ID</SelectItem>
                            <SelectItem value="driving_license">Driving License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="join_date">Join Date</Label>
                        <Input
                          id="join_date"
                          type="date"
                          value={formData.join_date}
                          onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Document Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Customer Photo */}
                    <div>
                      <FileUpload
                        label="Customer Photo"
                        value={formData.customer_photo_url}
                        onChange={handleFileUpload('customer_photo_url')}
                        accept="image/*"
                        bucketName="customer-documents"
                      />
                      {formData.customer_photo_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Photo uploaded</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile('customer_photo_url')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Aadhaar Documents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FileUpload
                          label="Aadhaar Front"
                          value={formData.aadhaar_front_url}
                          onChange={handleFileUpload('aadhaar_front_url')}
                          accept="image/*,.pdf"
                          bucketName="customer-documents"
                        />
                        {formData.aadhaar_front_url && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('aadhaar_front_url')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <FileUpload
                          label="Aadhaar Back"
                          value={formData.aadhaar_back_url}
                          onChange={handleFileUpload('aadhaar_back_url')}
                          accept="image/*,.pdf"
                          bucketName="customer-documents"
                        />
                        {formData.aadhaar_back_url && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('aadhaar_back_url')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div>
                      <FileUpload
                        label="PAN Card"
                        value={formData.pan_card_url}
                        onChange={handleFileUpload('pan_card_url')}
                        accept="image/*,.pdf"
                        bucketName="customer-documents"
                      />
                      {formData.pan_card_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">Uploaded</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile('pan_card_url')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignment Tab */}
              <TabsContent value="assignment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="w-5 h-5" />
                      Partner & Battery Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userRole === 'admin' && (
                      <div>
                        <Label htmlFor="partner_id">Assign to Partner</Label>
                        <Select value={formData.partner_id} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a partner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Partner</SelectItem>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name} ({partner.username})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="battery_id">Assign Battery</Label>
                      <Select value={formData.battery_id} onValueChange={(value) => setFormData({ ...formData, battery_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a battery" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Battery</SelectItem>
                          {batteries.map((battery) => (
                            <SelectItem key={battery.id} value={battery.id}>
                              {battery.serial_number} - {battery.model} ({battery.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {batteries.length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          No available batteries found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="payment_type">Payment Type *</Label>
                      <Select value={formData.payment_type} onValueChange={(value) => setFormData({ ...formData, payment_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly_rent">Monthly Rent</SelectItem>
                          <SelectItem value="emi">EMI</SelectItem>
                          <SelectItem value="one_time_purchase">One Time Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment type specific fields */}
                    {formData.payment_type === 'monthly_rent' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="monthly_rent">Monthly Rent Amount *</Label>
                          <Input
                            id="monthly_rent"
                            type="number"
                            step="0.01"
                            value={formData.monthly_rent}
                            onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                            placeholder="Enter monthly rent"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="security_deposit">Security Deposit</Label>
                          <Input
                            id="security_deposit"
                            type="number"
                            step="0.01"
                            value={formData.security_deposit}
                            onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                            placeholder="Enter security deposit"
                          />
                        </div>
                      </div>
                    )}

                    {formData.payment_type === 'emi' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="total_amount">Total Amount *</Label>
                            <Input
                              id="total_amount"
                              type="number"
                              step="0.01"
                              value={formData.total_amount}
                              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                              placeholder="Enter total amount"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="down_payment">Down Payment *</Label>
                            <Input
                              id="down_payment"
                              type="number"
                              step="0.01"
                              value={formData.down_payment}
                              onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                              placeholder="Enter down payment"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="emi_amount">EMI Amount *</Label>
                            <Input
                              id="emi_amount"
                              type="number"
                              step="0.01"
                              value={formData.emi_amount}
                              onChange={(e) => setFormData({ ...formData, emi_amount: e.target.value })}
                              placeholder="Enter EMI amount"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="emi_count">Number of EMIs *</Label>
                            <Input
                              id="emi_count"
                              type="number"
                              value={formData.emi_count}
                              onChange={(e) => setFormData({ ...formData, emi_count: e.target.value })}
                              placeholder="Enter number of EMIs"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="emi_start_date">EMI Start Date</Label>
                          <Input
                            id="emi_start_date"
                            type="date"
                            value={formData.emi_start_date}
                            onChange={(e) => setFormData({ ...formData, emi_start_date: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {formData.payment_type === 'one_time_purchase' && (
                      <div>
                        <Label htmlFor="purchase_amount">Purchase Amount *</Label>
                        <Input
                          id="purchase_amount"
                          type="number"
                          step="0.01"
                          value={formData.purchase_amount}
                          onChange={(e) => setFormData({ ...formData, purchase_amount: e.target.value })}
                          placeholder="Enter purchase amount"
                          required
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Form Actions */}
              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {activeTab !== 'personal' && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        const tabs = ['personal', 'documents', 'assignment', 'payment'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex > 0) {
                          setActiveTab(tabs[currentIndex - 1]);
                        }
                      }}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  
                  {activeTab !== 'payment' ? (
                    <Button 
                      type="button" 
                      onClick={() => {
                        const tabs = ['personal', 'documents', 'assignment', 'payment'];
                        const currentIndex = tabs.indexOf(activeTab);
                        if (currentIndex < tabs.length - 1) {
                          validateAndProceed(tabs[currentIndex + 1]);
                        }
                      }}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Adding Customer...' : 'Add Customer'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerModal;
