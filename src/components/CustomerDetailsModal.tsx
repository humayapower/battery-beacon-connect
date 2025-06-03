
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, Phone, MapPin, CreditCard, Battery, User, X } from 'lucide-react';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';

interface CustomerDetailsModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal = ({ customerId, isOpen, onClose }: CustomerDetailsModalProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const { getCustomerById } = useCustomers();
  const { transactions } = useTransactions();

  const customerTransactions = transactions.filter(t => t.customer_id === customerId);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;
      
      setLoading(true);
      const result = await getCustomerById(customerId);
      if (result.success) {
        setCustomer(result.data);
      }
      setLoading(false);
    };

    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, isOpen, getCustomerById]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Customer Details</span>
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Customer Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{customer.name}</CardTitle>
                    <CardDescription>Customer ID: {customer.id}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="space-y-3">
                      {customer.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.address && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                          <span className="text-sm">{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <span className="font-medium">Join Date:</span> {formatDate(customer.join_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          <span className="font-medium">Monthly Amount:</span> {formatCurrency(customer.monthly_amount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">
                          <span className="font-medium">Payment Type:</span> {customer.payment_type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Information */}
            {customer.batteries && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Battery className="w-5 h-5" />
                    <span>Assigned Battery</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Serial Number:</span>
                      <p className="text-sm text-gray-600">{customer.batteries.serial_number}</p>
                    </div>
                    <div>
                      <span className="font-medium">Model:</span>
                      <p className="text-sm text-gray-600">{customer.batteries.model}</p>
                    </div>
                    <div>
                      <span className="font-medium">Capacity:</span>
                      <p className="text-sm text-gray-600">{customer.batteries.capacity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {customerTransactions.length} transaction(s) found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customerTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {customerTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{transaction.id}</p>
                            <p className="text-sm text-gray-600">{transaction.transaction_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{formatDate(transaction.transaction_date)}</p>
                        </div>
                        <Badge className={getStatusColor(transaction.payment_status)}>
                          {transaction.payment_status}
                        </Badge>
                      </div>
                    ))}
                    {customerTransactions.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        ... and {customerTransactions.length - 5} more transactions
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No transactions found for this customer.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Customer not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
