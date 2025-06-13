import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPaymentTypeColor, getPaymentTypeLabel } from '@/utils/statusColors';
import { usePhoneCall } from '@/hooks/usePhoneCall';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Edit, Eye, Phone, ExternalLink } from 'lucide-react';
import AddCustomerModal from '../../modals/AddCustomerModal';
import CustomerDetailsModal from '../../modals/CustomerDetailsModal';
import CustomerProfile from './CustomerProfile';
import ResponsiveCustomerCards from './ResponsiveCustomerCards';
import { SearchAndFilters } from '../../shared/SearchAndFilters';
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
  
  const handlePhoneCall = usePhoneCall();

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


  const getPartnerName = (customer: any) => {
    if (!customer.partner_id) return 'Unassigned';
    return customer.partner?.name || 'Unknown Partner';
  };

  // Memoize filter options to prevent unnecessary re-renders
  const memoizedFilterOptions = useMemo(() => filterOptions, []);

  // Memoize customer stats for performance
  const customerStats = useMemo(() => ({
    total: filteredCustomers.length,
    emi: filteredCustomers.filter(c => c.payment_type === 'emi').length,
    rental: filteredCustomers.filter(c => c.payment_type === 'monthly_rent').length
  }), [filteredCustomers]);

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
          <h2 className="text-lg lg:text-2xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
            {isAdmin ? 'Customer Directory' : 'Customers'}
          </h2>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <AddCustomerModal />
      </div>

      <SearchAndFilters
        onSearchChange={setSearchTerm}
        onFilterChange={setFilters}
        filterOptions={memoizedFilterOptions}
        placeholder="Search customers by name, phone, email, or battery serial..."
      />

      {/* Stats Cards - Clean and Elegant */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-0.5">{customerStats.total}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-green-600 dark:text-green-400 mb-0.5">
              {customerStats.emi}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">EMI Customers</div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-lg lg:text-xl font-semibold text-purple-600 dark:text-purple-400 mb-0.5">
              {customerStats.rental}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Rental Customers</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-base text-slate-900 dark:text-slate-100 font-medium">Customer Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length > 0 ? (
            <>
              {/* Mobile List View */}
              <div className="block lg:hidden">
                <ResponsiveCustomerCards customers={filteredCustomers} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Customer Name</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Phone</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Battery Serial</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Payment Type</TableHead>
                          {userRole === 'admin' && <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Associated Partner</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                            <TableCell>
                              <button
                                onClick={() => handleViewDetails(customer.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
                              >
                                {customer.name}
                              </button>
                            </TableCell>
                            <TableCell>
                              {customer.phone ? (
                                <button
                                  onClick={() => handlePhoneCall(customer.phone)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                  <span className="font-medium">{customer.phone}</span>
                                </button>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium dark:border-gray-600 dark:text-gray-300">
                                {customer.batteries?.serial_number || 'Unassigned'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPaymentTypeColor(customer.payment_type)} variant="outline">
                                {getPaymentTypeLabel(customer.payment_type)}
                              </Badge>
                            </TableCell>
                            {userRole === 'admin' && (
                              <TableCell>
                                <span className={!customer.partner_id ? 'text-gray-500 dark:text-gray-400 italic' : 'font-medium text-gray-900 dark:text-gray-100'}>
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
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
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
