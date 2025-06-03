import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CreditCard } from 'lucide-react';
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
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Transactions' : 'My Transactions'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'View all payment transactions across partners' : 'Track your customer payments and billing'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <div className="text-sm text-gray-600">Pending Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {transactions.filter(t => t.payment_status === 'paid').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>{transaction.customers?.name || 'N/A'}</TableCell>
                      <TableCell>{transaction.batteries?.serial_number || 'N/A'}</TableCell>
                      <TableCell>{transaction.transaction_type}</TableCell>
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
          ) : (
            <div className="text-center py-8">
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
