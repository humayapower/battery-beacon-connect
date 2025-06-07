
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Phone, ExternalLink } from 'lucide-react';
import CreatePartnerModal from './CreatePartnerModal';
import EditPartnerModal from './EditPartnerModal';
import DeletePartnerModal from './DeletePartnerModal';
import PartnerProfile from './PartnerProfile';
import { SearchAndFilters } from './SearchAndFilters';
import { usePartners } from '@/hooks/usePartners';

const PartnerTable = () => {
  const { partners, loading } = usePartners();
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
      // Search filter
      const matchesSearch = !searchTerm || 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.business_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !filters.status || partner.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchTerm, filters]);

  const handleViewProfile = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedPartnerId(null);
    setShowProfile(false);
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewAddress = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  // Helper function to find partner by ID
  const findPartnerById = (partnerId: string) => {
    return partners.find(partner => partner.id === partnerId);
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If showing profile, render the partner profile component
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
        placeholder="Search partners by name, phone, email, or business name..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">{filteredPartners.length}</div>
            <div className="text-sm lg:text-base text-muted-foreground">Total Partners</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
              {filteredPartners.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm lg:text-base text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">
              {filteredPartners.filter(p => p.status === 'suspended').length}
            </div>
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
                      <TableHead className="font-semibold">Business Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <button
                            onClick={() => handleViewProfile(partner.id)}
                            className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                          >
                            {partner.name}
                          </button>
                        </TableCell>
                        <TableCell>{partner.business_name || 'N/A'}</TableCell>
                        <TableCell>
                          {partner.phone ? (
                            <button
                              onClick={() => handlePhoneCall(partner.phone)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              {partner.phone}
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>{partner.address || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(partner.status)}>
                            {partner.status ? (partner.status.charAt(0).toUpperCase() + partner.status.slice(1)) : 'Unknown'}
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
