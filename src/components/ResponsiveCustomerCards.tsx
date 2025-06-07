
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, User, Phone, ExternalLink } from 'lucide-react';
import { CustomerWithBattery } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';

interface ResponsiveCustomerCardsProps {
  customers: CustomerWithBattery[];
  onViewDetails: (customerId: string) => void;
}

const ResponsiveCustomerCards = ({ customers, onViewDetails }: ResponsiveCustomerCardsProps) => {
  const { userRole } = useAuth();

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const getPartnerName = (customer: CustomerWithBattery) => {
    if (!customer.partner_id) return 'Unassigned';
    return customer.partner?.name || 'Unknown Partner';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {customers.map((customer) => (
        <Card key={customer.id} className="hover:shadow-lg transition-all duration-200 border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <button
                  onClick={() => onViewDetails(customer.id)}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1 transition-colors"
                >
                  {customer.name}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <Badge className={getStatusColor(customer.status)}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm">
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePhoneCall(customer.phone)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{customer.phone}</span>
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Battery:</span>
                <Badge variant="outline" className="font-medium">
                  {customer.batteries?.serial_number || 'Unassigned'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Payment:</span>
                <Badge variant="outline" className="font-medium capitalize">
                  {customer.payment_type.replace('_', ' ')}
                </Badge>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Partner:</span>
                  <span className={`font-semibold text-xs ${!customer.partner_id ? 'text-gray-500 italic' : ''}`}>
                    {getPartnerName(customer)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-blue-50"
                onClick={() => onViewDetails(customer.id)}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1 hover:bg-gray-50">
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
