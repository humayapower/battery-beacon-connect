
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, CreditCard } from 'lucide-react';

interface CustomerTableProps {
  isAdmin: boolean;
}

const CustomerTable = ({ isAdmin }: CustomerTableProps) => {
  const customers = [
    { id: "C001", name: "John Smith", email: "john@email.com", phone: "+1-555-0123", partner: "TechCorp", batteryId: "BAT-002", status: "Active", lastPayment: "2024-05-28" },
    { id: "C002", name: "Sarah Johnson", email: "sarah@email.com", phone: "+1-555-0124", partner: "GreenEnergy", batteryId: "BAT-005", status: "Active", lastPayment: "2024-05-25" },
    { id: "C003", name: "Mike Davis", email: "mike@email.com", phone: "+1-555-0125", partner: "TechCorp", batteryId: "BAT-007", status: "Pending", lastPayment: "2024-05-20" },
    { id: "C004", name: "Emily Chen", email: "emily@email.com", phone: "+1-555-0126", partner: "PowerSolutions", batteryId: "BAT-012", status: "Active", lastPayment: "2024-05-30" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = isAdmin ? customers : customers.filter(customer => customer.partner === "TechCorp");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Customers' : 'My Customers'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'View all customers across partners' : 'Manage your customer relationships'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredCustomers.length}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredCustomers.filter(c => c.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredCustomers.filter(c => c.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  {isAdmin && <TableHead>Partner</TableHead>}
                  <TableHead>Battery ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    {isAdmin && <TableCell>{customer.partner}</TableCell>}
                    <TableCell>{customer.batteryId}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.lastPayment}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Payment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTable;
