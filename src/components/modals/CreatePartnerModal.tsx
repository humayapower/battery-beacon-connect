
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, UserPlus, Upload } from 'lucide-react';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useToast } from '@/hooks/use-toast';

interface CreatePartnerModalProps {
  onPartnerCreated?: () => void;
}

interface PartnerFormData {
  name: string;
  phone: string;
  username: string;
  password: string;
  address: string;
}

const CreatePartnerModal = ({ onPartnerCreated }: CreatePartnerModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    phone: '',
    username: '',
    password: '123456',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createPartner, isAdmin } = useAdminFunctions();
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await createPartner(
        formData.name.trim(),
        formData.phone.trim(),
        formData.username.trim(),
        formData.password.trim(),
        formData.address.trim() || undefined
      );

      toast({
        title: "Partner created successfully",
        description: `${formData.name} has been added as a partner.`,
      });
      
      setOpen(false);
      resetForm();
      onPartnerCreated?.();
    } catch (err: any) {
      console.error('Partner creation error:', err);
      setError(err.message || 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      username: '',
      password: '123456',
      address: '',
    });
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-add-partner-trigger>
          <Plus className="w-4 h-4 mr-2" />
          Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl glass-card border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 -m-6 mb-6 rounded-t-2xl">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            Create New Partner
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Add a new partner to the platform with their credentials.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partnerName">Full Name *</Label>
              <Input
                id="partnerName"
                type="text"
                placeholder="Enter partner's full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="partnerPhone">Phone Number *</Label>
              <Input
                id="partnerPhone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="partnerAddress">Address</Label>
            <Textarea
              id="partnerAddress"
              placeholder="Enter partner's complete address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partnerUsername">Username *</Label>
              <Input
                id="partnerUsername"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="partnerPassword">Password *</Label>
              <Input
                id="partnerPassword"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Partner...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Partner
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="glass-card border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePartnerModal;
