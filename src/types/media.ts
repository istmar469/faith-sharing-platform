export interface MediaFile {
  id: string;
  organization_id: string;
  file_name: string;
  file_path: string;
  file_type: 'image' | 'video';
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number; // For videos, in seconds
  alt_text?: string;
  caption?: string;
  tags?: string[];
  source_type: 'upload' | 'unsplash' | 'external';
  source_url?: string;
  source_id?: string;
  thumbnail_path?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MediaQuota {
  id: string;
  organization_id: string;
  image_count: number;
  image_limit: number;
  video_duration_seconds: number;
  video_duration_limit_seconds: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface UnsplashImage {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash?: string;
  description?: string;
  alt_description?: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    first_name: string;
    last_name?: string;
    profile_image: {
      small: string;
      medium: string;
      large: string;
    };
    links: {
      self: string;
      html: string;
    };
  };
  tags?: Array<{
    type: string;
    title: string;
  }>;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export interface MediaUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  mediaFile?: MediaFile;
}

export interface MediaLibraryFilters {
  type?: 'image' | 'video' | 'all';
  source?: 'upload' | 'unsplash' | 'external' | 'all';
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface MediaLibraryResponse {
  files: MediaFile[];
  total: number;
  page: number;
  totalPages: number;
  quota: MediaQuota;
}

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
  size: number; // file size in bytes
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number; // file size in bytes
} 