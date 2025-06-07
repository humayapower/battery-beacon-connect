
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Battery, Calendar, Wrench, User, Users, Edit } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { usePartners } from '@/hooks/usePartners';

interface BatteryProfileProps {
  batteryId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const BatteryProfile: React.FC<BatteryProfileProps> = ({ 
  batteryId, 
  onBack, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { partners } = usePartners();

  const battery = batteries.find(b => b.id === batteryId);
  const customer = battery?.customer_id ? customers.find(c => c.id === battery.customer_id) : null;
  const partner = battery?.partner_id ? partners.find(p => p.id === battery.partner_id) : null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (!battery) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Battery Not Found</h2>
            <p className="text-gray-600 mb-4">The battery you're looking for doesn't exist.</p>
            {showBackButton && (
              <Button onClick={handleBack}>Go Back</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const getWarrantyStatus = () => {
    if (!battery.warranty_expiry) return 'Unknown';
    const today = new Date();
    const expiryDate = new Date(battery.warranty_expiry);
    return expiryDate > today ? 'Active' : 'Expired';
  };

  const getWarrantyStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Battery Details</h1>
            <p className="text-gray-600">Serial Number: {battery.serial_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(battery.status)}>
              {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Battery Image */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Battery className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{battery.model}</h3>
                <p className="text-gray-600">{battery.serial_number}</p>
                <Badge className={getStatusColor(battery.status)} variant="secondary">
                  {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Serial Number</label>
                      <p className="text-lg font-semibold">{battery.serial_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model Name</label>
                      <p className="text-lg font-semibold">{battery.model_name || battery.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model Number</label>
                      <p className="text-lg font-semibold">{battery.model}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Capacity</label>
                      <p className="text-lg font-semibold">{battery.capacity}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Voltage</label>
                      <p className="text-lg font-semibold">{battery.voltage ? `${battery.voltage}V` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Manufacturing Date</label>
                      <p className="text-lg font-semibold">
                        {battery.manufacturing_date ? new Date(battery.manufacturing_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IMEI Number</label>
                      <p className="text-lg font-semibold">{battery.imei_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">SIM Number</label>
                      <p className="text-lg font-semibold">{battery.sim_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-lg font-semibold">{battery.location || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Warranty Tab */}
            <TabsContent value="warranty" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Warranty Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Warranty Period</label>
                      <p className="text-lg font-semibold">{battery.warranty_period ? `${battery.warranty_period} months` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                      <p className="text-lg font-semibold">
                        {battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Warranty End Date</label>
                      <p className="text-lg font-semibold">
                        {battery.warranty_expiry ? new Date(battery.warranty_expiry).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Warranty Status</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getWarrantyStatusColor(getWarrantyStatus())}>
                          {getWarrantyStatus()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                    <p className="text-lg font-semibold">
                      {battery.last_maintenance ? new Date(battery.last_maintenance).toLocaleDateString() : 'No maintenance recorded'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignment Tab */}
            <TabsContent value="assignment" className="space-y-6">
              {customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Assigned Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{customer.payment_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {partner && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Assigned Partner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{partner.name}</p>
                          <p className="text-sm text-gray-600">{partner.phone}</p>
                          <p className="text-sm text-gray-600">{partner.address}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!customer && !partner && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Battery className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Not Assigned</h3>
                    <p className="text-gray-600">This battery is not currently assigned to any customer or partner.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Health Tab */}
            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="w-5 h-5" />
                    Battery Health (Future Feature)
                  </CardTitle>
                  <CardDescription>
                    Real-time battery health monitoring will be available when BMS data is connected.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Battery className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                    <p className="text-gray-600">Battery health monitoring, charge cycles, and performance metrics will be displayed here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BatteryProfile;
