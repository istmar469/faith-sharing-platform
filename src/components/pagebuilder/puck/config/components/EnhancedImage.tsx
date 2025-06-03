import React, { useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Image as ImageIcon, ExternalLink, Upload } from 'lucide-react';
import MediaLibrary from '../../../MediaLibrary';
import { MediaFile } from '../../../../../types/media';

export type EnhancedImageProps = {
  src?: string;
  alt?: string;
  caption?: string;
  width?: 'auto' | 'full' | 'sm' | 'md' | 'lg' | 'xl';
  alignment?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  aspectRatio?: 'auto' | 'square' | '16:9' | '4:3' | '3:2' | '21:9';
  link?: string;
  openInNewTab?: boolean;
  lazyLoad?: boolean;
};

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src = '',
  alt = '',
  caption = '',
  width = 'full',
  alignment = 'center',
  borderRadius = 'none',
  shadow = 'none',
  objectFit = 'cover',
  aspectRatio = 'auto',
  link = '',
  openInNewTab = false,
  lazyLoad = true
}) => {
  const getWidthClass = () => {
    switch (width) {
      case 'auto': return 'w-auto';
      case 'sm': return 'w-48';
      case 'md': return 'w-64';
      case 'lg': return 'w-80';
      case 'xl': return 'w-96';
      case 'full':
      default: return 'w-full';
    }
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'center':
      default: return 'text-center';
    }
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      case 'none':
      default: return '';
    }
  };

  const getShadowClass = () => {
    switch (shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      case 'none':
      default: return '';
    }
  };

  const getObjectFitClass = () => {
    switch (objectFit) {
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      case 'scale-down': return 'object-scale-down';
      case 'none': return 'object-none';
      case 'cover':
      default: return 'object-cover';
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      case '21:9': return 'aspect-[21/9]';
      case 'auto':
      default: return '';
    }
  };

  if (!src) {
    return (
      <div className={`${getAlignmentClass()}`}>
        <div className={`inline-flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 p-8 ${getWidthClass()} ${getBorderRadiusClass()} min-h-[200px]`}>
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No image selected</p>
            <p className="text-gray-400 text-xs mt-1">Configure this component to add an image</p>
          </div>
        </div>
      </div>
    );
  }

  const imageElement = (
    <img
      src={src}
      alt={alt}
      loading={lazyLoad ? 'lazy' : 'eager'}
      className={`${getWidthClass()} ${getBorderRadiusClass()} ${getShadowClass()} ${getObjectFitClass()} ${getAspectRatioClass()}`}
    />
  );

  const imageWithCaption = (
    <figure className={`${getAlignmentClass()}`}>
      {link ? (
        <a 
          href={link} 
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : ''}
          className="inline-block"
        >
          {imageElement}
        </a>
      ) : (
        imageElement
      )}
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );

  return imageWithCaption;
};

// Custom field component for image selection
const ImageSelector: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  organizationId?: string;
}> = ({ value = '', onChange, organizationId = '' }) => {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(value);

  const handleMediaSelect = (file: MediaFile) => {
    onChange(file.file_path);
    setShowMediaLibrary(false);
  };

  const handleUrlSubmit = () => {
    onChange(customUrl);
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative">
          <img 
            src={value} 
            alt="Selected image" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <button
          onClick={() => setShowMediaLibrary(true)}
          className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose from Library
        </button>

        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Use Custom URL
        </button>
      </div>

      {showUrlInput && (
        <div className="space-y-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleUrlSubmit}
              className="flex-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Apply
            </button>
            <button
              onClick={() => setShowUrlInput(false)}
              className="flex-1 px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Image</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MediaLibrary
                organizationId={organizationId}
                onSelectMedia={handleMediaSelect}
                allowedTypes={['image']}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const enhancedImageConfig: ComponentConfig<EnhancedImageProps> = {
  fields: {
    src: {
      type: 'custom',
      render: ({ name, onChange, value }) => (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Source
          </label>
          <ImageSelector
            value={value as string}
            onChange={onChange}
            organizationId="test-org-id" // TODO: Get from context
          />
        </div>
      )
    },
    alt: {
      type: 'text',
      label: 'Alt Text (for accessibility)'
    },
    caption: {
      type: 'textarea',
      label: 'Caption'
    },
    width: {
      type: 'select',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Full Width', value: 'full' },
        { label: 'Small (192px)', value: 'sm' },
        { label: 'Medium (256px)', value: 'md' },
        { label: 'Large (320px)', value: 'lg' },
        { label: 'Extra Large (384px)', value: 'xl' }
      ]
    },
    alignment: {
      type: 'radio',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    borderRadius: {
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Full (Circle)', value: 'full' }
      ]
    },
    shadow: {
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        { label: 'Extra Large', value: 'xl' }
      ]
    },
    objectFit: {
      type: 'select',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
        { label: 'Scale Down', value: 'scale-down' },
        { label: 'None', value: 'none' }
      ]
    },
    aspectRatio: {
      type: 'select',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Square (1:1)', value: 'square' },
        { label: 'Video (16:9)', value: '16:9' },
        { label: 'Classic (4:3)', value: '4:3' },
        { label: 'Photo (3:2)', value: '3:2' },
        { label: 'Cinema (21:9)', value: '21:9' }
      ]
    },
    link: {
      type: 'text',
      label: 'Link URL (optional)'
    },
    openInNewTab: {
      type: 'radio',
      options: [
        { label: 'Same Tab', value: false },
        { label: 'New Tab', value: true }
      ]
    },
    lazyLoad: {
      type: 'radio',
      options: [
        { label: 'Enable Lazy Loading', value: true },
        { label: 'Disable Lazy Loading', value: false }
      ]
    }
  },
  defaultProps: {
    src: '',
    alt: '',
    caption: '',
    width: 'full',
    alignment: 'center',
    borderRadius: 'none',
    shadow: 'none',
    objectFit: 'cover',
    aspectRatio: 'auto',
    link: '',
    openInNewTab: false,
    lazyLoad: true
  },
  render: (props) => <EnhancedImage {...props} />
};

export default EnhancedImage; 