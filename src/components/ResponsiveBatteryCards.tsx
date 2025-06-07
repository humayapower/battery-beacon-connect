
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'faulty':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'returned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {batteries.map((battery) => (
        <Card key={battery.id} className="hover:shadow-lg transition-all duration-200 border-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2 flex-1">
                <BatteryIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <button
                  onClick={() => handleViewDetails(battery.id)}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                >
                  {battery.serial_number}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <Badge className={getStatusColor(battery.status)}>
                {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Model Name:</span>
                <Badge variant="outline" className="font-medium">
                  {battery.model_name || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Model Number:</span>
                <span className="font-semibold">{battery.model}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Capacity:</span>
                <span className="font-semibold">{battery.capacity}</span>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Partner:</span>
                  <span className={`font-semibold text-xs ${!battery.partner_id ? 'text-gray-500 italic' : ''}`}>
                    {getPartnerName(battery)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 hover:bg-blue-50"
                onClick={() => handleViewDetails(battery.id)}
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

export default ResponsiveBatteryCards;
