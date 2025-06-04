
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, CreditCard, Eye } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';

interface TransactionTableProps {
  isAdmin: boolean;
}

const TransactionTable = ({ isAdmin }: TransactionTableProps) => {
  const { transactions, loading } = useTransactions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'due':
        return 'bg-orange-100 text-orange-800';
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

  const totalRevenue = transactions
    .filter(t => t.payment_status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.payment_status === 'partial' || t.payment_status === 'due')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{isAdmin ? 'All Transactions' : 'My Transactions'}</h2>
          <p className="text-sm lg:text-base text-gray-600">
            {isAdmin ? 'View all payment transactions across partners' : 'Track your customer payments and billing'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{transactions.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {transactions.filter(t => t.payment_status === 'paid').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-4 sm:mx-0">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-4">
                {transactions.map((transaction) => (
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
                        <div>
                          <span className="text-gray-500">Battery:</span>
                          <p>{transaction.batteries?.serial_number || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">ID:</span>
                          <p className="truncate">{transaction.id}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
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
                          <TableHead className="w-[100px]">Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Battery</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium truncate">{transaction.id.slice(0, 8)}...</TableCell>
                            <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                            <TableCell>{transaction.customers?.name || 'N/A'}</TableCell>
                            <TableCell>{transaction.batteries?.serial_number || 'N/A'}</TableCell>
                            <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(transaction.payment_status)}>
                                {transaction.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <CreditCard className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
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
              <p className="text-gray-600 mb-4">No transactions found. Record your first transaction to get started.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionTable;
