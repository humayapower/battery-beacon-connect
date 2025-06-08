
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { BillingDetails } from '@/types/billing';
import PaymentModal from './PaymentModal';

interface CustomerBillingPageProps {
  customerId: string;
  customerName: string;
}

const CustomerBillingPage = ({ customerId, customerName }: CustomerBillingPageProps) => {
  const [billingData, setBillingData] = useState<BillingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { getBillingDetails, updateOverdueStatus } = useBilling();

  const fetchBillingData = async () => {
    setLoading(true);
    await updateOverdueStatus(); // Update overdue status first
    const data = await getBillingDetails(customerId);
    setBillingData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBillingData();
  }, [customerId]);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load billing information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customerName} - Billing</h1>
          <p className="text-gray-600">Financial account and payment history</p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(billingData.totalPaid)}</div>
            <div className="text-sm text-gray-600">Total Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(billingData.totalDue)}</div>
            <div className="text-sm text-gray-600">Outstanding Balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(billingData.credits.credit_balance)}</div>
            <div className="text-sm text-gray-600">Credit Balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {billingData.nextDueDate ? formatDate(billingData.nextDueDate) : 'No Due'}
            </div>
            <div className="text-sm text-gray-600">Next Due Date</div>
          </CardContent>
        </Card>
      </div>

      {/* EMI Progress */}
      {billingData.emiProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              EMI Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress: {billingData.emiProgress.paid}/{billingData.emiProgress.total} EMIs paid</span>
                <span>{billingData.emiProgress.percentage}%</span>
              </div>
              <Progress value={billingData.emiProgress.percentage} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      <Tabs defaultValue="emis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emis">EMIs</TabsTrigger>
          <TabsTrigger value="rents">Monthly Rents</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="emis">
          <Card>
            <CardHeader>
              <CardTitle>EMI Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {billingData.emis.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EMI #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.emis.map((emi) => (
                      <TableRow key={emi.id}>
                        <TableCell>{emi.emi_number}/{emi.total_emi_count}</TableCell>
                        <TableCell>{formatCurrency(emi.amount)}</TableCell>
                        <TableCell>{formatDate(emi.due_date)}</TableCell>
                        <TableCell>{formatCurrency(emi.paid_amount)}</TableCell>
                        <TableCell>{formatCurrency(emi.remaining_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(emi.payment_status)}>
                            {emi.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-600 py-4">No EMI plan for this customer.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rents">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rent History</CardTitle>
            </CardHeader>
            <CardContent>
              {billingData.rents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.rents.map((rent) => (
                      <TableRow key={rent.id}>
                        <TableCell>{new Date(rent.rent_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</TableCell>
                        <TableCell>{formatCurrency(rent.amount)}</TableCell>
                        <TableCell>{formatDate(rent.due_date)}</TableCell>
                        <TableCell>{formatCurrency(rent.paid_amount)}</TableCell>
                        <TableCell>{formatCurrency(rent.remaining_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(rent.payment_status)}>
                            {rent.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-600 py-4">No monthly rent charges for this customer.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {billingData.transactions.length > 0 ? (
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
                    {billingData.transactions.map((transaction) => (
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
              ) : (
                <p className="text-center text-gray-600 py-4">No transactions found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        customerId={customerId}
        onPaymentSuccess={fetchBillingData}
      />
    </div>
  );
};

export default CustomerBillingPage;
