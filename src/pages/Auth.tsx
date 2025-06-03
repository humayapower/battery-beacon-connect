
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [partnerIdentifier, setPartnerIdentifier] = useState('');
  const [partnerPassword, setPartnerPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInPartner, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegularSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        result = await signUp(email, password, fullName, phone, username);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else if (isSignUp) {
        setError('');
        alert('Check your email for a confirmation link!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInPartner(partnerIdentifier, partnerPassword);
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Battery Management Platform</CardTitle>
          <CardDescription>
            Access your account or sign in as a partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="regular" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Regular Login</TabsTrigger>
              <TabsTrigger value="partner">Partner Login</TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <form onSubmit={handleRegularSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username (Optional)</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign In' 
                      : "Don't have an account? Sign Up"
                    }
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="partner">
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerIdentifier">Phone Number or Username</Label>
                  <Input
                    id="partnerIdentifier"
                    type="text"
                    placeholder="Enter phone number or username"
                    value={partnerIdentifier}
                    onChange={(e) => setPartnerIdentifier(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partnerPassword">Password</Label>
                  <Input
                    id="partnerPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={partnerPassword}
                    onChange={(e) => setPartnerPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In as Partner'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
