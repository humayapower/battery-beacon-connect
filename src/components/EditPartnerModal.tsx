
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Edit } from 'lucide-react';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/types';

interface EditPartnerModalProps {
  partner: Partner;
  onPartnerUpdated?: () => void;
}

const EditPartnerModal = ({ partner, onPartnerUpdated }: EditPartnerModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(partner.name);
  const [phone, setPhone] = useState(partner.phone);
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(partner.address || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePartner, isAdmin } = useAdminFunctions();
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    try {
      const updates: any = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || null
      };

      if (password.trim()) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        updates.password = password.trim();
      }

      await updatePartner(partner.id, updates);
      
      toast({
        title: "Partner updated successfully",
        description: `${name} has been updated.`,
      });
      
      setOpen(false);
      setPassword(''); // Reset password field
      onPartnerUpdated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Partner</DialogTitle>
          <DialogDescription>
            Update partner information. Leave password blank to keep current password.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editName">Name *</Label>
            <Input
              id="editName"
              type="text"
              placeholder="Enter partner's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone Number *</Label>
            <Input
              id="editPhone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPassword">New Password</Label>
            <Input
              id="editPassword"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Enter a new password only if you want to change it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editAddress">Address</Label>
            <Textarea
              id="editAddress"
              placeholder="Enter partner's address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              rows={3}
            />
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
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Partner
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartnerModal;
