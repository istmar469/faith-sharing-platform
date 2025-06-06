import React from 'react';
import { Config } from '@measured/puck';
import { Props } from './types';


// Basic Components
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Card, cardConfig } from './components/Card';
// import Header, { headerConfig } from './components/Header'; // Disabled - SubdomainLayout provides site navigation
import { flexLayoutConfig } from './components/FlexLayout';
import Footer, { footerConfig } from './components/Footer';
import { statsConfig } from './components/Stats';
import { testimonialConfig } from './components/Testimonial';
import { ContactForm, ContactFormProps } from './components/ContactForm';
import { videoEmbedConfig } from './components/VideoEmbed';
import ImageGallery, { imageGalleryConfig } from './components/ImageGallery';
import { GridBlock, gridBlockConfig, GridBlockProps } from './components/GridBlock';

// Temporarily disable flex item support to debug drag crashes
// import { withFlexItemSupport } from './components/FlexItemWrapper';

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
    // Layout Components
    FlexLayout: flexLayoutConfig,
    GridBlock: gridBlockConfig,
    Footer: footerConfig,
    
    // Content Components
    Hero: heroConfig,
    TextBlock: textBlockConfig,
    Image: imageConfig,
    Card: cardConfig,
    Stats: statsConfig,
    Testimonial: testimonialConfig,
    VideoEmbed: videoEmbedConfig,
    ImageGallery: imageGalleryConfig,
    
    // Form Components
    ContactForm: ContactForm,
    
    // Church Components
    ServiceTimes: serviceTimesConfig,
    ContactInfo: contactInfoConfig,
    ChurchStats: churchStatsConfig,
    EventCalendar: eventCalendarConfig,
  },
  categories: {
    layout: {
      components: ['FlexLayout', 'GridBlock', 'Footer']
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
    if (['Hero', 'TextBlock', 'Image', 'Card', 'FlexLayout', 'Footer', 'Stats', 'Testimonial', 'ContactForm', 'VideoEmbed', 'ImageGallery', 'GridBlock'].includes(key)) {
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
