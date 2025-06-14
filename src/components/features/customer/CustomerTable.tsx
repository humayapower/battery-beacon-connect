
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from 'lucide-react';
import { CustomerWithBattery } from '@/hooks/useCustomers';
import DeleteCustomerModal from '@/components/modals/DeleteCustomerModal';

interface CustomerTableProps {
  customers: CustomerWithBattery[];
  onViewDetails?: (customerId: string) => void;
  onEdit?: (customer: CustomerWithBattery) => void;
}

const CustomerTable = ({ customers, onViewDetails, onEdit }: CustomerTableProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBattery | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'emi': return 'bg-blue-100 text-blue-800';
      case 'monthly_rent': return 'bg-purple-100 text-purple-800';
      case 'one_time_purchase': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (customer: CustomerWithBattery) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedCustomer(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Payment Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge className={getPaymentTypeColor(customer.payment_type)}>
                    {customer.payment_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.join_date ? new Date(customer.join_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{customer.partner?.name || 'Unassigned'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {onViewDetails && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(customer.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(customer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(customer)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteCustomerModal
        customerId={selectedCustomer?.id || null}
        customerName={selectedCustomer?.name || ''}
        batteryId={selectedCustomer?.battery_id || null}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default CustomerTable;
