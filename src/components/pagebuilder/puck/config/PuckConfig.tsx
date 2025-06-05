
import React from 'react';
import { Config } from '@measured/puck';
import { Props } from './types';


// Basic Components
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Card, cardConfig } from './components/Card';
import Header, { headerConfig } from './components/Header';
import { flexLayoutConfig } from './components/FlexLayout';
import Footer, { footerConfig } from './components/Footer';
import { statsConfig } from './components/Stats';
import { testimonialConfig } from './components/Testimonial';
import { ContactForm, ContactFormProps } from './components/ContactForm';
import { videoEmbedConfig } from './components/VideoEmbed';
import ImageGallery, { imageGalleryConfig } from './components/ImageGallery';
import { GridBlock, gridBlockConfig, GridBlockProps } from './components/GridBlock';

// Flex Item Support
import { withFlexItemSupport } from './components/FlexItemWrapper';

// Church Components
import { 
  ServiceTimes, 
  serviceTimesConfig,
  ContactInfo,
  contactInfoConfig,
  ChurchStats,
  churchStatsConfig,
  EventCalendar,
  eventCalendarConfig
} from './components/church';

export const puckConfig: Config<Props> = {
  components: {
    // Layout Components (no flex support - they control layout)
    Header: headerConfig,
    FlexLayout: flexLayoutConfig,
    GridBlock: gridBlockConfig,
    Footer: footerConfig,
    
    // Content Components (with flex item support)
    Hero: withFlexItemSupport(heroConfig, 'Hero'),
    TextBlock: withFlexItemSupport(textBlockConfig, 'TextBlock'),
    Image: withFlexItemSupport(imageConfig, 'Image'),
    Card: withFlexItemSupport(cardConfig, 'Card'),
    Stats: withFlexItemSupport(statsConfig, 'Stats'),
    Testimonial: withFlexItemSupport(testimonialConfig, 'Testimonial'),
    VideoEmbed: withFlexItemSupport(videoEmbedConfig, 'VideoEmbed'),
    ImageGallery: withFlexItemSupport(imageGalleryConfig, 'ImageGallery'),
    
    // Form Components (with flex item support)
    ContactForm: withFlexItemSupport(ContactForm, 'ContactForm'),
    
    // Church Components (with flex item support)
    ServiceTimes: withFlexItemSupport(serviceTimesConfig, 'ServiceTimes'),
    ContactInfo: withFlexItemSupport(contactInfoConfig, 'ContactInfo'),
    ChurchStats: withFlexItemSupport(churchStatsConfig, 'ChurchStats'),
    EventCalendar: withFlexItemSupport(eventCalendarConfig, 'EventCalendar'),
  },
  categories: {
    layout: {
      components: ['Header', 'FlexLayout', 'GridBlock', 'Footer']
    },
    content: {
      components: ['Hero', 'TextBlock', 'Image', 'Card', 'Stats', 'Testimonial', 'VideoEmbed', 'ImageGallery']
    },
    forms: {
      components: ['ContactForm']
    },
    church: {
      title: 'Church Components',
      components: ['ServiceTimes', 'ContactInfo', 'ChurchStats', 'EventCalendar']
    }
  }
};

// Export function to create filtered config based on organization permissions
export const createFilteredPuckConfig = (enabledComponents: string[]): Config<Props> => {
  const filteredComponents: any = {};
  const filteredCategories: any = { ...puckConfig.categories };

  // Always include basic components with safe configurations
  Object.entries(puckConfig.components).forEach(([key, value]) => {
    if (['Hero', 'TextBlock', 'Image', 'Card', 'Header', 'FlexLayout', 'Footer', 'Stats', 'Testimonial', 'ContactForm', 'VideoEmbed', 'ImageGallery', 'GridBlock'].includes(key)) {
      filteredComponents[key] = value;
    } else if (enabledComponents.includes(key)) {
      filteredComponents[key] = value;
    }
  });

  // Filter church category to only show enabled components
  if (filteredCategories.church) {
    filteredCategories.church.components = filteredCategories.church.components.filter(
      (component: string) => enabledComponents.includes(component) || 
      ['ServiceTimes', 'ContactInfo'].includes(component) // Basic tier components
    );
  }

  return {
    components: filteredComponents,
    categories: filteredCategories
  };
};

export type { Props };
