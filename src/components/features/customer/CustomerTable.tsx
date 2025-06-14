
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPaymentTypeColor, getPaymentTypeLabel } from '@/utils/statusColors';
import { usePhoneCall } from '@/hooks/usePhoneCall';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, CreditCard, Receipt, Plus } from 'lucide-react';
import AddCustomerModal from '../../modals/AddCustomerModal';
import CustomerDetailsModal from '../../modals/CustomerDetailsModal';
import CustomerProfile from './CustomerProfile';
import ResponsiveCustomerCards from './ResponsiveCustomerCards';
import { SearchAndFilters } from '../../shared/SearchAndFilters';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { AnimatedCard, FloatingActionButton } from '@/components/ui/animated-components';

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
    return <PageSkeleton type="table" />;
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAdmin ? '👥 Customer Directory' : '👤 My Customers'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{customerStats.total}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <CreditCard className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{customerStats.emi}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">EMI</div>
          </CardContent>
        </Card>
        <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
          <CardContent className="p-2 sm:p-4 lg:p-6 text-center">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
              <Receipt className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{customerStats.rental}</div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Rental</div>
          </CardContent>
        </Card>
      </div>

      <AnimatedCard className="glass-card border-0 shadow-xl" hoverable={false}>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Management
          </CardTitle>
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
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {searchTerm || Object.keys(filters).length > 0 ? "No Customers Found" : "No Customers Yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0 
                  ? "No customers found matching your search criteria. Try adjusting your filters." 
                  : "Add your first customer to get started with customer management."
                }
              </p>
              {(!searchTerm && Object.keys(filters).length === 0) && <AddCustomerModal />}
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Floating Action Button for Adding Customers */}
      <FloatingActionButton
        icon={<Plus className="w-6 h-6" />}
        onClick={() => {
          // This will trigger the AddCustomerModal
          document.querySelector('[data-add-customer-trigger]')?.click();
        }}
        ariaLabel="Add new customer"
      />

      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default CustomerTable;
