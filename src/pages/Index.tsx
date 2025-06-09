
import React, { useEffect } from 'react';
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

  useEffect(() => {
    // If not loading and no user, redirect to auth
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
  }, [user, loading, navigate]);

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

  // This should not be reached as we redirect to auth if no user
  return null;
};

export default Index;
