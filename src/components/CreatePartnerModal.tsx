
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
  const [files, setFiles] = useState({
    partnerPhoto: null as File | null,
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
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
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('File upload failed:', err);
      throw new Error(`Failed to upload ${file.name}: ${err.message}`);
    }
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
      const uploadedUrls: Record<string, string> = {};
      
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

      setUploading(false);

      // Create partner with uploaded document URLs
      const result = await createPartner(
        formData.name.trim(),
        formData.phone.trim(),
        formData.username.trim(),
        formData.password.trim(),
        formData.address.trim() || undefined
      );

      if (result.success) {
        // TODO: Update partner record with document URLs
        // For now, the partner is created successfully without document links
        // This can be enhanced later to store document URLs in a separate table
        
        toast({
          title: "Partner created successfully",
          description: `${formData.name} has been added as a partner.`,
        });
        
        setOpen(false);
        resetForm();
        onPartnerCreated?.();
      } else {
        throw new Error(result.error || 'Failed to create partner');
      }
    } catch (err: any) {
      console.error('Partner creation error:', err);
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
    });
    setFiles({
      partnerPhoto: null,
      aadhaarFront: null,
      aadhaarBack: null,
    });
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Create Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Partner</DialogTitle>
          <DialogDescription>
            Add a new partner to the platform with complete profile and documents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerName" className="font-medium">Full Name *</Label>
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
                <Label htmlFor="partnerPhone" className="font-medium">Phone Number *</Label>
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
              <Label htmlFor="partnerAddress" className="font-medium">Address</Label>
              <Textarea
                id="partnerAddress"
                placeholder="Enter partner's complete address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={loading}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="partnerPhoto" className="font-medium">Partner Photo</Label>
              <div className="mt-2">
                <Label
                  htmlFor="partnerPhoto"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {files.partnerPhoto ? files.partnerPhoto.name : 'Click to upload partner photo'}
                    </p>
                  </div>
                  <Input
                    id="partnerPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('partnerPhoto', e.target.files?.[0] || null)}
                    disabled={loading}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Login Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerUsername" className="font-medium">Username *</Label>
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
                <Label htmlFor="partnerPassword" className="font-medium">Password *</Label>
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

          {/* Aadhaar Documents */}
          <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold">Aadhaar Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aadhaarFront" className="font-medium">Aadhaar Front</Label>
                <div className="mt-2">
                  <Label
                    htmlFor="aadhaarFront"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {files.aadhaarFront ? files.aadhaarFront.name : 'Upload Aadhaar Front'}
                      </p>
                    </div>
                    <Input
                      id="aadhaarFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarFront', e.target.files?.[0] || null)}
                      disabled={loading}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="aadhaarBack" className="font-medium">Aadhaar Back</Label>
                <div className="mt-2">
                  <Label
                    htmlFor="aadhaarBack"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {files.aadhaarBack ? files.aadhaarBack.name : 'Upload Aadhaar Back'}
                      </p>
                    </div>
                    <Input
                      id="aadhaarBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('aadhaarBack', e.target.files?.[0] || null)}
                      disabled={loading}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Partners will log in using their username and password. 
              Phone numbers and usernames must be unique across the platform.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-1"
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
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
