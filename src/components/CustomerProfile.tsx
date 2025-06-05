
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard, Battery, Calendar } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';
import { useTransactions } from '@/hooks/useTransactions';

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { batteries } = useBatteries();
  const { partners } = usePartners();
  const { transactions } = useTransactions();

  const customer = customers.find(c => c.id === id);
  const battery = customer?.battery_id ? batteries.find(b => b.id === customer.battery_id) : null;
  const partner = customer?.partner_id ? partners.find(p => p.id === customer.partner_id) : null;
  const customerTransactions = transactions.filter(t => t.customer_id === id);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
            <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer ID: {customer.customer_id || customer.id}</p>
          </div>
          <Badge className={getStatusColor(customer.status)}>
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Contact details and basic information</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold">{customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
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

            {/* Payment Information */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Billing and payment details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getPaymentTypeColor(customer.payment_type)}>
                    {customer.payment_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.payment_type === 'emi' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Total Amount</label>
                        <p className="text-lg font-semibold">₹{customer.total_amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Down Payment</label>
                        <p className="text-lg font-semibold">₹{customer.down_payment?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">EMI Amount</label>
                        <p className="text-lg font-semibold">₹{customer.emi_amount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">EMI Count</label>
                        <p className="text-lg font-semibold">{customer.emi_count || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  {customer.payment_type === 'monthly_rent' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                        <p className="text-lg font-semibold">₹{customer.monthly_rent?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                        <p className="text-lg font-semibold">₹{customer.security_deposit?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  {customer.payment_type === 'one_time_purchase' && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Purchase Amount</label>
                      <p className="text-lg font-semibold">₹{customer.purchase_amount?.toLocaleString() || 'N/A'}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Payment</label>
                    <p className="text-lg font-semibold">
                      {customer.last_payment_date ? new Date(customer.last_payment_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Next Due Date</label>
                    <p className="text-lg font-semibold">
                      {customer.next_due_date ? new Date(customer.next_due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment history</CardDescription>
              </CardHeader>
              <CardContent>
                {customerTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {customerTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.transaction_type}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{transaction.amount.toLocaleString()}</p>
                          <Badge className={transaction.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {transaction.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Photo */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {customer.customer_photo_url ? (
                    <img 
                      src={customer.customer_photo_url} 
                      alt={customer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <p className="text-gray-600">{customer.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* ID Documents */}
            {(customer.aadhaar_front_url || customer.aadhaar_back_url || customer.pan_card_url) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ID Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customer.aadhaar_front_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Aadhaar Front</label>
                      <img 
                        src={customer.aadhaar_front_url} 
                        alt="Aadhaar Front"
                        className="w-full h-20 object-cover rounded border mt-1"
                      />
                    </div>
                  )}
                  {customer.aadhaar_back_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Aadhaar Back</label>
                      <img 
                        src={customer.aadhaar_back_url} 
                        alt="Aadhaar Back"
                        className="w-full h-20 object-cover rounded border mt-1"
                      />
                    </div>
                  )}
                  {customer.pan_card_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">PAN Card</label>
                      <img 
                        src={customer.pan_card_url} 
                        alt="PAN Card"
                        className="w-full h-20 object-cover rounded border mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Assigned Battery */}
            {battery && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Battery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{battery.model}</p>
                    <p className="text-sm text-gray-600">SN: {battery.serial_number}</p>
                    <p className="text-sm text-gray-600">Capacity: {battery.capacity}</p>
                    <Badge className="bg-blue-100 text-blue-800">{battery.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Partner Information */}
            {partner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{partner.name}</p>
                    <p className="text-sm text-gray-600">{partner.phone}</p>
                    <p className="text-sm text-gray-600">{partner.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
