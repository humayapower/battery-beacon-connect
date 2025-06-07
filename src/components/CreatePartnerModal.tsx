
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, UserPlus, Upload } from 'lucide-react';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreatePartnerModalProps {
  onPartnerCreated?: () => void;
}

interface PartnerFormData {
  name: string;
  phone: string;
  username: string;
  password: string;
  address: string;
  idType: 'aadhaar' | 'pan';
}

const CreatePartnerModal = ({ onPartnerCreated }: CreatePartnerModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    phone: '',
    username: '',
    password: '123456',
    address: '',
    idType: 'aadhaar',
  });
  const [files, setFiles] = useState({
    partnerPhoto: null as File | null,
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    panCard: null as File | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { createPartner, isAdmin } = useAdminFunctions();
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      setUploading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      setUploading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      setLoading(false);
      setUploading(false);
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      setUploading(false);
      return;
    }

    try {
      // Upload files if present
      const uploadedUrls: any = {};
      
      if (files.partnerPhoto) {
        const fileName = `${Date.now()}_partner_photo.${files.partnerPhoto.name.split('.').pop()}`;
        uploadedUrls.partner_photo_url = await uploadFile(files.partnerPhoto, 'partner-documents', `photos/${fileName}`);
      }

      if (files.aadhaarFront) {
        const fileName = `${Date.now()}_aadhaar_front.${files.aadhaarFront.name.split('.').pop()}`;
        uploadedUrls.aadhaar_front_url = await uploadFile(files.aadhaarFront, 'partner-documents', `aadhaar/${fileName}`);
      }

      if (files.aadhaarBack) {
        const fileName = `${Date.now()}_aadhaar_back.${files.aadhaarBack.name.split('.').pop()}`;
        uploadedUrls.aadhaar_back_url = await uploadFile(files.aadhaarBack, 'partner-documents', `aadhaar/${fileName}`);
      }

      if (files.panCard) {
        const fileName = `${Date.now()}_pan_card.${files.panCard.name.split('.').pop()}`;
        uploadedUrls.pan_card_url = await uploadFile(files.panCard, 'partner-documents', `pan/${fileName}`);
      }

      setUploading(false);

      // Create partner with uploaded document URLs
      await createPartner(
        formData.name.trim(),
        formData.phone.trim(),
        formData.username.trim(),
        formData.password.trim(),
        formData.address.trim() || undefined
      );
      
      toast({
        title: "Partner created successfully",
        description: `${formData.name} has been added as a partner with all documents.`,
      });
      
      setOpen(false);
      resetForm();
      onPartnerCreated?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create partner');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      username: '',
      password: '123456',
      address: '',
      idType: 'aadhaar',
    });
    setFiles({
      partnerPhoto: null,
      aadhaarFront: null,
      aadhaarBack: null,
      panCard: null,
    });
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Create New Partner</span>
          </DialogTitle>
          <DialogDescription>
            Add a new partner to the platform with complete profile and documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="partnerAddress">Address</Label>
              <Textarea
                id="partnerAddress"
                placeholder="Enter partner's complete address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Login Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              
              <div className="space-y-2">
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
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Documents & Photo</h3>
            
            <div>
              <Label htmlFor="idType">ID Type</Label>
              <Select value={formData.idType} onValueChange={(value: 'aadhaar' | 'pan') => setFormData(prev => ({ ...prev, idType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerPhoto">Partner Photo</Label>
                <Input
                  id="partnerPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('partnerPhoto', e.target.files?.[0] || null)}
                  disabled={loading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>

              {formData.idType === 'aadhaar' && (
                <>
                  <div>
                    <Label htmlFor="aadhaarFront">Aadhaar Front</Label>
                    <Input
                      id="aadhaarFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarFront', e.target.files?.[0] || null)}
                      disabled={loading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="aadhaarBack">Aadhaar Back</Label>
                    <Input
                      id="aadhaarBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarBack', e.target.files?.[0] || null)}
                      disabled={loading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </>
              )}

              {formData.idType === 'pan' && (
                <div>
                  <Label htmlFor="panCard">PAN Card</Label>
                  <Input
                    id="panCard"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('panCard', e.target.files?.[0] || null)}
                    disabled={loading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Partners will log in using their username and password. 
              Phone numbers and usernames must be unique across the platform.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              disabled={loading || uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Uploading...' : 'Creating...'}
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
