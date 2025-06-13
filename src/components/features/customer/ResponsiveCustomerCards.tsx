
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, User, Building } from 'lucide-react';
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

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'monthly_rent':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      case 'one_time_purchase':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'EMI';
      case 'monthly_rent':
        return 'Rental';
      case 'one_time_purchase':
        return 'Purchase';
      default:
        return paymentType;
    }
  };

  return (
    <div className="space-y-2">
      {customers.map((customer, index) => (
        <div 
          key={customer.id} 
          className={`glass-card hover:shadow-lg transition-all duration-300 border-0 ${
            index === 0 ? 'rounded-t-2xl' : ''
          } ${index === customers.length - 1 ? 'rounded-b-2xl' : ''} hover:scale-[1.02]`}
        >
          <div className="p-4 sm:p-5">
            {/* Enhanced Three-Column Layout */}
            <div className="flex items-center justify-between gap-3">
              {/* Column 1: Name, Phone */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewDetails(customer.id)}
                  className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-left block truncate"
                  title={customer.name}
                >
                  👤 {customer.name}
                </button>
                {customer.phone ? (
                  <button
                    onClick={() => handlePhoneCall(customer.phone)}
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg"
                  >
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </button>
                ) : (
                  <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 flex items-center gap-2 mt-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                    <Phone className="w-3 h-3" />
                    N/A
                  </span>
                )}
              </div>
              
              {/* Column 2: Battery, Partner */}
              <div className="flex-1 min-w-0 text-center">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono truncate bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg mb-1">
                  {customer.batteries?.serial_number || 'Unassigned'}
                </div>
                {userRole === 'admin' && (
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    <span className={!customer.partner_id ? 'italic text-gray-400 dark:text-gray-500' : 'font-medium'}>
                      {getPartnerName(customer)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Column 3: Enhanced Payment Badge */}
              <div className="flex-shrink-0">
                <Badge 
                  className={`${getPaymentTypeColor(customer.payment_type)} text-xs sm:text-sm px-3 py-1.5 font-semibold border-0 shadow-sm`}
                >
                  {getPaymentTypeLabel(customer.payment_type)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveCustomerCards;
