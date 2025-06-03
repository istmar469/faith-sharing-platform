import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Search, Upload, Image, Video, Trash2, Edit3, Download,
  Filter, Grid, List, Plus, X, ExternalLink, AlertTriangle,
  CheckCircle, Clock, FileImage, Play, Eye, Copy
} from 'lucide-react';
import { 
  MediaFile, 
  MediaQuota, 
  UnsplashImage, 
  MediaLibraryFilters,
  MediaUploadProgress 
} from '../../types/media';
import { mediaService } from '../../services/mediaService';

interface MediaLibraryProps {
  organizationId: string;
  onSelectMedia?: (file: MediaFile) => void;
  allowedTypes?: ('image' | 'video')[];
  className?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  organizationId,
  onSelectMedia,
  allowedTypes = ['image', 'video'],
  className = ''
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'unsplash'>('library');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [quota, setQuota] = useState<MediaQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [filters, setFilters] = useState<MediaLibraryFilters>({ type: 'all', page: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Upload state
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Unsplash state
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  
  // Selected media for actions
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);

  // Load media library
  const loadMediaLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaService.getMediaLibrary(organizationId, {
        ...filters,
        search: searchQuery || undefined
      });
      setMediaFiles(response.files);
      setQuota(response.quota);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters, searchQuery]);

  useEffect(() => {
    loadMediaLibrary();
  }, [loadMediaLibrary]);

  // File upload handlers
  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!mediaService.validateFileType(file)) {
        setError(`${file.name}: Unsupported file type`);
        return false;
      }
      
      const sizeValidation = mediaService.validateFileSize(file);
      if (!sizeValidation.valid) {
        setError(`${file.name}: ${sizeValidation.message}`);
        return false;
      }
      
      return true;
    });

    validFiles.forEach(file => {
      const progress: MediaUploadProgress = {
        file,
        progress: 0,
        status: 'pending'
      };
      
      setUploadProgress(prev => [...prev, progress]);
      
      // Start upload
      uploadFile(file, progress);
    });
  }, [organizationId]);

  const uploadFile = async (file: File, progressItem: MediaUploadProgress) => {
    try {
      setUploadProgress(prev => 
        prev.map(p => p.file === file ? { ...p, status: 'uploading' } : p)
      );

      const mediaFile = await mediaService.uploadFile(
        file, 
        organizationId,
        (progress) => {
          setUploadProgress(prev => 
            prev.map(p => p.file === file ? { ...p, progress } : p)
          );
        }
      );

      setUploadProgress(prev => 
        prev.map(p => p.file === file ? { 
          ...p, 
          status: 'completed', 
          progress: 100,
          mediaFile 
        } : p)
      );

      // Refresh library
      loadMediaLibrary();
      
    } catch (error) {
      setUploadProgress(prev => 
        prev.map(p => p.file === file ? { 
          ...p, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        } : p)
      );
    }
  };

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Unsplash search
  const searchUnsplash = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setUnsplashLoading(true);
    try {
      const response = await mediaService.searchUnsplashImages(query);
      setUnsplashImages(response.results);
    } catch (error) {
      setError('Failed to search Unsplash images');
    } finally {
      setUnsplashLoading(false);
    }
  }, []);

  const downloadUnsplashImage = useCallback(async (image: UnsplashImage) => {
    try {
      setLoading(true);
      const mediaFile = await mediaService.downloadUnsplashImage(image, organizationId);
      setMediaFiles(prev => [mediaFile, ...prev]);
      loadMediaLibrary(); // Refresh to get updated quota
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download image');
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadMediaLibrary]);

  // Media actions
  const deleteMedia = useCallback(async (id: string) => {
    try {
      await mediaService.deleteMediaFile(id);
      setMediaFiles(prev => prev.filter(f => f.id !== id));
      loadMediaLibrary(); // Refresh quota
    } catch (error) {
      setError('Failed to delete media file');
    }
  }, [loadMediaLibrary]);

  const updateMedia = useCallback(async (id: string, updates: Partial<MediaFile>) => {
    try {
      const updatedFile = await mediaService.updateMediaFile(id, updates);
      setMediaFiles(prev => prev.map(f => f.id === id ? updatedFile : f));
      setEditingMedia(null);
    } catch (error) {
      setError('Failed to update media file');
    }
  }, []);

  const copyMediaUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  }, []);

  // Quota display component
  const QuotaDisplay = () => {
    if (!quota) return null;

    const imagePercentage = (quota.image_count / quota.image_limit) * 100;
    const videoMinutes = Math.floor(quota.video_duration_seconds / 60);
    const videoLimitMinutes = Math.floor(quota.video_duration_limit_seconds / 60);
    const videoPercentage = (quota.video_duration_seconds / quota.video_duration_limit_seconds) * 100;
    const storageGB = quota.storage_used_bytes / (1024 * 1024 * 1024);
    const storageLimitGB = quota.storage_limit_bytes / (1024 * 1024 * 1024);
    const storagePercentage = (quota.storage_used_bytes / quota.storage_limit_bytes) * 100;

    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Usage Quotas</h3>
        
        <div className="space-y-3">
          {/* Images */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Images</span>
              <span>{quota.image_count} / {quota.image_limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  imagePercentage > 90 ? 'bg-red-500' : 
                  imagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(imagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Video Duration</span>
              <span>{videoMinutes}min / {videoLimitMinutes}min</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  videoPercentage > 90 ? 'bg-red-500' : 
                  videoPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(videoPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Storage */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Storage</span>
              <span>{storageGB.toFixed(2)}GB / {storageLimitGB.toFixed(0)}GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  storagePercentage > 90 ? 'bg-red-500' : 
                  storagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Media grid component
  const MediaGrid = () => (
    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'}`}>
      {mediaFiles.map(file => (
        <div key={file.id} className="relative group border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <div className="aspect-square relative">
            {file.file_type === 'image' ? (
              <img 
                src={file.file_path} 
                alt={file.alt_text || file.file_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                {file.thumbnail_path ? (
                  <img 
                    src={file.thumbnail_path} 
                    alt={file.alt_text || file.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Play className="w-12 h-12 text-gray-400" />
                )}
              </div>
            )}
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectMedia?.(file)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Select"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => copyMediaUrl(file.file_path)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setEditingMedia(file)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => deleteMedia(file.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {mediaService.formatFileSize(file.file_size)}
              {file.file_type === 'video' && file.duration && (
                <span> • {mediaService.formatDuration(file.duration)}</span>
              )}
            </p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                file.source_type === 'upload' ? 'bg-blue-100 text-blue-800' :
                file.source_type === 'unsplash' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {file.source_type === 'upload' ? 'Uploaded' :
                 file.source_type === 'unsplash' ? 'Unsplash' : 'External'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Media Library</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'library' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileImage className="w-4 h-4 inline mr-2" />
            Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'upload' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('unsplash')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'unsplash' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ExternalLink className="w-4 h-4 inline mr-2" />
            Unsplash
          </button>
        </div>
      </div>

      {/* Quota Display */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <QuotaDisplay />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'library' && (
          <div className="h-full flex flex-col">
            {/* Search and filters */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search media files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.type || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>
              </div>
            </div>

            {/* Media grid */}
            <div className="flex-1 overflow-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading media...</p>
                  </div>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No media files found</p>
                    <p className="text-sm text-gray-400 mt-1">Upload some files or search Unsplash to get started</p>
                  </div>
                </div>
              ) : (
                <MediaGrid />
              )}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="h-full p-4">
            {/* Upload area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Media Files</h3>
              <p className="text-gray-500 mb-4">
                Drag and drop files here, or click to select files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload progress */}
            {uploadProgress.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
                {uploadProgress.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.file.name}</span>
                      <span className="text-xs text-gray-500">
                        {item.status === 'completed' ? 'Complete' :
                         item.status === 'error' ? 'Error' :
                         item.status === 'uploading' ? `${Math.round(item.progress)}%` :
                         'Pending'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error && (
                      <p className="text-xs text-red-600 mt-1">{item.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'unsplash' && (
          <div className="h-full flex flex-col">
            {/* Unsplash search */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Unsplash for free photos..."
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUnsplash(unsplashQuery)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => searchUnsplash(unsplashQuery)}
                  disabled={unsplashLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Unsplash results */}
            <div className="flex-1 overflow-auto p-4">
              {unsplashLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Searching Unsplash...</p>
                  </div>
                </div>
              ) : unsplashImages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Search for free photos from Unsplash</p>
                    <p className="text-sm text-gray-400 mt-1">Enter a search term above to find beautiful, free photos</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {unsplashImages.map(image => (
                    <div key={image.id} className="relative group border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative">
                        <img 
                          src={image.urls.small} 
                          alt={image.alt_description || image.description || ''}
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => downloadUnsplashImage(image)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Add to Library"
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <p className="text-xs text-gray-500">
                          by {image.user.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {image.width} × {image.height}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex-shrink-0 p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Media</h3>
              <button
                onClick={() => setEditingMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editingMedia.alt_text || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe this image..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <textarea
                  value={editingMedia.caption || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a caption..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingMedia.tags?.join(', ') || ''}
                  onChange={(e) => setEditingMedia({ 
                    ...editingMedia, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nature, landscape, mountain..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingMedia(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMedia(editingMedia.id, {
                  alt_text: editingMedia.alt_text,
                  caption: editingMedia.caption,
                  tags: editingMedia.tags
                })}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary; 