
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Calendar, CreditCard, Battery, Users, Edit, Plus, TrendingUp, Receipt, DollarSign } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { usePartners } from '@/hooks/usePartners';
import { useBilling } from '@/hooks/useBilling';
import PaymentModal from './PaymentModal';

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
  const { getBillingDetails } = useBilling();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const battery = useMemo(() => customer?.battery_id ? batteries.find(b => b.id === customer.battery_id) : null, [customer, batteries]);
  const partner = useMemo(() => customer?.partner_id ? partners.find(p => p.id === customer.partner_id) : null, [customer, partners]);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!customerId || !customer || hasFetchedRef.current) return;
      
      // Skip billing data fetch for one-time purchase customers
      if (customer.payment_type === 'one_time_purchase') {
        setLoading(false);
        return;
      }
      
      hasFetchedRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBillingDetails(customerId);
        setBillingData(data);
      } catch (err: any) {
        console.error('Failed to fetch billing data:', err);
        setError(err.message || 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    
    if (customer) {
      fetchBillingData();
    }
  }, [customerId, getBillingDetails, customer]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handlePaymentSuccess = () => {
    hasFetchedRef.current = false;
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'due':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'EMI';
      case 'monthly_rent':
        return 'RENTAL';
      case 'one_time_purchase':
        return 'PURCHASE';
      default:
        return paymentType.toUpperCase();
    }
  };

  // Determine what schedule to show based on customer type
  const getScheduleData = () => {
    if (!customer || !billingData) return null;

    if (customer.payment_type === 'emi') {
      return {
        type: 'emi',
        title: 'EMI Schedule',
        data: billingData.emis || [],
        icon: CreditCard
      };
    } else if (customer.payment_type === 'monthly_rent') {
      return {
        type: 'rent',
        title: 'Rent Schedule',
        data: billingData.rents || [],
        icon: Receipt
      };
    } else if (customer.payment_type === 'one_time_purchase') {
      return {
        type: 'purchase',
        title: 'Purchase Details',
        data: [],
        icon: DollarSign
      };
    }
    return null;
  };

  const scheduleData = getScheduleData();

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

  const renderScheduleContent = () => {
    if (!scheduleData) return null;

    if (customer.payment_type === 'one_time_purchase') {
      return (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">One-Time Purchase</h3>
          <p className="text-gray-600 mb-4">This customer has made a one-time purchase.</p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Purchase Amount</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(customer.purchase_amount || 0)}</p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading schedule...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              hasFetchedRef.current = false;
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (scheduleData.data.length === 0) {
      const emptyMessage = customer.payment_type === 'emi' 
        ? 'No EMI schedule available. EMI plan may not be set up yet.'
        : 'No rent schedule available. Rent charges may not be generated yet.';
      
      return (
        <div className="text-center py-8">
          <scheduleData.icon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Schedule Found</h3>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Progress Bar for EMI only */}
        {customer.payment_type === 'emi' && billingData?.emiProgress && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium">EMI Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {billingData.emiProgress.paid}/{billingData.emiProgress.total} EMIs paid</span>
                <span>{billingData.emiProgress.percentage}%</span>
              </div>
              <Progress value={billingData.emiProgress.percentage} className="w-full" />
            </div>
          </div>
        )}

        {/* Schedule Table */}
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {customer.payment_type === 'emi' ? 'EMI #' : 'Month'}
                </TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                {customer.payment_type === 'emi' && (
                  <TableHead className="text-xs">Remaining</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">
                    {customer.payment_type === 'emi' 
                      ? `${item.emi_number}/${item.total_emi_count}`
                      : formatDate(item.rent_month)
                    }
                  </TableCell>
                  <TableCell className="text-sm">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="text-sm">{formatDate(item.due_date)}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(item.payment_status)} text-xs`}>
                      {item.payment_status}
                    </Badge>
                  </TableCell>
                  {customer.payment_type === 'emi' && (
                    <TableCell className="text-sm">{formatCurrency(item.remaining_amount)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderPaymentDetails = () => {
    if (customer.payment_type === 'emi') {
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Total Amount</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.total_amount || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Down Payment</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.down_payment || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">EMI Count</label>
            <p className="text-lg font-semibold">{customer.emi_count || 'N/A'} months</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">EMI Amount</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.emi_amount || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">EMI Start Date</label>
            <p className="text-lg font-semibold">
              {customer.emi_start_date ? formatDate(customer.emi_start_date) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Next Due Date</label>
            <p className="text-lg font-semibold">
              {customer.next_due_date ? formatDate(customer.next_due_date) : 'N/A'}
            </p>
          </div>
        </div>
      );
    } else if (customer.payment_type === 'monthly_rent') {
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Monthly Rent Amount</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.monthly_rent || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Security Deposit</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.security_deposit || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Join Date</label>
            <p className="text-lg font-semibold">
              {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
            </p>
          </div>
        </div>
      );
    } else if (customer.payment_type === 'one_time_purchase') {
      return (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Purchase Amount</label>
            <p className="text-lg font-semibold">{formatCurrency(customer.purchase_amount || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Purchase Date</label>
            <p className="text-lg font-semibold">
              {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">✓ Payment Complete</p>
            <p className="text-xs text-green-600">This customer has completed their purchase.</p>
          </div>
        </div>
      );
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
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(customer.status)}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
            <Badge className={getPaymentTypeColor(customer.payment_type)}>
              {getPaymentTypeLabel(customer.payment_type)}
            </Badge>
            {customer.payment_type !== 'one_time_purchase' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Photo and Information */}
        <div className="lg:col-span-1 space-y-4">
          {/* Customer Photo */}
          <Card>
            <CardContent className="p-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                {customer.customer_photo_url ? (
                  <img 
                    src={customer.customer_photo_url} 
                    alt={customer.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm">{customer.name}</p>
              </div>
              <div>
                <p className="font-semibold text-sm">{customer.phone}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Join Date</label>
                <p className="font-semibold text-sm">
                  {customer.join_date ? new Date(customer.join_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {customer.address && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Address</label>
                  <p className="font-semibold text-sm">{customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Battery and Partner Information */}
          {(battery || partner) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Battery className="w-4 h-4" />
                  Battery & Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {battery && (
                  <div>
                    <h4 className="font-semibold mb-2 text-xs text-blue-700">Assigned Battery</h4>
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-blue-50">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Battery className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{battery.serial_number}</p>
                        <p className="text-xs text-gray-600">{battery.model} - {battery.capacity}</p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">{battery.status}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {partner && (
                  <div>
                    <h4 className="font-semibold mb-2 text-xs text-green-700">Assigned Partner</h4>
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-green-50">
                      <div className="p-1 bg-green-100 rounded-full">
                        <Users className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{partner.name}</p>
                        <p className="text-xs text-gray-600">{partner.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Payment Details, Schedule, Summary, and Transactions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upper Section - Payment Details and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left - Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5" />
                  {customer.payment_type === 'emi' ? 'EMI Details' : 
                   customer.payment_type === 'monthly_rent' ? 'Rental Details' : 
                   'Purchase Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPaymentDetails()}
              </CardContent>
            </Card>

            {/* Right - Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scheduleData && <scheduleData.icon className="w-5 h-5" />}
                  {scheduleData?.title || 'Schedule'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderScheduleContent()}
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards - Only show for EMI and Rental customers */}
          {customer.payment_type !== 'one_time_purchase' && !loading && billingData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-green-600">{formatCurrency(billingData.totalPaid)}</div>
                  <div className="text-sm text-gray-600">Total Paid</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-red-600">{formatCurrency(billingData.totalDue)}</div>
                  <div className="text-sm text-gray-600">Outstanding Balance</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(billingData.credits?.credit_balance || 0)}</div>
                  <div className="text-sm text-gray-600">Credit Balance</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {billingData.nextDueDate ? formatDate(billingData.nextDueDate) : 'No Due'}
                  </div>
                  <div className="text-sm text-gray-600">Next Due Date</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transaction List - Only show for EMI and Rental customers */}
          {customer.payment_type !== 'one_time_purchase' && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading transactions...</p>
                  </div>
                )}

                {!loading && billingData?.transactions && billingData.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingData.transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.payment_status)}>
                              {transaction.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : !loading && (
                  <p className="text-center text-gray-600 py-4">No transactions found.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
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
        </div>
      </div>

      {/* Payment Modal - Only show for EMI and Rental customers */}
      {customer.payment_type !== 'one_time_purchase' && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          customerId={customerId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default CustomerProfile;
