
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Battery, Calendar, Wrench, User, Users, Edit, MapPin } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { usePartners } from '@/hooks/usePartners';

interface BatteryProfileProps {
  batteryId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  onCustomerClick?: (customerId: string) => void;
  onPartnerClick?: (partnerId: string) => void;
}

const BatteryProfile: React.FC<BatteryProfileProps> = ({ 
  batteryId, 
  onBack, 
  showBackButton = true,
  onCustomerClick,
  onPartnerClick
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

  const handleCustomerClick = () => {
    if (customer && onCustomerClick) {
      onCustomerClick(customer.id);
    }
  };

  const handlePartnerClick = () => {
    if (partner && onPartnerClick) {
      onPartnerClick(partner.id);
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
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header */}
      {showBackButton && (
        <div className="flex items-center justify-between">
          {/* Left Section - Back Arrow */}
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(battery.status)} border text-xs px-2 py-1`} variant="outline">
              {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Technical Specifications */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100 font-medium flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Serial Number</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">{battery.serial_number}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Model Name</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{battery.model_name || battery.model}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Model Number</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{battery.model}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Capacity</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{battery.capacity}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Voltage</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{battery.voltage ? `${battery.voltage}V` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Manufacturing Date</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {battery.manufacturing_date ? new Date(battery.manufacturing_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">IMEI Number</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">{battery.imei_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">SIM Number</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">{battery.sim_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Location</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {battery.location || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Information */}
        {(customer || partner) && (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:col-span-2">
            {/* <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <CardTitle className="text-base text-slate-900 dark:text-slate-100 font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignment Information
              </CardTitle>
            </CardHeader> */}
            <CardContent className="p-3">
              <div className="flex items-center justify-around gap-8">
                {customer && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Customer</span>
                    </div>
                    <button 
                      onClick={handleCustomerClick}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                    >
                      {customer.name}
                    </button>
                  </div>
                )}

                {partner && (
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
                        <Users className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Partner</span>
                    </div>
                    <button 
                      onClick={handlePartnerClick}
                      className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline transition-colors"
                    >
                      {partner.name}
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!customer && !partner && (
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 lg:col-span-2">
            <CardContent className="p-8 text-center">
              <Battery className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Not Assigned</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">This battery is not currently assigned to any customer or partner.</p>
            </CardContent>
          </Card>
        )}

        {/* Warranty & Maintenance */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Warranty & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Warranty Period</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{battery.warranty_period ? `${battery.warranty_period} months` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchase Date</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {battery.purchase_date ? new Date(battery.purchase_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Warranty Status</label>
                <Badge className={`${getWarrantyStatusColor(getWarrantyStatus())} border text-xs`} variant="outline">
                  {getWarrantyStatus()}
                </Badge>
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Maintenance</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {battery.last_maintenance ? new Date(battery.last_maintenance).toLocaleDateString() : 'No maintenance recorded'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default BatteryProfile;
