import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/AuthContext';

const BillingDashboard = () => {
  const { transactions, loading } = useTransactions();
  const { generateMonthlyRents, updateOverdueStatus } = useBilling();
  const { userRole } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState('thisMonth');

  useEffect(() => {
    // Update overdue status on load
    updateOverdueStatus();
  }, []);

  const handleGenerateRents = async () => {
    await generateMonthlyRents();
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate: Date;

    switch (filterPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'thisWeek':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(t => 
      new Date(t.transaction_date) >= startDate
    );
  };

  const filteredTransactions = getFilteredTransactions();

  const totalRevenue = filteredTransactions
    .filter(t => t.payment_status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = filteredTransactions.length;

  const emiPayments = filteredTransactions.filter(t => t.transaction_type === 'emi');
  const rentPayments = filteredTransactions.filter(t => t.transaction_type === 'rent');

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Billing Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Overview of payments and billing activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {userRole === 'admin' && (
            <Button onClick={handleGenerateRents} variant="outline" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              Generate Monthly Rents
            </Button>
          )}
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{totalTransactions}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{emiPayments.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">EMI Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{rentPayments.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Rent Payments</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      <Card className="mx-4 sm:mx-0">
        <CardHeader>
          <CardTitle className="flex items-center text-lg lg:text-xl">
            <TrendingUp className="w-5 h-5 mr-2" />
            Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-4">
                {filteredTransactions.map((transaction) => (
                  <Card key={transaction.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{transaction.customers?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{formatDate(transaction.transaction_date)}</p>
                        </div>
                        <Badge className={getStatusColor(transaction.payment_status)}>
                          {transaction.payment_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="capitalize">{transaction.transaction_type}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Remarks:</span>
                          <p className="truncate">{transaction.remarks || '-'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                            <TableCell>{transaction.customers?.name || 'N/A'}</TableCell>
                            <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
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
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-gray-600">No transactions found for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;
