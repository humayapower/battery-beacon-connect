import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, User, Phone, Mail } from 'lucide-react';
import { CustomerWithBattery } from '@/hooks/useCustomers';

interface ResponsiveCustomerCardsProps {
  customers: CustomerWithBattery[];
  onViewDetails: (customerId: string) => void;
}

const ResponsiveCustomerCards = ({ customers, onViewDetails }: ResponsiveCustomerCardsProps) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <Card key={customer.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <button
                  onClick={() => onViewDetails(customer.id)}
                  className="font-semibold text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  {customer.name}
                </button>
              </div>
              <Badge className={getStatusColor(customer.status)}>
                {customer.status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Battery:</span>
                <span className="font-medium text-xs">
                  {customer.batteries?.serial_number || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Join Date:</span>
                <span className="font-medium">{formatDate(customer.join_date)}</span>
              </div>
              {customer.payment_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium capitalize">{customer.payment_type.replace('_', ' ')}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewDetails(customer.id)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponsiveCustomerCards;
