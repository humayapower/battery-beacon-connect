
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
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
      {customers.map((customer) => (
        <Card key={customer.id} className="hover:shadow-md transition-all duration-200 border dark:border-gray-700 dark:bg-gray-800/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <button
                  onClick={() => onViewDetails(customer.id)}
                  className="font-semibold text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate flex items-center gap-1 transition-colors"
                >
                  {customer.name}
                  <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                </button>
              </div>
              <Badge className={getStatusColor(customer.status)}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2 text-xs">
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePhoneCall(customer.phone)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="font-medium text-xs">{customer.phone}</span>
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Battery:</span>
                <Badge variant="outline" className="text-xs font-medium dark:border-gray-600 dark:text-gray-300">
                  {customer.batteries?.serial_number || 'Unassigned'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Payment:</span>
                <Badge variant="outline" className="text-xs font-medium capitalize dark:border-gray-600 dark:text-gray-300">
                  {customer.payment_type.replace('_', ' ')}
                </Badge>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Partner:</span>
                  <span className={`font-semibold text-xs truncate ml-1 ${!customer.partner_id ? 'text-gray-500 dark:text-gray-400 italic' : 'dark:text-gray-200'}`}>
                    {getPartnerName(customer)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-1.5 sm:space-x-2 mt-3 sm:mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs"
                onClick={() => onViewDetails(customer.id)}
              >
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs">
                <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
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
