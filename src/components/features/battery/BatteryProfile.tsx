
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Battery, Calendar, Wrench, User, Users, Edit, MapPin } from 'lucide-react';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';

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
  const { partners } = useOptimizedPartners();

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
        <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Battery className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Battery Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The battery you're looking for doesn't exist or has been removed.</p>
            {showBackButton && (
              <Button onClick={handleBack} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
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
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Header */}
      {showBackButton && (
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 sm:p-6 rounded-2xl glass-card border-0 shadow-lg">
          {/* Left Section - Back Arrow */}
          <button 
            onClick={handleBack}
            className="p-3 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
            <span className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">Back</span>
          </button>

          {/* Center Section - Battery Info */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              🔋 {battery.serial_number}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{battery.model_name || battery.model}</p>
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(battery.status)} border-0 text-xs px-3 py-1 font-semibold shadow-sm`}>
              {battery.status.charAt(0).toUpperCase() + battery.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" className="glass-card border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Edit</span>
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Enhanced Technical Specifications */}
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-700">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Battery className="w-5 h-5 text-white" />
              </div>
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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

        {/* Enhanced Assignment Information */}
        {(customer || partner) && (
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b border-green-200 dark:border-green-700">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Assignment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
          <Card className="glass-card border-0 shadow-xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Battery className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Not Assigned</h3>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">This battery is not currently assigned to any customer or partner and is available for assignment.</p>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Warranty & Maintenance */}
        <Card className="glass-card border-0 shadow-xl lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-purple-200 dark:border-purple-700">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Warranty & Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
