
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminDashboard from '@/components/layout/AdminDashboard';
import PartnerDashboard from '@/components/layout/PartnerDashboard';
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
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
        <div className="text-center glass-card p-8 rounded-2xl">
          <div className="pulse-loader w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare everything</p>
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
      <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">Access Error</CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Your account doesn't have proper permissions. Please contact an administrator for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700">
              <LogIn className="w-4 h-4 mr-2" />
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
