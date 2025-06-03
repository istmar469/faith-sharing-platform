import { supabase } from '../integrations/supabase/client';
import { 
  MediaFile, 
  MediaQuota, 
  UnsplashImage, 
  UnsplashSearchResponse, 
  MediaLibraryFilters, 
  MediaLibraryResponse,
  VideoMetadata,
  ImageMetadata 
} from '../types/media';

// Environment variables for external APIs
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'demo-key';

class MediaService {
  // Unsplash API methods
  async searchUnsplashImages(query: string, page = 1, perPage = 20): Promise<UnsplashSearchResponse> {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching Unsplash images:', error);
      throw error;
    }
  }

  async downloadUnsplashImage(image: UnsplashImage, organizationId: string): Promise<MediaFile> {
    try {
      // Check quota first
      const canUpload = await this.checkQuota(organizationId, 'image', 0);
      if (!canUpload) {
        throw new Error('Image quota exceeded');
      }

      // Trigger download tracking (required by Unsplash API)
      await fetch(image.links.download_location, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      // Use the regular size URL for download
      const imageUrl = image.urls.regular;
      const fileName = `unsplash-${image.id}.jpg`;

      // Create media file record
      const mediaFile: Omit<MediaFile, 'id' | 'created_at' | 'updated_at'> = {
        organization_id: organizationId,
        file_name: fileName,
        file_path: imageUrl, // For Unsplash, we store the direct URL
        file_type: 'image',
        file_size: 0, // Unsplash doesn't provide file size
        mime_type: 'image/jpeg',
        width: image.width,
        height: image.height,
        alt_text: image.alt_description || image.description || '',
        caption: image.description || '',
        tags: image.tags?.map(tag => tag.title) || [],
        source_type: 'unsplash',
        source_url: image.links.html,
        source_id: image.id,
        is_active: true,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      // Use generic typing to avoid TypeScript errors before DB setup
      const { data, error } = await (supabase as any)
        .from('media_files')
        .insert(mediaFile)
        .select()
        .single();

      if (error) {
        console.error('Database error (media tables not created yet?):', error);
        throw new Error('Media management not set up yet. Please run the setup script.');
      }

      return data as MediaFile;
    } catch (error) {
      console.error('Error downloading Unsplash image:', error);
      throw error;
    }
  }

  // File upload methods
  async uploadFile(file: File, organizationId: string, onProgress?: (progress: number) => void): Promise<MediaFile> {
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      
      // Get metadata first
      let metadata: ImageMetadata | VideoMetadata;
      if (fileType === 'image') {
        metadata = await this.getImageMetadata(file);
      } else {
        metadata = await this.getVideoMetadata(file);
      }

      // Check quota
      const duration = 'duration' in metadata ? metadata.duration : 0;
      const canUpload = await this.checkQuota(organizationId, fileType, file.size, duration);
      if (!canUpload) {
        const quotaInfo = await this.getQuota(organizationId);
        if (fileType === 'image') {
          throw new Error(`Image limit reached (${quotaInfo.image_count}/${quotaInfo.image_limit})`);
        } else {
          const remainingMinutes = Math.floor((quotaInfo.video_duration_limit_seconds - quotaInfo.video_duration_seconds) / 60);
          throw new Error(`Video duration limit exceeded. Remaining: ${remainingMinutes} minutes`);
        }
      }

      // Generate unique file path
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${organizationId}/${fileType}s/${fileName}`;

      // Upload to Supabase Storage (remove onUploadProgress for now)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create thumbnail for videos
      let thumbnailPath: string | undefined;
      if (fileType === 'video') {
        try {
          thumbnailPath = await this.generateVideoThumbnail(file, organizationId);
        } catch (error) {
          console.warn('Failed to generate video thumbnail:', error);
        }
      }

      // Create media file record
      const mediaFile: Omit<MediaFile, 'id' | 'created_at' | 'updated_at'> = {
        organization_id: organizationId,
        file_name: file.name,
        file_path: publicUrl,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        width: metadata.width,
        height: metadata.height,
        duration: 'duration' in metadata ? metadata.duration : undefined,
        alt_text: '',
        caption: '',
        tags: [],
        source_type: 'upload',
        thumbnail_path: thumbnailPath,
        is_active: true,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      // Use generic typing to avoid TypeScript errors before DB setup
      const { data, error } = await (supabase as any)
        .from('media_files')
        .insert(mediaFile)
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('media').remove([filePath]);
        console.error('Database error (media tables not created yet?):', error);
        throw new Error('Media management not set up yet. Please run the setup script.');
      }

      return data as MediaFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Metadata extraction methods
  private async getImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private async getVideoMetadata(file: File): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: Math.floor(video.duration),
          size: file.size
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
      video.src = URL.createObjectURL(file);
    });
  }

  private async generateVideoThumbnail(file: File, organizationId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Capture frame at 1 second
      };

      video.onseeked = async () => {
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create thumbnail'));
            return;
          }

          try {
            const thumbnailPath = `${organizationId}/thumbnails/${Date.now()}-thumbnail.jpg`;
            
            const { error } = await supabase.storage
              .from('media')
              .upload(thumbnailPath, blob);

            if (error) {
              reject(error);
              return;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('media')
              .getPublicUrl(thumbnailPath);

            resolve(publicUrl);
          } catch (error) {
            reject(error);
          }
        }, 'image/jpeg', 0.8);
      };

      video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
      video.src = URL.createObjectURL(file);
    });
  }

  // Quota management
  async getQuota(organizationId: string): Promise<MediaQuota> {
    try {
      // Use generic typing to avoid TypeScript errors before DB setup
      const { data, error } = await (supabase as any)
        .from('media_quotas')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          // Create default quota
          const { data: newQuota, error: insertError } = await (supabase as any)
            .from('media_quotas')
            .insert({
              organization_id: organizationId,
              image_count: 0,
              image_limit: 250,
              video_duration_seconds: 0,
              video_duration_limit_seconds: 600, // 10 minutes
              storage_used_bytes: 0,
              storage_limit_bytes: 1073741824 // 1GB
            })
            .select()
            .single();

          if (insertError) {
            console.error('Database error (media tables not created yet?):', insertError);
            throw new Error('Media management not set up yet. Please run the setup script.');
          }

          return newQuota as MediaQuota;
        }
        console.error('Database error (media tables not created yet?):', error);
        throw new Error('Media management not set up yet. Please run the setup script.');
      }

      return data as MediaQuota;
    } catch (error) {
      console.error('Error getting quota:', error);
      // Return default quota if tables don't exist yet
      return {
        id: 'temp',
        organization_id: organizationId,
        image_count: 0,
        image_limit: 250,
        video_duration_seconds: 0,
        video_duration_limit_seconds: 600,
        storage_used_bytes: 0,
        storage_limit_bytes: 1073741824,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  async checkQuota(organizationId: string, fileType: 'image' | 'video', fileSize: number, duration = 0): Promise<boolean> {
    try {
      // Use generic typing to avoid TypeScript errors before DB setup
      const { data, error } = await (supabase as any).rpc('check_media_quota', {
        org_id: organizationId,
        file_type_param: fileType,
        file_size_param: fileSize,
        duration_param: duration
      });

      if (error) {
        console.warn('Quota check failed (DB not set up yet?), allowing upload:', error);
        return true; // Allow uploads if quota system isn't set up yet
      }

      return data === true;
    } catch (error) {
      console.warn('Error checking quota, allowing upload:', error);
      return true; // Default to allowing uploads if there's an error
    }
  }

  // Media library methods
  async getMediaLibrary(organizationId: string, filters: MediaLibraryFilters = {}): Promise<MediaLibraryResponse> {
    try {
      const { type = 'all', source = 'all', tags = [], search = '', page = 1, limit = 20 } = filters;

      // Use generic typing to avoid TypeScript errors before DB setup
      let query = (supabase as any)
        .from('media_files')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (type !== 'all') {
        query = query.eq('file_type', type);
      }

      if (source !== 'all') {
        query = query.eq('source_type', source);
      }

      if (tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      if (search) {
        query = query.or(`file_name.ilike.%${search}%,alt_text.ilike.%${search}%,caption.ilike.%${search}%`);
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const [{ data: files, error: filesError, count }, quota] = await Promise.all([
        query,
        this.getQuota(organizationId)
      ]);

      if (filesError) {
        console.error('Database error (media tables not created yet?):', filesError);
        throw new Error('Media management not set up yet. Please run the setup script.');
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        files: (files || []) as MediaFile[],
        total: count || 0,
        page,
        totalPages,
        quota
      };
    } catch (error) {
      console.error('Error getting media library:', error);
      // Return empty library if tables don't exist yet
      const quota = await this.getQuota(organizationId);
      return {
        files: [],
        total: 0,
        page: 1,
        totalPages: 0,
        quota
      };
    }
  }

  async updateMediaFile(id: string, updates: Partial<Pick<MediaFile, 'alt_text' | 'caption' | 'tags'>>): Promise<MediaFile> {
    // Use generic typing to avoid TypeScript errors before DB setup
    const { data, error } = await (supabase as any)
      .from('media_files')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error (media tables not created yet?):', error);
      throw new Error('Media management not set up yet. Please run the setup script.');
    }

    return data as MediaFile;
  }

  async deleteMediaFile(id: string): Promise<void> {
    // Use generic typing to avoid TypeScript errors before DB setup
    const { data: mediaFile, error: fetchError } = await (supabase as any)
      .from('media_files')
      .select('file_path, source_type, thumbnail_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Database error (media tables not created yet?):', fetchError);
      throw new Error('Media management not set up yet. Please run the setup script.');
    }

    // Delete from storage if it's an uploaded file
    if (mediaFile.source_type === 'upload') {
      const filePath = mediaFile.file_path.split('/').slice(-3).join('/'); // Extract path from URL
      await supabase.storage.from('media').remove([filePath]);

      // Delete thumbnail if exists
      if (mediaFile.thumbnail_path) {
        const thumbnailPath = mediaFile.thumbnail_path.split('/').slice(-3).join('/');
        await supabase.storage.from('media').remove([thumbnailPath]);
      }
    }

    // Delete from database
    const { error } = await (supabase as any)
      .from('media_files')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  validateFileType(file: File): boolean {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    return allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type);
  }

  validateFileSize(file: File): { valid: boolean; message?: string } {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB

    if (this.isImageFile(file)) {
      if (file.size > maxImageSize) {
        return { valid: false, message: 'Image must be smaller than 10MB' };
      }
    } else if (this.isVideoFile(file)) {
      if (file.size > maxVideoSize) {
        return { valid: false, message: 'Video must be smaller than 100MB' };
      }
    }

    return { valid: true };
  }
}

export const mediaService = new MediaService(); 