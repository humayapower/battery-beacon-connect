
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Battery as BatteryIcon, ExternalLink } from 'lucide-react';
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
      {batteries.map((battery) => (
        <Card key={battery.id} className="hover:shadow-md transition-all duration-200 border dark:border-gray-700 dark:bg-gray-800/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                <BatteryIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <button
                  onClick={() => handleViewDetails(battery.id)}
                  className="font-semibold text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors truncate"
                >
                  {battery.serial_number}
                  <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                </button>
              </div>
              <Badge className={getStatusColor(battery.status)}>
                {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Model:</span>
                <Badge variant="outline" className="text-xs font-medium dark:border-gray-600 dark:text-gray-300">
                  {battery.model_name || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Type:</span>
                <span className="font-semibold truncate ml-1 dark:text-gray-200">{battery.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Capacity:</span>
                <span className="font-semibold dark:text-gray-200">{battery.capacity}</span>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Partner:</span>
                  <span className={`font-semibold text-xs truncate ml-1 ${!battery.partner_id ? 'text-gray-500 dark:text-gray-400 italic' : 'dark:text-gray-200'}`}>
                    {getPartnerName(battery)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-1.5 sm:space-x-2 mt-3 sm:mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs"
                onClick={() => handleViewDetails(battery.id)}
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

export default ResponsiveBatteryCards;
