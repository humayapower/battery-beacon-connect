
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield, Users } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Battery Management Platform
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Login Form */}
          <Card className="w-full order-2 lg:order-1">
            <CardHeader className="text-center">
              <CardTitle className="text-xl sm:text-2xl">Sign In</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter your username and password to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 text-base"
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium mb-2">Demo Credentials:</p>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Admin:</strong> username: admin, password: admin
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Partner:</strong> Contact admin for credentials
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Access Types Info */}
          <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-2xl">Admin Access</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Full platform management and oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li>• Create and manage partners</li>
                  <li>• View all batteries and customers</li>
                  <li>• Complete transaction history</li>
                  <li>• System-wide analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-2xl">Partner Access</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage assigned batteries and customers
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li>• View assigned battery inventory</li>
                  <li>• Manage customer relationships</li>
                  <li>• Record transactions and payments</li>
                  <li>• Generate customer reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
