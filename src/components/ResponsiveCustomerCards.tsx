
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, User, Phone } from 'lucide-react';
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
                  className="font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                >
                  {customer.name}
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {customer.phone && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePhoneCall(customer.phone)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </button>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Battery:</span>
                <Badge variant="outline" className="text-xs">
                  {customer.batteries?.serial_number || 'Unassigned'}
                </Badge>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner:</span>
                  <span className={`font-medium text-xs ${!customer.partner_id ? 'text-gray-500 italic' : ''}`}>
                    {getPartnerName(customer)}
                  </span>
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
