
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageProps {
  src: string;
  alt: string;
  width?: 'full' | 'half' | 'auto';
  isEditable?: boolean;
  onSrcChange?: (src: string) => void;
  onAltChange?: (alt: string) => void;
}

const ImageElement: React.FC<ImageProps> = ({ 
  src, 
  alt = 'Image',
  width = 'full',
  isEditable = false,
  onSrcChange,
  onAltChange 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [imageAlt, setImageAlt] = useState(alt);
  const { toast } = useToast();

  const getWidthClass = () => {
    switch(width) {
      case 'full': return 'w-full';
      case 'half': return 'w-1/2';
      case 'auto': return 'w-auto';
      default: return 'w-full';
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if we have an organization ID
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to upload images",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      
      // Create the bucket if it doesn't exist
      try {
        const { error: bucketError } = await supabase.storage.createBucket('images', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      } catch (err) {
        // Bucket might already exist, continue anyway
        console.log("Bucket might already exist:", err);
      }

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      setImageUrl(newUrl);
      if (onSrcChange) {
        onSrcChange(newUrl);
      }
      
      setIsDialogOpen(false);
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded",
      });
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = () => {
    if (onSrcChange && imageUrl !== src) {
      onSrcChange(imageUrl);
    }
    if (onAltChange && imageAlt !== alt) {
      onAltChange(imageAlt);
    }
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    if (isEditable) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div 
        className={`${getWidthClass()} h-auto ${isEditable ? 'cursor-pointer hover:opacity-80' : ''} mx-auto relative`}
        onClick={handleOpenDialog}
      >
        {!src && (
          <div className="bg-gray-100 aspect-video flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">{isEditable ? "Click to add image" : "No image"}</p>
            </div>
          </div>
        )}
        {src && <img src={src} alt={alt} className="max-w-full h-auto" />}
        {isEditable && <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
          <span className="text-white opacity-0 hover:opacity-100">Edit Image</span>
        </div>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Alt Text</label>
              <Input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Enter alt text"
              />
            </div>

            <div className="border rounded-md p-4">
              <label className="block text-sm font-medium mb-2">Or upload an image</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="flex-1"
                />
              </div>
              {uploading && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageElement;
