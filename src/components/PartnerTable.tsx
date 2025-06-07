
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye, Phone, MapPin, Users, Battery, ExternalLink } from 'lucide-react';
import CreatePartnerModal from './CreatePartnerModal';
import EditPartnerModal from './EditPartnerModal';
import DeletePartnerModal from './DeletePartnerModal';
import PartnerProfile from './PartnerProfile';
import { usePartners } from '@/hooks/usePartners';

const PartnerTable = () => {
  const { partners, loading } = usePartners();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleViewDetails = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedPartnerId(null);
    setShowProfile(false);
  };

  const handleEdit = (partnerId: string) => {
    setEditingPartnerId(partnerId);
  };

  const handleDelete = (partnerId: string) => {
    setDeletingPartnerId(partnerId);
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewAddress = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  // Helper function to find partner by ID
  const findPartnerById = (partnerId: string) => {
    return partners.find(partner => partner.id === partnerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Partner Management</h2>
          <p className="text-base lg:text-lg text-gray-600">Manage your partner network and relationships</p>
        </div>
        <CreatePartnerModal />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{partners.length}</div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Partners</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">
              {partners.filter(p => p.battery_count && p.battery_count > 0).length}
            </div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Active Partners</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
              {partners.reduce((sum, p) => sum + (p.battery_count || 0), 0)}
            </div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Batteries</div>
          </CardContent>
        </Card>
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">
              {partners.reduce((sum, p) => sum + (p.customer_count || 0), 0)}
            </div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Customers</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-xl bg-white/90 backdrop-blur-sm border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800">Partner Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {partners.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4 p-6">
                {partners.map((partner) => (
                  <Card key={partner.id} className="hover:shadow-xl transition-all duration-300 border-2 bg-white/80 backdrop-blur-sm border-gray-100 hover:border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2 flex-1">
                          <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <button
                            onClick={() => handleViewDetails(partner.id)}
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-all duration-200 hover:scale-105"
                          >
                            {partner.name}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">Partner</Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePhoneCall(partner.phone)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-105"
                          >
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{partner.phone}</span>
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Username:</span>
                          <span className="font-semibold text-gray-800">{partner.username}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Batteries:</span>
                          <Badge variant="outline" className="font-medium border-blue-200 text-blue-700">
                            {partner.battery_count || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Customers:</span>
                          <Badge variant="outline" className="font-medium border-green-200 text-green-700">
                            {partner.customer_count || 0}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-6">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
                          onClick={() => handleViewDetails(partner.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 transition-all duration-200"
                          onClick={() => handleEdit(partner.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-100">
                      <TableHead className="font-semibold text-gray-700">Partner Name</TableHead>
                      <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-700">Username</TableHead>
                      <TableHead className="font-semibold text-gray-700">Batteries</TableHead>
                      <TableHead className="font-semibold text-gray-700">Customers</TableHead>
                      <TableHead className="font-semibold text-gray-700">Address</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id} className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100">
                        <TableCell>
                          <button
                            onClick={() => handleViewDetails(partner.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1 transition-all duration-200 hover:scale-105"
                          >
                            {partner.name}
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handlePhoneCall(partner.phone)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-all duration-200 hover:scale-105"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{partner.phone}</span>
                          </button>
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">{partner.username}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Battery className="w-4 h-4 text-blue-600" />
                            <Badge variant="outline" className="font-medium border-blue-200 text-blue-700">
                              {partner.battery_count || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-green-600" />
                            <Badge variant="outline" className="font-medium border-green-200 text-green-700">
                              {partner.customer_count || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {partner.address ? (
                            <button
                              onClick={() => handleViewAddress(partner.address!)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 max-w-[200px] truncate transition-all duration-200 hover:scale-105"
                            >
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm">{partner.address}</span>
                            </button>
                          ) : (
                            <span className="text-gray-500 italic">No address</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(partner.id)}
                              className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300 transition-all duration-200"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(partner.id)}
                              className="hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 transition-all duration-200"
                            >
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
            </>
          ) : (
            <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
              <p className="text-gray-600 mb-6 text-lg">No partners found. Add your first partner to get started.</p>
              <CreatePartnerModal />
            </div>
          )}
        </CardContent>
      </Card>

      {editingPartnerId && findPartnerById(editingPartnerId) && (
        <EditPartnerModal 
          partner={findPartnerById(editingPartnerId)!} 
          onPartnerUpdated={() => setEditingPartnerId(null)}
        />
      )}

      {deletingPartnerId && findPartnerById(deletingPartnerId) && (
        <DeletePartnerModal 
          partner={findPartnerById(deletingPartnerId)!} 
          onPartnerDeleted={() => setDeletingPartnerId(null)}
        />
      )}
    </div>
  );
};

export default PartnerTable;
