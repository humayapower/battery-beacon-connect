
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, MapPin, Battery, Users, CreditCard } from 'lucide-react';
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
          <Badge className="bg-green-100 text-green-800">Partner</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Partner Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Partner Information</CardTitle>
                <CardDescription>Contact details and basic information</CardDescription>
              </div>
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
                  <label className="text-sm font-medium text-gray-500">Phone</label>
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

          {/* Performance Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Key performance metrics and statistics</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Battery className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{partnerBatteries.length}</p>
                  <p className="text-sm text-gray-600">Total Batteries</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
                  <p className="text-sm text-gray-600">Active Customers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">₹{monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Partner Photo */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-gray-600">{partner.username}</p>
                <p className="text-gray-600">{partner.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-semibold">{partnerCustomers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Customers</span>
                <span className="font-semibold">{activeCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available Batteries</span>
                <span className="font-semibold">{availableBatteries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned Batteries</span>
                <span className="font-semibold">{assignedBatteries}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
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
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;
