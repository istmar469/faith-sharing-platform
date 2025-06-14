
import React from 'react';
import { ComponentConfig } from '@measured/puck';

export interface VideoEmbedProps {
  url?: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  url = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  title = 'Video',
  aspectRatio = '16:9'
}) => {
  const getEmbedUrl = (url: string) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URLs to embed URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square'
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden`}>
        <iframe
          src={getEmbedUrl(url)}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export const videoEmbedConfig: ComponentConfig<VideoEmbedProps> = {
  fields: {
    url: {
      type: 'text',
      label: 'Video URL'
    },
    title: {
      type: 'text',
      label: 'Video Title'
    },
    aspectRatio: {
      type: 'select',
      label: 'Aspect Ratio',
      options: [
        { label: '16:9', value: '16:9' },
        { label: '4:3', value: '4:3' },
        { label: '1:1', value: '1:1' }
      ]
    }
  },
  defaultProps: {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Video',
    aspectRatio: '16:9'
  },
  render: (props) => <VideoEmbed {...props} />
};
