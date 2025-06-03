
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Error</CardTitle>
            <CardDescription>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Battery Management Platform
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 lg:mb-8 px-4">
            Streamline your battery leasing operations with our comprehensive management solution
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-blue-600 hover:bg-blue-700 text-base sm:text-lg px-6 py-3 sm:px-8 w-full sm:w-auto"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Sign In to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Admin Access</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Full platform management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-xs sm:text-sm text-gray-600 mb-6 space-y-2">
                <li>• Manage all batteries and partners</li>
                <li>• View complete transaction history</li>
                <li>• System-wide analytics and reporting</li>
                <li>• User and permission management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Partner Access</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your assigned batteries and customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-xs sm:text-sm text-gray-600 mb-6 space-y-2">
                <li>• View your assigned battery inventory</li>
                <li>• Manage customer relationships</li>
                <li>• Track transactions and payments</li>
                <li>• Generate customer reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 lg:mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-xs sm:text-sm text-gray-500 px-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>
              <span>Ready for assignment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>
              <span>In customer use</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Maintenance</Badge>
              <span>Under service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
