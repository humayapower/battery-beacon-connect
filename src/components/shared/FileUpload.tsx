
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  required?: boolean;
  value?: string;
  onChange: (url: string | null) => void;
  accept?: string;
  bucketName?: string;
}

const FileUpload = ({ 
  label, 
  required = false, 
  value, 
  onChange, 
  accept = "image/*",
  bucketName = "customer-documents"
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onChange(data.publicUrl);

      toast({
        title: "File uploaded successfully",
        description: "Your file has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    if (preview) {
      window.open(preview, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`file-${label}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {preview ? (
        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
          <img 
            src={preview} 
            alt={label}
            className="w-12 h-12 object-cover rounded"
          />
          <div className="flex-1">
            <p className="text-sm text-gray-600">File uploaded</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG, JPEG up to 10MB
            </p>
          </div>
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        id={`file-${label}`}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
