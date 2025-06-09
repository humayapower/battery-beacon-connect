
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(username.trim(), password);
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/85af4ab6-61ef-4620-bef4-36c9fd03e195.png" 
            alt="Blumos Logo" 
            className="h-12 sm:h-16 md:h-20 mx-auto mb-6 drop-shadow-sm"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Battery Management Platform
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Streamline your battery leasing operations with our comprehensive management solution. 
            Manage inventory, track customers, and process payments all in one place.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Section */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300 dark:border-gray-700">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">Admin Access</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Full platform management and oversight
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-2 text-left">
                    <li>• Manage all batteries and partners</li>
                    <li>• View complete transaction history</li>
                    <li>• System-wide analytics and reporting</li>
                    <li>• User and permission management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300 dark:border-gray-700">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-gray-100">Partner Access</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Manage your assigned batteries and customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-2 text-left">
                    <li>• View your assigned battery inventory</li>
                    <li>• Manage customer relationships</li>
                    <li>• Track transactions and payments</li>
                    <li>• Generate customer reports</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Status Indicators */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Battery Status Indicators</h3>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Available</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ready for assignment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">Assigned</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">In customer use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">Maintenance</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Under service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 font-medium" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Demo Credentials */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Demo Credentials:</p>
                    <div className="space-y-0.5 text-xs text-blue-700 dark:text-blue-300">
                      <p><strong>Admin:</strong> username: admin, password: admin</p>
                      <p><strong>Partner:</strong> Contact admin for credentials</p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Blumos. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
