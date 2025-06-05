
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Battery, Calendar, MapPin, Wrench, Shield } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { usePartners } from '@/hooks/usePartners';

const BatteryProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { partners } = usePartners();

  const battery = batteries.find(b => b.id === id);
  const customer = battery?.customer_id ? customers.find(c => c.id === battery.customer_id) : null;
  const partner = battery?.partner_id ? partners.find(p => p.id === battery.partner_id) : null;

  if (!battery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Battery Not Found</h2>
            <p className="text-gray-600 mb-4">The battery you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Battery Profile</h1>
            <p className="text-gray-600">Serial Number: {battery.serial_number}</p>
          </div>
          <Badge className={getStatusColor(battery.status)}>
            {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Battery Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Battery className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Battery Information</CardTitle>
                  <CardDescription>Technical specifications and details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-lg font-semibold">{battery.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model Name</label>
                    <p className="text-lg font-semibold">{battery.model_name || 'N/A'}</p>
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
                    <label className="text-sm font-medium text-gray-500">IMEI Number</label>
                    <p className="text-lg font-semibold">{battery.imei_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SIM Number</label>
                    <p className="text-lg font-semibold">{battery.sim_number || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates & Maintenance */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Dates & Maintenance</CardTitle>
                  <CardDescription>Important dates and service information</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Manufacturing Date</label>
                    <p className="text-lg font-semibold">
                      {battery.manufacturing_date ? new Date(battery.manufacturing_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                    <p className="text-lg font-semibold">
                      {battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Warranty Period</label>
                    <p className="text-lg font-semibold">{battery.warranty_period ? `${battery.warranty_period} months` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Warranty Expiry</label>
                    <p className="text-lg font-semibold">
                      {battery.warranty_expiry ? new Date(battery.warranty_expiry).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                    <p className="text-lg font-semibold">
                      {battery.last_maintenance ? new Date(battery.last_maintenance).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-lg font-semibold">{battery.location || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Battery Image Placeholder */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Battery className="w-16 h-16 text-gray-400" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{battery.model}</h3>
                  <p className="text-gray-600">{battery.serial_number}</p>
                </div>
              </CardContent>
            </Card>

            {/* Partner Information */}
            {partner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{partner.name}</p>
                    <p className="text-sm text-gray-600">{partner.phone}</p>
                    <p className="text-sm text-gray-600">{partner.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Information */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <Badge className="bg-blue-100 text-blue-800">{customer.payment_type}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryProfile;
