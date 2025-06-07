import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Eye, Phone, ExternalLink } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import CustomerProfile from './CustomerProfile';
import ResponsiveCustomerCards from './ResponsiveCustomerCards';
import { SearchAndFilters } from './SearchAndFilters';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerTableProps {
  isAdmin: boolean;
}

const CustomerTable = ({ isAdmin }: CustomerTableProps) => {
  const { customers, loading } = useCustomers();
  const { userRole } = useAuth();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
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
        { value: "suspended", label: "Suspended" },
      ]
    },
    {
      key: "payment_type",
      label: "Payment Type",
      options: [
        { value: "emi", label: "EMI" },
        { value: "monthly_rent", label: "Monthly Rent" },
        { value: "one_time_purchase", label: "One Time Purchase" },
      ]
    }
  ];

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = !searchTerm || 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.batteries?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = !filters.status || customer.status === filters.status;

      // Payment type filter
      const matchesPaymentType = !filters.payment_type || customer.payment_type === filters.payment_type;

      return matchesSearch && matchesStatus && matchesPaymentType;
    });
  }, [customers, searchTerm, filters]);

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedCustomerId(null);
    setShowProfile(false);
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const getPartnerName = (customer: any) => {
    if (!customer.partner_id) return 'Unassigned';
    return customer.partner?.name || 'Unknown Partner';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If showing profile, render the customer profile component
  if (showProfile && selectedCustomerId) {
    return (
      <CustomerProfile 
        customerId={selectedCustomerId} 
        onBack={handleCloseProfile}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">
            {isAdmin ? 'Customer Directory' : 'Customers'}
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <AddCustomerModal />
      </div>

      <SearchAndFilters
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search customers by name, phone, email, or battery serial..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">{filteredCustomers.length}</div>
            <div className="text-sm lg:text-base text-muted-foreground">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
              {filteredCustomers.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm lg:text-base text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">
              {filteredCustomers.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-sm lg:text-base text-muted-foreground">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Customer Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-6">
                <ResponsiveCustomerCards customers={filteredCustomers} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Customer Name</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Battery Serial</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          {userRole === 'admin' && <TableHead className="font-semibold">Associated Partner</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <button
                                onClick={() => handleViewDetails(customer.id)}
                                className="text-primary hover:text-primary/80 font-semibold hover:underline flex items-center gap-1 transition-colors"
                              >
                                {customer.name}
                              </button>
                            </TableCell>
                            <TableCell>
                              {customer.phone ? (
                                <button
                                  onClick={() => handlePhoneCall(customer.phone)}
                                  className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                                >
                                  <span className="font-medium">{customer.phone}</span>
                                </button>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">
                                {customer.batteries?.serial_number || 'Unassigned'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(customer.status)}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </Badge>
                            </TableCell>
                            {userRole === 'admin' && (
                              <TableCell>
                                <span className={!customer.partner_id ? 'text-muted-foreground italic' : 'font-medium'}>
                                  {getPartnerName(customer)}
                                </span>
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
            <div className="text-center py-12 px-6">
              <p className="text-muted-foreground mb-6 text-lg">
                {searchTerm || Object.keys(filters).length > 0 
                  ? "No customers found matching your search criteria." 
                  : "No customers found. Add your first customer to get started."
                }
              </p>
              {(!searchTerm && Object.keys(filters).length === 0) && <AddCustomerModal />}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default CustomerTable;
