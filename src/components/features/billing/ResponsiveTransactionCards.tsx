
// import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye } from 'lucide-react';
import { TransactionWithRelations } from '@/hooks/useTransactions';

interface ResponsiveTransactionCardsProps {
  transactions: TransactionWithRelations[];
}

const ResponsiveTransactionCards = ({ transactions }: ResponsiveTransactionCardsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'due':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-xs">{transaction.id.substring(0, 8)}...</span>
              </div>
              <Badge className={getStatusColor(transaction.payment_status)}>
                {transaction.payment_status}
              </Badge>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium dark:text-gray-200">{formatDate(transaction.transaction_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-sm dark:text-gray-200">{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium capitalize dark:text-gray-200">{transaction.transaction_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                <span className="font-medium truncate ml-1 dark:text-gray-200">{transaction.customers?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Battery:</span>
                <span className="font-medium text-xs truncate ml-1 dark:text-gray-200">{transaction.batteries?.serial_number || 'N/A'}</span>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4">
              <Button variant="outline" size="sm" className="w-full text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponsiveTransactionCards;
