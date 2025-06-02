
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminDashboard from '@/components/AdminDashboard';
import PartnerDashboard from '@/components/PartnerDashboard';
import { Shield, Users } from 'lucide-react';

const Index = () => {
  const [userRole, setUserRole] = useState<'admin' | 'partner' | null>(null);

  if (userRole === 'admin') {
    return <AdminDashboard onRoleChange={() => setUserRole(null)} />;
  }

  if (userRole === 'partner') {
    return <PartnerDashboard onRoleChange={() => setUserRole(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Battery Management Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your battery leasing operations with our comprehensive management solution
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setUserRole('admin')}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription className="text-base">
                Full platform management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li>• Manage all batteries and partners</li>
                <li>• View complete transaction history</li>
                <li>• System-wide analytics and reporting</li>
                <li>• User and permission management</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Continue as Admin
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => setUserRole('partner')}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Partner Access</CardTitle>
              <CardDescription className="text-base">
                Manage your assigned batteries and customers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li>• View your assigned battery inventory</li>
                <li>• Manage customer relationships</li>
                <li>• Track transactions and payments</li>
                <li>• Generate customer reports</li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Continue as Partner
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
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
