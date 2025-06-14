import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getStatusLabel } from '@/utils/statusColors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Battery, Users, Plus } from 'lucide-react';
import AddBatteryModal from '../../modals/AddBatteryModal';
import BatteryDetailsModal from '../../modals/BatteryDetailsModal';
import BatteryProfile from './BatteryProfile';
import ResponsiveBatteryCards from './ResponsiveBatteryCards';
import { SearchAndFilters } from '../../shared/SearchAndFilters';
import { useBatteries } from '@/hooks/useBatteries';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { AnimatedCard, FloatingActionButton } from '@/components/ui/animated-components';

interface BatteryTableProps {
  isAdmin: boolean;
}

const BatteryTable = ({ isAdmin }: BatteryTableProps) => {
  const { batteries, loading } = useBatteries();
  const { userRole } = useAuth();
  const [selectedBatteryId, setSelectedBatteryId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "in_repair", label: "In Repair" },
        { value: "lost", label: "Lost" },
        { value: "decommissioned", label: "Decommissioned" },
      ]
    }
  ];

  const filteredBatteries = useMemo(() => {
    return batteries.filter(battery => {
      const matchesSearch = !searchTerm || 
        battery.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filters.status || battery.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [batteries, searchTerm, filters]);

  const handleViewDetails = (batteryId: string) => {
    setSelectedBatteryId(batteryId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedBatteryId(null);
    setShowProfile(false);
  };

  const getPartnerName = (battery: any) => {
    if (!battery.partner_id) return 'Unassigned';
    return battery.partner?.name || 'Unknown Partner';
  };

  const batteryStats = useMemo(() => ({
    total: filteredBatteries.length,
    active: filteredBatteries.filter(b => b.status === 'active').length,
    inactive: filteredBatteries.filter(b => b.status === 'inactive').length,
    inRepair: filteredBatteries.filter(b => b.status === 'in_repair').length,
    lost: filteredBatteries.filter(b => b.status === 'lost').length,
    decommissioned: filteredBatteries.filter(b => b.status === 'decommissioned').length,
  }), [filteredBatteries]);

  if (loading) {
    return <PageSkeleton type="table" />;
  }

  if (showProfile && selectedBatteryId) {
    return (
      <BatteryProfile 
        batteryId={selectedBatteryId} 
        onBack={() => {
          setSelectedBatteryId(null);
          setShowProfile(false);
        }}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🔋 Battery Inventory
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your battery inventory and track their status
          </p>
        </div>
        <AddBatteryModal />
      </div>

      <SearchAndFilters
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search batteries by serial number or model..."
      />

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Battery className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.total}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Battery className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.active}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Battery className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{batteryStats.inRepair}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">In Repair</div>
          </CardContent>
        </Card>
      </div>

      <AnimatedCard className="glass-card border-0 shadow-xl" hoverable={false}>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Battery className="w-5 h-5" />
            Battery Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBatteries.length > 0 ? (
            <>
              {/* Mobile List View */}
              <div className="block lg:hidden">
                <ResponsiveBatteryCards batteries={filteredBatteries} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Serial Number</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Model</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer</TableHead>
                          {userRole === 'admin' && <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Partner</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBatteries.map((battery) => (
                          <TableRow key={battery.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                            <TableCell>
                              <button
                                onClick={() => handleViewDetails(battery.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
                              >
                                {battery.serial_number}
                              </button>
                            </TableCell>
                            <TableCell className="font-medium">{battery.model}</TableCell>
                            <TableCell>
                              <Badge 
                                className={getStatusColor(battery.status)}
                                variant="outline"
                              >
                                {getStatusLabel(battery.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {battery.customer ? (
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {battery.customer.name}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>
                            {userRole === 'admin' && (
                              <TableCell>
                                {battery.partner ? (
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {battery.partner.name}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400 italic">
                                    Unassigned
                                  </span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Battery className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {searchTerm || Object.keys(filters).length > 0 ? "No Batteries Found" : "No Batteries Yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0 
                  ? "No batteries found matching your search criteria. Try adjusting your filters." 
                  : "Add your first battery to get started with inventory management."
                }
              </p>
              {(!searchTerm && Object.keys(filters).length === 0) && <AddBatteryModal />}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Floating Action Button for Adding Batteries */}
      <FloatingActionButton
        icon={<Plus className="w-6 h-6" />}
        onClick={() => {
          // This will trigger the AddBatteryModal
          (document.querySelector('[data-add-battery-trigger]') as HTMLElement)?.click();
        }}
        ariaLabel="Add new battery"
      />
    </div>
  );
};

export default BatteryTable;
