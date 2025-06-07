
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, ExternalLink } from 'lucide-react';
import AddBatteryModal from './AddBatteryModal';
import AssignBatteryModal from './AssignBatteryModal';
import ResponsiveBatteryCards from './ResponsiveBatteryCards';
import BatteryProfile from './BatteryProfile';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

interface BatteryTableProps {
  isAdmin: boolean;
}

const BatteryTable = ({ isAdmin }: BatteryTableProps) => {
  const { batteries, loading } = useBatteries();
  const { userRole } = useAuth();
  const [selectedBatteryId, setSelectedBatteryId] = useState<string | null>(null);

  const handleViewDetails = (batteryId: string) => {
    setSelectedBatteryId(batteryId);
  };

  const handleCloseDetails = () => {
    setSelectedBatteryId(null);
  };

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

  const getPartnerName = (battery: any) => {
    if (!battery.partner_id) return 'Unassigned';
    return battery.partner?.name || 'Unknown Partner';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a battery is selected, show its profile
  if (selectedBatteryId) {
    return (
      <BatteryProfile 
        batteryId={selectedBatteryId} 
        onBack={handleCloseDetails}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Battery Inventory' : 'My Batteries'}
          </h2>
          <p className="text-base lg:text-lg text-gray-600">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {isAdmin && <AddBatteryModal />}
          {isAdmin && <AssignBatteryModal />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{batteries.length}</div>
            <div className="text-sm lg:text-base text-gray-600">Total Batteries</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
              {batteries.filter(b => b.status === 'available').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
              {batteries.filter(b => b.status === 'assigned').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600">Assigned</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
              {batteries.filter(b => b.status === 'maintenance').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600">In Maintenance</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {batteries.length > 0 ? (
          <ResponsiveBatteryCards batteries={batteries} onViewDetails={handleViewDetails} />
        ) : (
          <Card className="border-2">
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-6 text-base lg:text-lg">
                No batteries found. {isAdmin ? 'Add your first battery to get started.' : 'No batteries have been assigned to you yet.'}
              </p>
              {isAdmin && <AddBatteryModal />}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Battery Inventory Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {batteries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Serial Number</TableHead>
                      <TableHead className="font-semibold">Model Name</TableHead>
                      <TableHead className="font-semibold">Model Number</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      {userRole === 'admin' && <TableHead className="font-semibold">Associated Partner</TableHead>}
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batteries.map((battery) => (
                      <TableRow key={battery.id} className="hover:bg-blue-50 transition-colors">
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handleViewDetails(battery.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 transition-colors"
                          >
                            {battery.serial_number}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {battery.model_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{battery.model}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(battery.status)}>
                            {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {userRole === 'admin' && (
                          <TableCell>
                            <span className={!battery.partner_id ? 'text-gray-500 italic' : 'font-medium'}>
                              {getPartnerName(battery)}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(battery.id)}
                              className="hover:bg-blue-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-gray-50">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6 text-lg">No batteries found. {isAdmin ? 'Add your first battery to get started.' : 'No batteries have been assigned to you yet.'}</p>
                {isAdmin && <AddBatteryModal />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BatteryTable;
