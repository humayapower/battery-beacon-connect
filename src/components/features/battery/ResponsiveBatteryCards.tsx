
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
    <div className="space-y-1">
      {batteries.map((battery, index) => (
        <div 
          key={battery.id} 
          className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
            index === 0 ? 'rounded-t-lg' : ''
          } ${index === batteries.length - 1 ? 'rounded-b-lg' : 'border-b-0'}`}
        >
          <div className="p-4">
            {/* Compact Three-Column Layout */}
            <div className="flex items-center justify-between gap-2">
              {/* Column 1: Serial, Model */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleViewDetails(battery.id)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors text-left block truncate"
                  title={battery.serial_number}
                >
                  {battery.serial_number}
                </button>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {battery.model_name || 'N/A'}
                </div>
              </div>
              
              {/* Column 2: Model Number, Partner/Capacity */}
              <div className="flex-1 min-w-0 text-center">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                  {battery.model}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {userRole === 'admin' ? (
                    <span className={!battery.partner_id ? 'italic text-slate-400' : ''}>
                      {getPartnerName(battery)}
                    </span>
                  ) : (
                    battery.capacity
                  )}
                </div>
              </div>
              
              {/* Column 3: Status Badge */}
              <div className="flex-shrink-0">
                <Badge 
                  className={`${getBatteryStatusColor(battery.status)} text-xs px-2 py-1 font-medium`}
                  variant="outline"
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
