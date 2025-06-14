
// import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Battery } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getBatteryStatusColor } from '@/utils/statusColors';
import { getPartnerName } from '@/utils/formatters';

interface ResponsiveBatteryCardsProps {
  batteries: Battery[];
  onViewDetails?: (batteryId: string) => void;
}

const ResponsiveBatteryCards = ({ batteries, onViewDetails }: ResponsiveBatteryCardsProps) => {
  const { userRole } = useAuth();


  const handleViewDetails = (batteryId: string) => {
    if (onViewDetails) {
      onViewDetails(batteryId);
    }
  };

  return (
    <div className="space-y-2">
      {batteries.map((battery, index) => (
        <div 
          key={battery.id} 
          className={`glass-card hover:shadow-lg transition-all duration-300 border-0 ${
            index === 0 ? 'rounded-t-2xl' : ''
          } ${index === batteries.length - 1 ? 'rounded-b-2xl' : ''} hover:scale-[1.02]`}
        >
          <div className="p-4 sm:p-5">
            {/* Enhanced Three-Column Layout */}
            <div className="flex items-center justify-between gap-3">
              {/* Column 1: Serial, Model */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleViewDetails(battery.id)}
                  className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-left block truncate"
                  title={battery.serial_number}
                >
                  {battery.serial_number}
                </button>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate font-medium">
                  {battery.model_name || 'N/A'}
                </div>
              </div>
              
              {/* Column 2: Model Number, Partner/Capacity */}
              <div className="flex-1 min-w-0 text-center">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono truncate bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                  {battery.model}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">
                  {userRole === 'admin' ? (
                    <span className={!battery.partner_id ? 'italic text-gray-400 dark:text-gray-500' : 'font-medium'}>
                      {getPartnerName(battery)}
                    </span>
                  ) : (
                    <span className="font-medium">{battery.capacity}</span>
                  )}
                </div>
              </div>
              
              {/* Column 3: Enhanced Status Badge */}
              <div className="flex-shrink-0">
                <Badge 
                  className={`${getBatteryStatusColor(battery.status)} text-xs sm:text-sm px-3 py-1.5 font-semibold border-0 shadow-sm`}
                >
                  {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResponsiveBatteryCards;
