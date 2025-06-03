
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, UserPlus } from 'lucide-react';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useToast } from '@/hooks/use-toast';

interface CreatePartnerModalProps {
  onPartnerCreated?: () => void;
}

const CreatePartnerModal = ({ onPartnerCreated }: CreatePartnerModalProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createPartner, isAdmin } = useAdminFunctions();
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!phone.trim() && !username.trim()) {
      setError('Either phone number or username is required');
      setLoading(false);
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Create a temporary email if none provided
    const partnerEmail = email.trim() || `${username || phone}@temp.partner.local`;

    try {
      await createPartner(partnerEmail, password, fullName, phone, username);
      toast({
        title: "Partner created successfully",
        description: `${fullName} has been added as a partner. They can now log in using their ${phone ? 'phone number' : 'username'}.`,
      });
      setOpen(false);
      setEmail('');
      setPhone('');
      setUsername('');
      setPassword('');
      setFullName('');
      onPartnerCreated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Create New Partner</span>
          </DialogTitle>
          <DialogDescription>
            Add a new partner to the platform. They will be able to log in using their phone number or username.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partnerName">Full Name *</Label>
            <Input
              id="partnerName"
              type="text"
              placeholder="Enter partner's full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partnerPhone">Phone Number</Label>
              <Input
                id="partnerPhone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="partnerUsername">Username</Label>
              <Input
                id="partnerUsername"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partnerEmail">Email Address (Optional)</Label>
            <Input
              id="partnerEmail"
              type="email"
              placeholder="Enter partner's email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partnerPassword">Password *</Label>
            <Input
              id="partnerPassword"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              The partner can change this password after logging in.
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Either phone number or username is required for partner login. 
              Email verification is not required for partners.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Partner
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePartnerModal;
