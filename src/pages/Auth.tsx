
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Logo Section */}
      <div className="mb-6 text-center">
        <img 
          src="/lovable-uploads/85af4ab6-61ef-4620-bef4-36c9fd03e195.png" 
          alt="Blumos Logo" 
          className="h-12 sm:h-16 md:h-20 mx-auto mb-4 drop-shadow-sm"
        />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Battery Management Platform
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto px-2">
          Sign in to access your dashboard
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-sm shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
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
                className="h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                className="h-10 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
              <Alert variant="destructive" className="border-red-200">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Demo Credentials:</p>
              <div className="space-y-0.5 text-xs text-blue-700">
                <p><strong>Admin:</strong> username: admin, password: admin</p>
                <p><strong>Partner:</strong> Contact admin for credentials</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>&copy; 2024 Blumos. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Auth;
