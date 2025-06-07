
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Phone, MapPin, Battery, Users, CreditCard, Edit } from 'lucide-react';
import { usePartners } from '@/hooks/usePartners';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';

interface PartnerProfileProps {
  partnerId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const PartnerProfile: React.FC<PartnerProfileProps> = ({ 
  partnerId, 
  onBack, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const { partners } = usePartners();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { transactions } = useTransactions();

  const partner = partners.find(p => p.id === partnerId);
  const partnerBatteries = batteries.filter(b => b.partner_id === partnerId);
  const partnerCustomers = customers.filter(c => c.partner_id === partnerId);
  const partnerTransactions = transactions.filter(t => t.partner_id === partnerId);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!partner) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Partner Not Found</h2>
            <p className="text-gray-600 mb-4">The partner you're looking for doesn't exist.</p>
            {showBackButton && (
              <Button onClick={handleBack}>Go Back</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableBatteries = partnerBatteries.filter(b => b.status === 'available').length;
  const assignedBatteries = partnerBatteries.filter(b => b.status === 'assigned').length;
  const activeCustomers = partnerCustomers.filter(c => c.status === 'active').length;
  const monthlyRevenue = partnerTransactions.filter(t => t.payment_status === 'paid').reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showBackButton && (
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{partner.name}</h1>
            <p className="text-gray-600">Partner ID: {partner.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Partner</Badge>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Partner Photo */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-gray-600">{partner.username}</p>
                <p className="text-gray-600">{partner.phone}</p>
                <Badge className="bg-green-100 text-green-800 mt-2">Active Partner</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Batteries</span>
                <span className="font-semibold">{partnerBatteries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="font-semibold text-green-600">{availableBatteries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned</span>
                <span className="font-semibold text-blue-600">{assignedBatteries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="font-semibold">{activeCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold">₹{monthlyRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="batteries">Batteries</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold">{partner.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-lg font-semibold">{partner.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-lg font-semibold">{partner.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined Date</label>
                      <p className="text-lg font-semibold">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {partner.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-lg font-semibold">{partner.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Identity Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Identity Documents</CardTitle>
                  <CardDescription>Aadhaar and other identification documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-400 mb-2">Aadhaar Front</div>
                      <p className="text-sm text-gray-500">Document not uploaded</p>
                    </div>
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-400 mb-2">Aadhaar Back</div>
                      <p className="text-sm text-gray-500">Document not uploaded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={`tel:${partner.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Partner
                    </a>
                  </Button>
                  {partner.address && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(partner.address)}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-4 h-4 mr-2" />
                        View Address
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assigned Batteries Tab */}
            <TabsContent value="batteries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5" />
                    Assigned Batteries ({partnerBatteries.length})
                  </CardTitle>
                  <CardDescription>
                    List of all batteries assigned to this partner with their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerBatteries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerBatteries.map((battery) => {
                          const assignedCustomer = battery.customer_id 
                            ? customers.find(c => c.id === battery.customer_id)
                            : null;
                          
                          return (
                            <TableRow key={battery.id}>
                              <TableCell className="font-medium">{battery.serial_number}</TableCell>
                              <TableCell>{battery.model}</TableCell>
                              <TableCell>{battery.capacity}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(battery.status)}>
                                  {battery.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {assignedCustomer ? assignedCustomer.name : 'Unassigned'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Battery className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No Batteries Assigned</h3>
                      <p className="text-gray-600">This partner doesn't have any batteries assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assigned Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Assigned Customers ({partnerCustomers.length})
                  </CardTitle>
                  <CardDescription>
                    List of all customers assigned to this partner
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerCustomers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Battery Serial</TableHead>
                          <TableHead>Payment Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerCustomers.map((customer) => {
                          const assignedBattery = customer.battery_id 
                            ? batteries.find(b => b.id === customer.battery_id)
                            : null;
                          
                          return (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">{customer.name}</TableCell>
                              <TableCell>{customer.phone}</TableCell>
                              <TableCell>
                                {assignedBattery ? assignedBattery.serial_number : 'No Battery'}
                              </TableCell>
                              <TableCell className="capitalize">
                                {customer.payment_type.replace('_', ' ')}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(customer.status)}>
                                  {customer.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No Customers Assigned</h3>
                      <p className="text-gray-600">This partner doesn't have any customers assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;
