import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Eye, Phone } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import CustomerDetailsModal from './CustomerDetailsModal';
import CustomerProfile from './CustomerProfile';
import ResponsiveCustomerCards from './ResponsiveCustomerCards';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{isAdmin ? 'All Customers' : 'My Customers'}</h2>
          <p className="text-sm lg:text-base text-gray-600">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <AddCustomerModal />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-0">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{customers.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-4 sm:mx-0">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-4">
                <ResponsiveCustomerCards customers={customers} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Battery</TableHead>
                          {userRole === 'admin' && <TableHead>Associated Partner</TableHead>}
                          <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-gray-50">
                            <TableCell>
                              <button
                                onClick={() => handleViewDetails(customer.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                              >
                                {customer.name}
                              </button>
                            </TableCell>
                            <TableCell>
                              {customer.phone ? (
                                <button
                                  onClick={() => handlePhoneCall(customer.phone)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                                >
                                  <Phone className="w-4 h-4" />
                                  <span>{customer.phone}</span>
                                </button>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {customer.batteries?.serial_number || 'Unassigned'}
                              </Badge>
                            </TableCell>
                            {userRole === 'admin' && (
                              <TableCell>
                                <span className={!customer.partner_id ? 'text-gray-500 italic' : ''}>
                                  {getPartnerName(customer)}
                                </span>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(customer.id)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-gray-600 mb-4">No customers found. Add your first customer to get started.</p>
              <AddCustomerModal />
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
