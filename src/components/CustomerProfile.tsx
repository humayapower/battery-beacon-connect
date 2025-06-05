
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, CreditCard, Battery } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';
import { useTransactions } from '@/hooks/useTransactions';

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
  const { transactions } = useTransactions();

  const customer = customers.find(c => c.id === customerId);
  const battery = customer?.battery_id ? batteries.find(b => b.id === customer.battery_id) : null;
  const partner = customer?.partner_id ? partners.find(p => p.id === customer.partner_id) : null;
  const customerTransactions = transactions.filter(t => t.customer_id === customerId);

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
          <Badge className={getStatusColor(customer.status)}>
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </Badge>
        </div>
      )}

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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                    <p className="text-lg font-semibold">₹{customer.monthly_rent?.toLocaleString() || 'N/A'}</p>
                  </div>
                )}
              </div>
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
  );
};

export default CustomerProfile;
