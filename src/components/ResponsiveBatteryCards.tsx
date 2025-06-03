
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Battery as BatteryIcon } from 'lucide-react';
import { Battery } from '@/types';

interface ResponsiveBatteryCardsProps {
  batteries: Battery[];
}

const ResponsiveBatteryCards = ({ batteries }: ResponsiveBatteryCardsProps) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{battery.model}</span>
              </div>
              {battery.model_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{battery.model_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium">{battery.capacity}</span>
              </div>
              {battery.voltage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Voltage:</span>
                  <span className="font-medium">{battery.voltage}V</span>
                </div>
              )}
              {battery.imei_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IMEI:</span>
                  <span className="font-medium text-xs">{battery.imei_number}</span>
                </div>
              )}
              {battery.warranty_period && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Warranty:</span>
                  <span className="font-medium">{battery.warranty_period} months</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Mfg. Date:</span>
                <span className="font-medium">{formatDate(battery.manufacturing_date)}</span>
              </div>
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
