
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit } from 'lucide-react';

interface BatteryTableProps {
  isAdmin: boolean;
}

const BatteryTable = ({ isAdmin }: BatteryTableProps) => {
  const batteries = [
    { id: "BAT-001", model: "PowerMax 5000", capacity: "5kWh", status: "Available", partner: "TechCorp", customer: null, lastMaintenance: "2024-05-15" },
    { id: "BAT-002", model: "EcoCell 3000", capacity: "3kWh", status: "Assigned", partner: "GreenEnergy", customer: "John Smith", lastMaintenance: "2024-04-20" },
    { id: "BAT-003", model: "PowerMax 5000", capacity: "5kWh", status: "Maintenance", partner: "TechCorp", customer: null, lastMaintenance: "2024-05-30" },
    { id: "BAT-004", model: "UltraCell 7000", capacity: "7kWh", status: "Available", partner: "PowerSolutions", customer: null, lastMaintenance: "2024-05-10" },
    { id: "BAT-005", model: "EcoCell 3000", capacity: "3kWh", status: "Assigned", partner: "GreenEnergy", customer: "Sarah Johnson", lastMaintenance: "2024-04-25" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBatteries = isAdmin ? batteries : batteries.filter(battery => battery.partner === "TechCorp");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Batteries' : 'My Batteries'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Manage battery inventory across all partners' : 'View and manage your assigned batteries'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          {isAdmin ? 'Add Battery' : 'Request Battery'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Battery Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Battery ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Partner</TableHead>}
                  <TableHead>Customer</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatteries.map((battery) => (
                  <TableRow key={battery.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{battery.id}</TableCell>
                    <TableCell>{battery.model}</TableCell>
                    <TableCell>{battery.capacity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(battery.status)}>
                        {battery.status}
                      </Badge>
                    </TableCell>
                    {isAdmin && <TableCell>{battery.partner}</TableCell>}
                    <TableCell>{battery.customer || 'Unassigned'}</TableCell>
                    <TableCell>{battery.lastMaintenance}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {battery.status === 'Available' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Assign
                          </Button>
                        )}
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

export default BatteryTable;
