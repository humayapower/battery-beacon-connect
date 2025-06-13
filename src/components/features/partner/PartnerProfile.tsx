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
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 dark:text-gray-100">Partner Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The partner you're looking for doesn't exist.</p>
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header */}
      {showBackButton && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">{partner.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Partner ID: {partner.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">Partner</Badge>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Partner Photo */}
        <div className="lg:col-span-1">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-base sm:text-lg dark:text-gray-100">{partner.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{partner.username}</p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{partner.phone}</p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mt-2 text-xs">Active Partner</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-3 sm:mt-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg dark:text-gray-100">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Batteries</span>
                <span className="font-semibold text-sm sm:text-base dark:text-gray-200">{partnerBatteries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Available</span>
                <span className="font-semibold text-sm sm:text-base text-green-600 dark:text-green-400">{availableBatteries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Assigned</span>
                <span className="font-semibold text-sm sm:text-base text-blue-600 dark:text-blue-400">{assignedBatteries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Customers</span>
                <span className="font-semibold text-sm sm:text-base dark:text-gray-200">{activeCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span className="font-semibold text-sm sm:text-base dark:text-gray-200">₹{monthlyRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="batteries">Batteries</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4 sm:space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-gray-100">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                      <p className="text-base sm:text-lg font-semibold dark:text-gray-200">{partner.name}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                      <p className="text-base sm:text-lg font-semibold dark:text-gray-200">{partner.username}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                      <p className="text-base sm:text-lg font-semibold dark:text-gray-200">{partner.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Joined Date</label>
                      <p className="text-base sm:text-lg font-semibold dark:text-gray-200">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {partner.address && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                      <p className="text-base sm:text-lg font-semibold dark:text-gray-200">{partner.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Identity Documents */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg dark:text-gray-100">Identity Documents</CardTitle>
                  <CardDescription className="text-xs sm:text-sm dark:text-gray-400">Aadhaar and other identification documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">Aadhaar Front</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Document not uploaded</p>
                    </div>
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">Aadhaar Back</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Document not uploaded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Actions */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg dark:text-gray-100">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                    <a href={`tel:${partner.phone}`}>
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Call Partner
                    </a>
                  </Button>
                  {partner.address && (
                    <Button variant="outline" className="w-full justify-start text-xs sm:text-sm" asChild>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(partner.address)}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View Address
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assigned Batteries Tab */}
            <TabsContent value="batteries" className="space-y-4 sm:space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-gray-100">
                    <Battery className="w-4 h-4 sm:w-5 sm:h-5" />
                    Assigned Batteries ({partnerBatteries.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm dark:text-gray-400">
                    List of all batteries assigned to this partner with their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerBatteries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Serial Number</TableHead>
                          <TableHead className="text-xs sm:text-sm">Model</TableHead>
                          <TableHead className="text-xs sm:text-sm">Capacity</TableHead>
                          <TableHead className="text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerBatteries.map((battery) => {
                          const assignedCustomer = battery.customer_id 
                            ? customers.find(c => c.id === battery.customer_id)
                            : null;
                          
                          return (
                            <TableRow key={battery.id}>
                              <TableCell className="font-medium text-xs sm:text-sm dark:text-gray-200">{battery.serial_number}</TableCell>
                              <TableCell className="text-xs sm:text-sm dark:text-gray-300">{battery.model}</TableCell>
                              <TableCell className="text-xs sm:text-sm dark:text-gray-300">{battery.capacity}</TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(battery.status)} text-xs`}>
                                  {battery.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm dark:text-gray-300">
                                {assignedCustomer ? assignedCustomer.name : 'Unassigned'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 sm:py-8">
                      <Battery className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2 sm:mb-3" />
                      <h3 className="text-sm sm:text-lg font-semibold mb-1 dark:text-gray-100">No Batteries Assigned</h3>
                      <p className="text-gray-600 dark:text-gray-400">This partner doesn't have any batteries assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assigned Customers Tab */}
            <TabsContent value="customers" className="space-y-4 sm:space-y-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg dark:text-gray-100">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    Assigned Customers ({partnerCustomers.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm dark:text-gray-400">
                    List of all customers assigned to this partner
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {partnerCustomers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Customer Name</TableHead>
                          <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                          <TableHead className="text-xs sm:text-sm">Battery Serial</TableHead>
                          <TableHead className="text-xs sm:text-sm">Payment Type</TableHead>
                          <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerCustomers.map((customer) => {
                          const assignedBattery = customer.battery_id 
                            ? batteries.find(b => b.id === customer.battery_id)
                            : null;
                          
                          return (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium text-xs sm:text-sm dark:text-gray-200">{customer.name}</TableCell>
                              <TableCell className="text-xs sm:text-sm dark:text-gray-300">{customer.phone}</TableCell>
                              <TableCell className="text-xs sm:text-sm dark:text-gray-300">
                                {assignedBattery ? assignedBattery.serial_number : 'No Battery'}
                              </TableCell>
                              <TableCell className="capitalize text-xs sm:text-sm dark:text-gray-300">
                                {customer.payment_type.replace('_', ' ')}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                                  {customer.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 sm:py-8">
                      <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2 sm:mb-3" />
                      <h3 className="text-sm sm:text-lg font-semibold mb-1 dark:text-gray-100">No Customers Assigned</h3>
                      <p className="text-gray-600 dark:text-gray-400">This partner doesn't have any customers assigned yet.</p>
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
