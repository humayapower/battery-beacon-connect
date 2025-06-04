
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Battery as BatteryIcon } from 'lucide-react';
import { Battery } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ResponsiveBatteryCardsProps {
  batteries: Battery[];
}

const ResponsiveBatteryCards = ({ batteries }: ResponsiveBatteryCardsProps) => {
  const { userRole } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartnerName = (battery: Battery) => {
    // This will need to be enhanced when we have partner data joined
    if (!battery.partner_id) return 'Unassigned';
    return 'Partner Name'; // Placeholder - will be replaced with actual partner name
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {batteries.map((battery) => (
        <Card key={battery.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BatteryIcon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-sm">{battery.serial_number}</span>
              </div>
              <Badge className={getStatusColor(battery.status)}>
                {battery.status}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model Name:</span>
                <Badge variant="outline">
                  {battery.model_name || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model Number:</span>
                <span className="font-medium">{battery.model}</span>
              </div>
              {userRole === 'admin' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Partner:</span>
                  <span className={`font-medium ${!battery.partner_id ? 'text-gray-500 italic' : ''}`}>
                    {getPartnerName(battery)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
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

export default ResponsiveBatteryCards;
