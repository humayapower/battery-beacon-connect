
import React, { useState } from 'react';
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Customer Directory' : 'Customers'}
          </h2>
          <p className="text-base lg:text-lg text-gray-600">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <AddCustomerModal />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{customers.length}</div>
            <div className="text-sm lg:text-base text-gray-600">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">
              {customers.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-sm lg:text-base text-gray-600">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl">Customer Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-6">
                <ResponsiveCustomerCards customers={customers} onViewDetails={handleViewDetails} />
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <ScrollArea className="w-full">
                  <div className="min-w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-semibold">Customer Name</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Battery Serial</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          {userRole === 'admin' && <TableHead className="font-semibold">Associated Partner</TableHead>}
                          {/* <TableHead className="font-semibold w-[150px]">Actions</TableHead> */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id} className="hover:bg-blue-50 transition-colors">
                            <TableCell>
                              <button
                                onClick={() => handleViewDetails(customer.id)}
                                className="text-black-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 transition-colors"
                              >
                                {customer.name}
                                {/* <ExternalLink className="w-3 h-3" /> */}
                              </button>
                            </TableCell>
                            <TableCell>
                              {customer.phone ? (
                                <button
                                  onClick={() => handlePhoneCall(customer.phone)}
                                  className="flex items-center space-x-1 text-black-600 hover:text-blue-800 transition-colors"
                                >
                                  {/* <Phone className="w-4 h-4" /> */}
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
                                <span className={!customer.partner_id ? 'text-gray-500 italic' : 'font-medium'}>
                                  {getPartnerName(customer)}
                                </span>
                              </TableCell>
                            )}
                            {/* <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewDetails(customer.id)}
                                  className="hover:bg-blue-50"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell> */}
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
              <p className="text-gray-600 mb-6 text-lg">No customers found. Add your first customer to get started.</p>
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
