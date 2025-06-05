import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Battery, UserCheck, Eye, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CreatePartnerModal from './CreatePartnerModal';
import EditPartnerModal from './EditPartnerModal';
import DeletePartnerModal from './DeletePartnerModal';
import PartnerProfile from './PartnerProfile';
import { usePartners } from '@/hooks/usePartners';
import { useAuth } from '@/contexts/AuthContext';

const PartnerTable = () => {
  const { partners, loading, refetch } = usePartners();
  const { userRole } = useAuth();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleViewDetails = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedPartnerId(null);
    setShowProfile(false);
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Partners</h2>
            <p className="text-gray-600">Manage partner organizations and their access</p>
          </div>
          <CreatePartnerModal onPartnerCreated={refetch} />
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  // If showing profile, render the partner profile component
  if (showProfile && selectedPartnerId) {
    return (
      <PartnerProfile 
        partnerId={selectedPartnerId} 
        onBack={handleCloseProfile}
        showBackButton={true}
      />
    );
  }

  const totalBatteries = partners.reduce((sum, partner) => sum + (partner.battery_count || 0), 0);
  const totalCustomers = partners.reduce((sum, partner) => sum + (partner.customer_count || 0), 0);
  const activePartners = partners.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Partners</h2>
          <p className="text-gray-600">Manage partner organizations and their access</p>
        </div>
        <CreatePartnerModal onPartnerCreated={refetch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold text-blue-600">{activePartners}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-bold text-green-600">{activePartners}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batteries</p>
                <p className="text-2xl font-bold text-purple-600">{totalBatteries}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Battery className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-orange-600">{totalCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No partners yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first partner organization.</p>
              <CreatePartnerModal onPartnerCreated={refetch} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Batteries</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleViewDetails(partner.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          {partner.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handlePhoneCall(partner.phone)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{partner.phone}</span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Battery className="w-4 h-4 text-gray-500" />
                          <span>{partner.battery_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{partner.customer_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(partner.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <EditPartnerModal 
                            partner={partner} 
                            onPartnerUpdated={refetch} 
                          />
                          <DeletePartnerModal 
                            partner={partner} 
                            onPartnerDeleted={refetch} 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerTable;
