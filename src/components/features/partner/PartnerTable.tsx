
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone } from 'lucide-react';
import CreatePartnerModal from '../../modals/CreatePartnerModal';
import PartnerProfile from './PartnerProfile';
import { SearchAndFilters } from '../../shared/SearchAndFilters';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';

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
  }), [filteredPartners]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center glass-card p-8 rounded-2xl">
          <div className="pulse-loader w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">Loading partners...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            🤝 Business Partners
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.total}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Partners</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.active}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stats.suspended}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0 shadow-xl">
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
                    <TableRow>
                      <TableHead className="font-semibold">Partner Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Username</TableHead>
                      <TableHead className="font-semibold">Batteries</TableHead>
                      <TableHead className="font-semibold">Customers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <button
                            onClick={() => {
                              setSelectedPartnerId(partner.id);
                              setShowProfile(true);
                            }}
                            className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                          >
                            {partner.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          {partner.phone ? (
                            <button
                              onClick={() => window.open(`tel:${partner.phone}`, '_self')}
                              className="text-primary hover:text-primary/80 transition-colors flex items-center"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              {partner.phone}
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{partner.username}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {partner.battery_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
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
      </Card>
    </div>
  );
};

export default PartnerTable;
