
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Phone, Mail, CreditCard, Battery, Edit, FileText, Save } from 'lucide-react';
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
  const [notes, setNotes] = useState('');

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

  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'emi':
        return 'EMI';
      case 'monthly_rent':
        return 'Subscription';
      case 'one_time_purchase':
        return 'Full Purchase';
      default:
        return type;
    }
  };

  const calculateAmountPaid = () => {
    return customerTransactions
      .filter(t => t.payment_status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateBalanceAmount = () => {
    const totalAmount = customer.total_amount || 0;
    const amountPaid = calculateAmountPaid();
    return totalAmount - amountPaid;
  };

  const getEMIsPaid = () => {
    return customerTransactions.filter(t => t.transaction_type === 'emi' && t.payment_status === 'paid').length;
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
                <Badge className={getPaymentTypeColor(customer.payment_type)} variant="secondary">
                  {formatPaymentType(customer.payment_type)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="battery">Battery</TabsTrigger>
              <TabsTrigger value="partner">Partner</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
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

              {/* Identity Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Identity Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID Type</label>
                      <p className="text-lg font-semibold">{customer.id_type?.toUpperCase() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {customer.aadhaar_front_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Aadhaar Front</label>
                        <div className="mt-2">
                          <img 
                            src={customer.aadhaar_front_url} 
                            alt="Aadhaar Front"
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(customer.aadhaar_front_url, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    {customer.aadhaar_back_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Aadhaar Back</label>
                        <div className="mt-2">
                          <img 
                            src={customer.aadhaar_back_url} 
                            alt="Aadhaar Back"
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(customer.aadhaar_back_url, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    {customer.pan_card_url && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">PAN Card</label>
                        <div className="mt-2">
                          <img 
                            src={customer.pan_card_url} 
                            alt="PAN Card"
                            className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(customer.pan_card_url, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Information Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Type</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPaymentTypeColor(customer.payment_type)}>
                          {formatPaymentType(customer.payment_type)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Amount</label>
                      <p className="text-lg font-semibold">₹{customer.total_amount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                      <p className="text-lg font-semibold text-green-600">₹{calculateAmountPaid().toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Balance Amount</label>
                      <p className="text-lg font-semibold text-red-600">₹{calculateBalanceAmount().toLocaleString()}</p>
                    </div>
                    {customer.payment_type === 'monthly_rent' && customer.security_deposit && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                        <p className="text-lg font-semibold">₹{customer.security_deposit.toLocaleString()}</p>
                      </div>
                    )}
                    {customer.payment_type === 'emi' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">EMIs Paid</label>
                          <p className="text-lg font-semibold">{getEMIsPaid()} / {customer.emi_count || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">EMI Amount</label>
                          <p className="text-lg font-semibold">₹{customer.emi_amount?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {customer.next_due_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Next Payment Due Date</label>
                      <p className="text-lg font-semibold">
                        {new Date(customer.next_due_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Complete list of all payments and transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {customerTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              {transaction.transaction_type}
                            </TableCell>
                            <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.payment_status === 'paid' ? 'default' : 'secondary'}>
                                {transaction.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>Cash</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No transactions found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Battery Information Tab */}
            <TabsContent value="battery" className="space-y-6">
              {battery ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="w-5 h-5" />
                      Assigned Battery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Serial Number</label>
                        <p className="text-lg font-semibold">{battery.serial_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Model</label>
                        <p className="text-lg font-semibold">{battery.model}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Capacity</label>
                        <p className="text-lg font-semibold">{battery.capacity}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Battery Status</label>
                        <Badge className={getStatusColor(battery.status)}>
                          {battery.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Battery className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Battery Assigned</h3>
                    <p className="text-gray-600">This customer doesn't have a battery assigned yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Partner Information Tab */}
            <TabsContent value="partner" className="space-y-6">
              {partner ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Assigned Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Partner Name</label>
                        <p className="text-lg font-semibold">{partner.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Partner Contact</label>
                        <p className="text-lg font-semibold">{partner.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-lg font-semibold">{partner.address || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">No Partner Assigned</h3>
                    <p className="text-gray-600">This customer doesn't have a partner assigned yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes & Remarks
                  </CardTitle>
                  <CardDescription>
                    Support history, complaints, remarks, and other important notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this customer, support history, complaints, etc..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                  />
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
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
