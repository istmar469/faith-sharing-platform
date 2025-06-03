import { useState, useEffect } from 'react';
import { SiteSettings } from '@/services/siteSettings';

export interface LayoutSettings {
  content_width: 'boxed' | 'full-width' | 'wide';
  max_content_width: string;
  container_padding: string;
  enable_animations: boolean;
}

export interface UseLayoutSettingsReturn {
  layoutSettings: LayoutSettings;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;
  getContainerClasses: () => string;
  getContentClasses: () => string;
  isFullWidth: boolean;
  isBoxed: boolean;
  isWide: boolean;
}

const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  content_width: 'boxed',
  max_content_width: '1200px', 
  container_padding: '1rem',
  enable_animations: true
};

export const useLayoutSettings = (
  siteSettings?: SiteSettings | null,
  overrides?: Partial<LayoutSettings>
): UseLayoutSettingsReturn => {
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(() => {
    const config = siteSettings?.layout_config;
    return {
      content_width: config?.content_width || DEFAULT_LAYOUT_SETTINGS.content_width,
      max_content_width: config?.max_content_width || DEFAULT_LAYOUT_SETTINGS.max_content_width,
      container_padding: config?.container_padding || DEFAULT_LAYOUT_SETTINGS.container_padding,
      enable_animations: config?.enable_animations ?? DEFAULT_LAYOUT_SETTINGS.enable_animations,
      ...overrides
    };
  });

  useEffect(() => {
    if (siteSettings?.layout_config) {
      const config = siteSettings.layout_config;
      setLayoutSettings(prev => ({
        ...prev,
        content_width: config.content_width || prev.content_width,
        max_content_width: config.max_content_width || prev.max_content_width,
        container_padding: config.container_padding || prev.container_padding,
        enable_animations: config.enable_animations ?? prev.enable_animations,
        ...overrides
      }));
    }
  }, [siteSettings, overrides]);

  const updateLayoutSettings = (newSettings: Partial<LayoutSettings>) => {
    setLayoutSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getContainerClasses = () => {
    const { content_width } = layoutSettings;
    
    switch (content_width) {
      case 'full-width':
        return 'w-full';
      case 'wide':
        return 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      case 'boxed':
      default:
        return 'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  const getContentClasses = () => {
    const { content_width, enable_animations } = layoutSettings;
    
    const baseClasses = 'w-full';
    const animationClasses = enable_animations ? 'transition-all duration-300 ease-in-out' : '';
    
    switch (content_width) {
      case 'full-width':
        return `${baseClasses} ${animationClasses}`.trim();
      case 'wide':
        return `${baseClasses} ${animationClasses}`.trim();
      case 'boxed':
      default:
        return `${baseClasses} ${animationClasses}`.trim();
    }
  };

  const isFullWidth = layoutSettings.content_width === 'full-width';
  const isBoxed = layoutSettings.content_width === 'boxed';
  const isWide = layoutSettings.content_width === 'wide';

  return {
    layoutSettings,
    updateLayoutSettings,
    getContainerClasses,
    getContentClasses,
    isFullWidth,
    isBoxed,
    isWide
  };
}; 