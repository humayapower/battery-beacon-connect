
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Battery } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ResponsiveBatteryCardsProps {
  batteries: Battery[];
  onViewDetails?: (batteryId: string) => void;
}

const ResponsiveBatteryCards = ({ batteries, onViewDetails }: ResponsiveBatteryCardsProps) => {
  const { userRole } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'faulty':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'returned':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getPartnerName = (battery: Battery) => {
    if (!battery.partner_id) return 'Unassigned';
    return battery.partner?.name || 'Unknown Partner';
  };

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
                  className={`${getStatusColor(battery.status)} text-xs px-2 py-1 font-medium`}
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
