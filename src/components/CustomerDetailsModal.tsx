
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Battery, Calendar, DollarSign, X } from 'lucide-react';
import { useCustomers, CustomerWithBattery } from '@/hooks/useCustomers';

interface CustomerDetailsModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal = ({ customerId, isOpen, onClose }: CustomerDetailsModalProps) => {
  const [customer, setCustomer] = useState<CustomerWithBattery | null>(null);
  const [loading, setLoading] = useState(false);
  const { getCustomerById } = useCustomers();

  useEffect(() => {
    if (customerId && isOpen) {
      fetchCustomerDetails();
    }
  }, [customerId, isOpen]);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const result = await getCustomerById(customerId);
      if (result.success) {
        setCustomer(result.data as CustomerWithBattery);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customer Details</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this customer.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Customer Overview */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="bg-blue-100 rounded-full p-6 text-blue-700">
                <span className="text-2xl font-bold">{customer.name?.charAt(0) || '?'}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                  {customer.customer_id && (
                    <span className="text-sm text-gray-500">ID: {customer.customer_id}</span>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {customer.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Payment Type:</dt>
                      <dd className="font-medium">
                        {customer.payment_type === 'emi' ? 'EMI' : 
                         customer.payment_type === 'monthly_rent' ? 'Monthly Rent' : 
                         customer.payment_type === 'one_time_purchase' ? 'One-time Purchase' : 'N/A'}
                      </dd>
                    </div>
                    {customer.monthly_amount && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Monthly Amount:</dt>
                        <dd className="font-medium">${customer.monthly_amount}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Join Date:</dt>
                      <dd className="font-medium">{formatDate(customer.join_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Last Payment:</dt>
                      <dd className="font-medium">{formatDate(customer.last_payment_date)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Battery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.batteries ? (
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Serial Number:</dt>
                        <dd className="font-medium">{customer.batteries.serial_number}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Model:</dt>
                        <dd className="font-medium">{customer.batteries.model}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Capacity:</dt>
                        <dd className="font-medium">{customer.batteries.capacity}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No battery assigned
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                Edit Customer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Customer not found or an error occurred.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsModal;
