
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">Partners</h2>
          <p className="text-base lg:text-lg text-muted-foreground">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">{stats.total}</div>
            <div className="text-sm lg:text-base text-muted-foreground">Total Partners</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm lg:text-base text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{stats.suspended}</div>
            <div className="text-sm lg:text-base text-muted-foreground">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Partner Management</CardTitle>
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
            <div className="text-center py-12 px-6">
              <p className="text-muted-foreground mb-6 text-lg">
                {searchTerm || Object.keys(filters).length > 0 
                  ? "No partners found matching your search criteria." 
                  : "No partners found. Add your first partner to get started."
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
