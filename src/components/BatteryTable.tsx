
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
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAdmin ? 'Battery Inventory' : 'Batteries'}
          </h2>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {isAdmin && <AddBatteryModal />}
          {isAdmin && <AssignBatteryModal />}
        </div>
      </div>

      {/* Redesigned Stats Cards - Simple and Classic */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{batteries.length}</div>
            <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">Total Batteries</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {batteries.filter(b => b.status === 'available').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">Available</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {batteries.filter(b => b.status === 'assigned').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">Assigned</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200 dark:border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {batteries.filter(b => b.status === 'maintenance').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">In Maintenance</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {batteries.length > 0 ? (
          <ResponsiveBatteryCards batteries={batteries} onViewDetails={handleViewDetails} />
        ) : (
          <Card className="border-2 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base lg:text-lg">
                No batteries found. {isAdmin ? 'Add your first battery to get started.' : 'No batteries have been assigned to you yet.'}
              </p>
              {isAdmin && <AddBatteryModal />}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="border-2 shadow-lg dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Battery Inventory Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {batteries.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Serial Number</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Model Name</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Model Number</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                      {userRole === 'admin' && <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Associated Partner</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batteries.map((battery) => (
                      <TableRow key={battery.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handleViewDetails(battery.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
                          >
                            {battery.serial_number}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium dark:border-gray-600 dark:text-gray-300">
                            {battery.model_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{battery.model}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(battery.status)}>
                            {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {userRole === 'admin' && (
                          <TableCell>
                            <span className={!battery.partner_id ? 'text-gray-500 dark:text-gray-400 italic' : 'font-medium text-gray-900 dark:text-gray-100'}>
                              {getPartnerName(battery)}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">No batteries found. {isAdmin ? 'Add your first battery to get started.' : 'No batteries have been assigned to you yet.'}</p>
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
