
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminDashboard from '@/components/AdminDashboard';
import PartnerDashboard from '@/components/PartnerDashboard';
import { Shield, Users, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard
  if (user && userRole) {
    if (userRole === 'admin') {
      return <AdminDashboard />;
    }
    if (userRole === 'partner') {
      return <PartnerDashboard />;
    }
  }

  // If user is logged in but has no role, show error
  if (user && !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-red-600">Access Error</CardTitle>
            <CardDescription className="text-sm">
              Your account doesn't have proper permissions. Please contact an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Battery Management Platform
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 px-2">
            Streamline your battery leasing operations with our comprehensive management solution
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-6 py-2.5 w-full sm:w-auto"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Admin Access</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Full platform management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-xs sm:text-sm text-gray-600 mb-4 space-y-1.5">
                <li>• Manage all batteries and partners</li>
                <li>• View complete transaction history</li>
                <li>• System-wide analytics and reporting</li>
                <li>• User and permission management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Partner Access</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your assigned batteries and customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-xs sm:text-sm text-gray-600 mb-4 space-y-1.5">
                <li>• View your assigned battery inventory</li>
                <li>• Manage customer relationships</li>
                <li>• Track transactions and payments</li>
                <li>• Generate customer reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 px-2">
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Available</Badge>
              <span>Ready for assignment</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Assigned</Badge>
              <span>In customer use</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">Maintenance</Badge>
              <span>Under service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
