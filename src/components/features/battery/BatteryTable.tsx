
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import { Battery } from '@/types';
import DeleteBatteryModal from '@/components/modals/DeleteBatteryModal';

interface BatteryTableProps {
  batteries: Battery[];
  onEdit?: (battery: Battery) => void;
}

const BatteryTable = ({ batteries, onEdit }: BatteryTableProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'faulty': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (battery: Battery) => {
    setSelectedBattery(battery);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedBattery(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batteries.map((battery) => (
              <TableRow key={battery.id}>
                <TableCell className="font-medium">{battery.serial_number}</TableCell>
                <TableCell>{battery.model}</TableCell>
                <TableCell>{battery.capacity}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(battery.status)}>
                    {battery.status}
                  </Badge>
                </TableCell>
                <TableCell>{battery.partner?.name || 'Unassigned'}</TableCell>
                <TableCell>{battery.location || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(battery)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(battery)}
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

      <DeleteBatteryModal
        batteryId={selectedBattery?.id || null}
        batterySerial={selectedBattery?.serial_number || ''}
        customerId={selectedBattery?.customer_id || null}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};

export default BatteryTable;
