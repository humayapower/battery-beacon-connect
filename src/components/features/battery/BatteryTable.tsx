
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBatteryStatusColor } from '@/utils/statusColors';
import { getPartnerName } from '@/utils/formatters';
import { Battery } from 'lucide-react';
import AddBatteryModal from '../../modals/AddBatteryModal';
import AssignBatteryModal from '../../modals/AssignBatteryModal';
import ResponsiveBatteryCards from './ResponsiveBatteryCards';
import BatteryProfile from './BatteryProfile';
import CustomerProfile from '../customer/CustomerProfile';
import PartnerProfile from '../partner/PartnerProfile';
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
      <div className="flex items-center justify-center py-16">
        <div className="text-center glass-card p-8 rounded-2xl">
          <div className="pulse-loader w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">Loading batteries...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch the data</p>
        </div>
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            {isAdmin ? '⚡ Battery Inventory' : '🔋 My Batteries'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {isAdmin && <AddBatteryModal />}
          {isAdmin && <AssignBatteryModal />}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.total}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Batteries</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.available}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Available</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.assigned}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Assigned</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.maintenance}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">In Maintenance</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Battery className="w-5 h-5" />
            Battery Management
          </CardTitle>
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
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Battery className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                No Batteries Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base max-w-md mx-auto">
                {isAdmin ? 'Add your first battery to get started with inventory management.' : 'No batteries have been assigned to you yet. Contact your administrator.'}
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
