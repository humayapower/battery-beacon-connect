import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, Phone } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import CustomerDetailsModal from './CustomerDetailsModal';
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

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedCustomerId(null);
    setIsDetailsModalOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Customers' : 'My Customers'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <AddCustomerModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.status === 'suspended').length}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Battery</TableHead>
                    {userRole === 'admin' && <TableHead>Associated Partner</TableHead>}
                    <TableHead>Actions</TableHead>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No customers found. Add your first customer to get started.</p>
              <AddCustomerModal />
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerDetailsModal
        customerId={selectedCustomerId}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default CustomerTable;
