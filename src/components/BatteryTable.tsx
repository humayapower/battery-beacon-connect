
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, ExternalLink } from 'lucide-react';
import { getBatteryStatusColor } from '@/utils/statusColors';
import { getPartnerName } from '@/utils/formatters';
import AddBatteryModal from './AddBatteryModal';
import AssignBatteryModal from './AssignBatteryModal';
import ResponsiveBatteryCards from './ResponsiveBatteryCards';
import BatteryProfile from './BatteryProfile';
import CustomerProfile from './CustomerProfile';
import PartnerProfile from './PartnerProfile';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';

interface BatteryTableProps {
  isAdmin: boolean;
}

const BatteryTable = ({ isAdmin }: BatteryTableProps) => {
  const { batteries, loading } = useBatteries();
  const { userRole } = useAuth();
  const [selectedBatteryId, setSelectedBatteryId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const handleViewDetails = (batteryId: string) => {
    setSelectedBatteryId(batteryId);
  };

  const handleCloseDetails = () => {
    setSelectedBatteryId(null);
    setSelectedCustomerId(null);
    setSelectedPartnerId(null);
  };

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handlePartnerClick = useCallback((partnerId: string) => {
    setSelectedPartnerId(partnerId);
  }, []);

  // Memoize stats calculations for performance
  const batteryStats = useMemo(() => ({
    total: batteries.length,
    available: batteries.filter(b => b.status === 'available').length,
    assigned: batteries.filter(b => b.status === 'assigned').length,
    maintenance: batteries.filter(b => b.status === 'maintenance').length
  }), [batteries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If a customer is selected, show customer profile
  if (selectedCustomerId) {
    return (
      <CustomerProfile 
        customerId={selectedCustomerId} 
        onBack={handleCloseDetails}
        showBackButton={true}
      />
    );
  }

  // If a partner is selected, show partner profile
  if (selectedPartnerId) {
    return (
      <PartnerProfile 
        partnerId={selectedPartnerId} 
        onBack={handleCloseDetails}
        showBackButton={true}
      />
    );
  }

  // If a battery is selected, show its profile
  if (selectedBatteryId) {
    return (
      <BatteryProfile 
        batteryId={selectedBatteryId} 
        onBack={handleCloseDetails}
        showBackButton={true}
        onCustomerClick={handleCustomerClick}
        onPartnerClick={handlePartnerClick}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg lg:text-2xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
            {isAdmin ? 'Battery Inventory' : 'Batteries'}
          </h2>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {isAdmin && <AddBatteryModal />}
          {isAdmin && <AssignBatteryModal />}
        </div>
      </div>

      {/* Stats Cards - Clean and Elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-0.5">{batteryStats.total}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Batteries</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-green-600 dark:text-green-400 mb-0.5">
              {batteryStats.available}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Available</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
              {batteryStats.assigned}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Assigned</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-orange-600 dark:text-orange-400 mb-0.5">
              {batteryStats.maintenance}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">In Maintenance</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-base text-slate-900 dark:text-slate-100 font-medium">Battery Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {batteries.length > 0 ? (
            <>
              {/* Mobile List View */}
              <div className="block lg:hidden">
                <ResponsiveBatteryCards batteries={batteries} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
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
                            <Badge className={getBatteryStatusColor(battery.status)} variant="outline">
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
              </div>
            </>
          ) : (
            <div className="text-center py-12 px-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                No batteries found. {isAdmin ? 'Add your first battery to get started.' : 'No batteries have been assigned to you yet.'}
              </p>
              {isAdmin && <AddBatteryModal />}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatteryTable;
