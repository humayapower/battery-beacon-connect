
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Filter, Phone, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Battery } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { usePhoneCall } from '@/hooks/usePhoneCall';
import { getBatteryStatusColor } from '@/utils/statusColors';
import AddBatteryModal from '@/components/modals/AddBatteryModal';
import AssignBatteryToPartnerModal from '@/components/modals/AssignBatteryToPartnerModal';

interface BatteryTableProps {
  batteries: Battery[];
  onBatteryClick: (battery: Battery) => void;
  isAdmin?: boolean;
}

const BatteryTable = ({ batteries, onBatteryClick, isAdmin = false }: BatteryTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { userRole } = useAuth();
  const initiateCall = usePhoneCall();

  const filteredBatteries = batteries.filter(battery => {
    const matchesSearch = 
      battery.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      battery.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (battery.partner?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || battery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCall = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    initiateCall(phoneNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by serial number, model, or partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="faulty">Faulty</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          {userRole === 'admin' && <AssignBatteryToPartnerModal />}
          <AddBatteryModal />
        </div>
      </div>

      {/* Battery Table */}
      <div className="glass-card border-0 shadow-xl rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
              <TableHead className="font-semibold">Serial Number</TableHead>
              <TableHead className="font-semibold">Model</TableHead>
              <TableHead className="font-semibold">Capacity</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Partner</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatteries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No batteries found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredBatteries.map((battery) => (
                <TableRow 
                  key={battery.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onBatteryClick(battery)}
                >
                  <TableCell className="font-medium">{battery.serial_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{battery.model}</div>
                      {battery.model_name && (
                        <div className="text-sm text-muted-foreground">{battery.model_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{battery.capacity}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`${getBatteryStatusColor(battery.status)} text-white border-0`}
                    >
                      {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {battery.partner ? (
                      <div className="flex items-center gap-2">
                        <span>{battery.partner.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{battery.location || 'Not specified'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onBatteryClick(battery); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Edit Battery
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Battery
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BatteryTable;
