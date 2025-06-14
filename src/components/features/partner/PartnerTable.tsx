
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Users, Plus } from 'lucide-react';
import CreatePartnerModal from '../../modals/CreatePartnerModal';
import PartnerProfile from './PartnerProfile';
import { SearchAndFilters } from '../../shared/SearchAndFilters';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { AnimatedCard, FloatingActionButton } from '@/components/ui/animated-components';

const PartnerTable = () => {
  const { partners, loading } = useOptimizedPartners();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
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
        { value: "suspended", label: "Suspended" },
      ]
    }
  ];

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = !searchTerm || 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filters.status || partner.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchTerm, filters]);

  const stats = useMemo(() => ({
    total: filteredPartners.length,
    active: filteredPartners.filter(p => p.status === 'active').length,
    suspended: filteredPartners.filter(p => p.status === 'suspended').length,
    totalBatteries: filteredPartners.reduce((sum, p) => sum + (p.battery_count || 0), 0),
  }), [filteredPartners]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return <PageSkeleton type="table" />;
  }

  if (showProfile && selectedPartnerId) {
    return (
      <PartnerProfile 
        partnerId={selectedPartnerId} 
        onBack={() => {
          setSelectedPartnerId(null);
          setShowProfile(false);
        }}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🤝 Business Partners
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Manage your business partners and their operations
          </p>
        </div>
        <CreatePartnerModal />
      </div>

      <SearchAndFilters
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search partners by name, phone, or username..."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatNumber(stats.total)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Partners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{formatNumber(stats.active)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Partners</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{formatNumber(stats.suspended)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{formatNumber(stats.totalBatteries)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Batteries</div>
          </CardContent>
        </Card>
      </div>

      <AnimatedCard className="glass-card border-0 shadow-xl mx-4 sm:mx-0" hoverable={false}>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Partner Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredPartners.length > 0 ? (
            <ScrollArea className="w-full">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Partner Name</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Username</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Batteries</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedPartnerId(partner.id);
                              setShowProfile(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline transition-colors"
                          >
                            {partner.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          {partner.phone ? (
                            <button
                              onClick={() => window.open(`tel:${partner.phone}`, '_self')}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              {partner.phone}
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{partner.username}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600">
                            {partner.battery_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600">
                            {partner.customer_count || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {searchTerm || Object.keys(filters).length > 0 ? "No Partners Found" : "No Partners Yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0 
                  ? "No partners found matching your search criteria. Try adjusting your filters." 
                  : "Add your first partner to get started with partner management."
                }
              </p>
              {(!searchTerm && Object.keys(filters).length === 0) && <CreatePartnerModal />}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Floating Action Button for Adding Partners */}
      <FloatingActionButton
        icon={<Plus className="w-6 h-6" />}
        onClick={() => {
          // This will trigger the CreatePartnerModal
          (document.querySelector('[data-add-partner-trigger]') as HTMLElement)?.click();
        }}
        ariaLabel="Add new partner"
      />
    </div>
  );
};

export default PartnerTable;
