
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, CreditCard, Battery, Users, Edit } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';

interface CustomerProfileProps {
  customerId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  customerId, 
  onBack, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { batteries } = useBatteries();
  const { partners } = usePartners();

  const customer = customers.find(c => c.id === customerId);
  const battery = customer?.battery_id ? batteries.find(b => b.id === customer.battery_id) : null;
  const partner = customer?.partner_id ? partners.find(p => p.id === customer.partner_id) : null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
            {showBackButton && (
              <Button onClick={handleBack}>Go Back</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'bg-blue-100 text-blue-800';
      case 'monthly_rent':
        return 'bg-purple-100 text-purple-800';
      case 'one_time_purchase':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showBackButton && (
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer ID: {customer.customer_id || customer.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(customer.status)}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
            <Badge className={getPaymentTypeColor(customer.payment_type)}>
              {customer.payment_type.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Customer Photo */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {customer.customer_photo_url ? (
                  <img 
                    src={customer.customer_photo_url} 
                    alt={customer.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <p className="text-gray-600">{customer.phone}</p>
                <Badge className={getStatusColor(customer.status)} variant="secondary">
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="payment">Payment Details</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
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
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold">{customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-lg font-semibold">{customer.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg font-semibold">{customer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Join Date</label>
                      <p className="text-lg font-semibold">
                        {customer.join_date ? new Date(customer.join_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {customer.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-lg font-semibold">{customer.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Details Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Type</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getPaymentTypeColor(customer.payment_type)}>
                          {customer.payment_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* EMI Details */}
                  {customer.payment_type === 'emi' && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold mb-3 text-blue-800">EMI Plan Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Amount</label>
                          <p className="text-lg font-semibold">₹{customer.total_amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Down Payment</label>
                          <p className="text-lg font-semibold">₹{customer.down_payment?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">EMI Count</label>
                          <p className="text-lg font-semibold">{customer.emi_count || 'N/A'} months</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">EMI Amount</label>
                          <p className="text-lg font-semibold">₹{customer.emi_amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">EMI Start Date</label>
                          <p className="text-lg font-semibold">
                            {customer.emi_start_date ? new Date(customer.emi_start_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Next Due Date</label>
                          <p className="text-lg font-semibold">
                            {customer.next_due_date ? new Date(customer.next_due_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monthly Rent Details */}
                  {customer.payment_type === 'monthly_rent' && (
                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-semibold mb-3 text-purple-800">Monthly Rent Plan Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Monthly Rent Amount</label>
                          <p className="text-lg font-semibold">₹{customer.monthly_rent?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                          <p className="text-lg font-semibold">₹{customer.security_deposit?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* One-time Purchase Details */}
                  {customer.payment_type === 'one_time_purchase' && (
                    <div className="p-4 border rounded-lg bg-green-50">
                      <h4 className="font-semibold mb-3 text-green-800">Purchase Details</h4>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Purchase Amount</label>
                        <p className="text-lg font-semibold">₹{customer.purchase_amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-6">
              {battery && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="w-5 h-5" />
                      Assigned Battery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Battery className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{battery.serial_number}</p>
                          <p className="text-sm text-gray-600">{battery.model} - {battery.capacity}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{battery.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {partner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Assigned Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{partner.name}</p>
                          <p className="text-sm text-gray-600">{partner.phone}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!battery && !partner && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
                    <p className="text-gray-600">This customer is not currently assigned to any battery or partner.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identity Documents</CardTitle>
                  <CardDescription>Customer's identification documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-400 mb-2">Aadhaar Front</div>
                      {customer.aadhaar_front_url ? (
                        <img 
                          src={customer.aadhaar_front_url} 
                          alt="Aadhaar Front" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Document not uploaded</p>
                      )}
                    </div>
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-400 mb-2">Aadhaar Back</div>
                      {customer.aadhaar_back_url ? (
                        <img 
                          src={customer.aadhaar_back_url} 
                          alt="Aadhaar Back" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Document not uploaded</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
