import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye } from 'lucide-react';
import AddBatteryModal from './AddBatteryModal';
import { useBatteries } from '@/hooks/useBatteries';

interface BatteryTableProps {
  isAdmin: boolean;
}

const BatteryTable = ({ isAdmin }: BatteryTableProps) => {
  const { batteries, loading } = useBatteries();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Batteries' : 'My Batteries'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <AddBatteryModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{batteries.length}</div>
            <div className="text-sm text-gray-600">Total Batteries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {batteries.filter(b => b.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {batteries.filter(b => b.status === 'maintenance').length}
            </div>
            <div className="text-sm text-gray-600">In Maintenance</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Battery Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {batteries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Voltage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Warranty Period</TableHead>
                    <TableHead>Mfg. Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batteries.map((battery) => (
                    <TableRow key={battery.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{battery.serial_number}</TableCell>
                      <TableCell>{battery.model}</TableCell>
                      <TableCell>{battery.capacity}</TableCell>
                      <TableCell>{battery.voltage ? `${battery.voltage}V` : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(battery.status)}>
                          {battery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{battery.warranty_period ? `${battery.warranty_period} months` : 'N/A'}</TableCell>
                      <TableCell>{formatDate(battery.manufacturing_date)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
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
              <p className="text-gray-600 mb-4">No batteries found. Add your first battery to get started.</p>
              <AddBatteryModal />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BatteryTable;
