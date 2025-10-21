
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      console.log('Form submitted with:', { username: username.trim() });
      
      // Check if we're in a secure context (required for crypto.subtle)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('Not in secure context, some features may not work properly');
      }
      
      const result = await signIn(username.trim(), password);
      console.log('SignIn result:', result);
      
      if (result.error) {
        console.error('Login failed:', result.error);
        setError(result.error.message);
      } else {
        console.log('Login successful, redirecting...');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl glass-card">
            <img 
              src="/lovable-uploads/85af4ab6-61ef-4620-bef4-36c9fd03e195.png" 
              alt="Logo" 
              className="h-12 w-12 object-contain filter brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
            Sign in to your dashboard to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-card border-0 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-11 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-600 focus:border-slate-400 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                  <AlertDescription className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Demo Credentials */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Demo Credentials:</p>
                <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                  <p><span className="font-medium">Username:</span> admin</p>
                  <p><span className="font-medium">Password:</span> admin123</p>
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                >
                  Use Demo Credentials
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            &copy; 2024 Battery Beacon Connect
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
