import React from 'react';
import { Config } from '@measured/puck';
import { ComponentConfig } from '@measured/puck';

// Basic Components
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Card, cardConfig } from './components/Card';
import Header, { headerConfig } from './components/Header';
import EnhancedHeader, { enhancedHeaderConfig } from './components/EnhancedHeader';
import Footer, { footerConfig } from './components/Footer';
import { Stats, statsConfig } from './components/Stats';
import { Testimonial, testimonialConfig } from './components/Testimonial';
import { ContactForm, ContactFormProps } from './components/ContactForm';
import { VideoEmbed, videoEmbedConfig } from './components/VideoEmbed';
import ImageGallery, { imageGalleryConfig } from './components/ImageGallery';

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

export type Props = {
  Hero: React.ComponentProps<typeof Hero>;
  TextBlock: React.ComponentProps<typeof TextBlock>;
  Image: React.ComponentProps<typeof Image>;
  Card: React.ComponentProps<typeof Card>;
  Header: React.ComponentProps<typeof Header>;
  EnhancedHeader: React.ComponentProps<typeof EnhancedHeader>;
  Footer: React.ComponentProps<typeof Footer>;
  Stats: React.ComponentProps<typeof Stats>;
  Testimonial: React.ComponentProps<typeof Testimonial>;
  ContactForm: ContactFormProps;
  VideoEmbed: React.ComponentProps<typeof VideoEmbed>;
  ImageGallery: React.ComponentProps<typeof ImageGallery>;
  ServiceTimes: React.ComponentProps<typeof ServiceTimes>;
  ContactInfo: React.ComponentProps<typeof ContactInfo>;
  ChurchStats: React.ComponentProps<typeof ChurchStats>;
  EventCalendar: React.ComponentProps<typeof EventCalendar>;
};

// Safe wrapper to ensure all component configs have proper structure
const safeComponentConfig = (config: any, componentName: string): ComponentConfig<any> => {
  return {
    ...config,
    defaultProps: config.defaultProps || {},
    render: config.render || ((props: any) => {
      console.warn(`${componentName}: Missing render function, using fallback`);
      return React.createElement('div', { 
        className: 'p-4 border border-dashed border-gray-300 text-gray-500 text-center' 
      }, `${componentName} Component`);
    })
  };
};

export const puckConfig: Config<Props> = {
  components: {
    // Basic Components (always available) - all with safe configurations
    Hero: safeComponentConfig(heroConfig, 'Hero') as ComponentConfig<Props['Hero']>,
    TextBlock: safeComponentConfig(textBlockConfig, 'TextBlock') as ComponentConfig<Props['TextBlock']>,
    Image: safeComponentConfig(imageConfig, 'Image') as ComponentConfig<Props['Image']>,
    Card: safeComponentConfig(cardConfig, 'Card') as ComponentConfig<Props['Card']>,
    Header: safeComponentConfig(headerConfig, 'Header') as ComponentConfig<Props['Header']>,
    EnhancedHeader: safeComponentConfig(enhancedHeaderConfig, 'EnhancedHeader') as ComponentConfig<Props['EnhancedHeader']>,
    Footer: safeComponentConfig(footerConfig, 'Footer') as ComponentConfig<Props['Footer']>,
    Stats: safeComponentConfig(statsConfig, 'Stats') as ComponentConfig<Props['Stats']>,
    Testimonial: safeComponentConfig(testimonialConfig, 'Testimonial') as ComponentConfig<Props['Testimonial']>,
    ContactForm: safeComponentConfig(ContactForm, 'ContactForm') as ComponentConfig<Props['ContactForm']>,
    VideoEmbed: safeComponentConfig(videoEmbedConfig, 'VideoEmbed') as ComponentConfig<Props['VideoEmbed']>,
    ImageGallery: safeComponentConfig(imageGalleryConfig, 'ImageGallery') as ComponentConfig<Props['ImageGallery']>,
    
    // Church Components (tier-based availability) - all with safe configurations
    ServiceTimes: safeComponentConfig(serviceTimesConfig, 'ServiceTimes') as ComponentConfig<Props['ServiceTimes']>,
    ContactInfo: safeComponentConfig(contactInfoConfig, 'ContactInfo') as ComponentConfig<Props['ContactInfo']>,
    ChurchStats: safeComponentConfig(churchStatsConfig, 'ChurchStats') as ComponentConfig<Props['ChurchStats']>,
    EventCalendar: safeComponentConfig(eventCalendarConfig, 'EventCalendar') as ComponentConfig<Props['EventCalendar']>,
  },
  categories: {
    layout: {
      components: ['Header', 'EnhancedHeader', 'Footer']
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
    if (['Hero', 'TextBlock', 'Image', 'Card', 'Header', 'EnhancedHeader', 'Footer', 'Stats', 'Testimonial', 'ContactForm', 'VideoEmbed', 'ImageGallery'].includes(key)) {
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
