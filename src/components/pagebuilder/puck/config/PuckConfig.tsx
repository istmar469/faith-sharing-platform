
import { Config } from '@measured/puck';
import { ComponentConfig } from '@measured/puck';

// Basic Components
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Header, headerConfig } from './components/Header';
import { Footer, footerConfig } from './components/Footer';
import { Stats, statsConfig } from './components/Stats';
import { Testimonial, testimonialConfig } from './components/Testimonial';
import { ContactForm, contactFormConfig } from './components/ContactForm';
import { VideoEmbed, videoEmbedConfig } from './components/VideoEmbed';
import { ImageGallery, imageGalleryConfig } from './components/ImageGallery';

// Enhanced Components
import { EnhancedHeader, enhancedHeaderConfig } from './components/EnhancedHeader';
import { EnhancedFooter, enhancedFooterConfig } from './components/EnhancedFooter';

// Church Components
import { 
  ServiceTimes, 
  serviceTimesConfig,
  ContactInfo,
  contactInfoConfig,
  ChurchStats,
  churchStatsConfig,
  EventCalendar,
  eventCalendarConfig,
  EnhancedEventCalendar,
  enhancedEventCalendarConfig
} from './components/church';

export type Props = {
  Hero: React.ComponentProps<typeof Hero>;
  TextBlock: React.ComponentProps<typeof TextBlock>;
  Image: React.ComponentProps<typeof Image>;
  Header: React.ComponentProps<typeof Header>;
  Footer: React.ComponentProps<typeof Footer>;
  Stats: React.ComponentProps<typeof Stats>;
  Testimonial: React.ComponentProps<typeof Testimonial>;
  ContactForm: React.ComponentProps<typeof ContactForm>;
  VideoEmbed: React.ComponentProps<typeof VideoEmbed>;
  ImageGallery: React.ComponentProps<typeof ImageGallery>;
  EnhancedHeader: React.ComponentProps<typeof EnhancedHeader>;
  EnhancedFooter: React.ComponentProps<typeof EnhancedFooter>;
  ServiceTimes: React.ComponentProps<typeof ServiceTimes>;
  ContactInfo: React.ComponentProps<typeof ContactInfo>;
  ChurchStats: React.ComponentProps<typeof ChurchStats>;
  EventCalendar: React.ComponentProps<typeof EventCalendar>;
  EnhancedEventCalendar: React.ComponentProps<typeof EnhancedEventCalendar>;
};

export const puckConfig: Config<Props> = {
  components: {
    // Basic Components
    Hero: heroConfig as ComponentConfig<Props['Hero']>,
    TextBlock: textBlockConfig as ComponentConfig<Props['TextBlock']>,
    Image: imageConfig as ComponentConfig<Props['Image']>,
    Header: headerConfig as ComponentConfig<Props['Header']>,
    Footer: footerConfig as ComponentConfig<Props['Footer']>,
    Stats: statsConfig as ComponentConfig<Props['Stats']>,
    Testimonial: testimonialConfig as ComponentConfig<Props['Testimonial']>,
    ContactForm: contactFormConfig as ComponentConfig<Props['ContactForm']>,
    VideoEmbed: videoEmbedConfig as ComponentConfig<Props['VideoEmbed']>,
    ImageGallery: imageGalleryConfig as ComponentConfig<Props['ImageGallery']>,
    
    // Enhanced Components
    EnhancedHeader: enhancedHeaderConfig as ComponentConfig<Props['EnhancedHeader']>,
    EnhancedFooter: enhancedFooterConfig as ComponentConfig<Props['EnhancedFooter']>,
    
    // Church Components
    ServiceTimes: serviceTimesConfig as ComponentConfig<Props['ServiceTimes']>,
    ContactInfo: contactInfoConfig as ComponentConfig<Props['ContactInfo']>,
    ChurchStats: churchStatsConfig as ComponentConfig<Props['ChurchStats']>,
    EventCalendar: eventCalendarConfig as ComponentConfig<Props['EventCalendar']>,
    EnhancedEventCalendar: enhancedEventCalendarConfig as ComponentConfig<Props['EnhancedEventCalendar']>,
  },
  categories: {
    layout: {
      components: ['Header', 'Footer', 'EnhancedHeader', 'EnhancedFooter']
    },
    content: {
      components: ['Hero', 'TextBlock', 'Image', 'Stats', 'Testimonial', 'VideoEmbed', 'ImageGallery']
    },
    forms: {
      components: ['ContactForm']
    },
    church: {
      title: 'Church Components',
      components: ['ServiceTimes', 'ContactInfo', 'ChurchStats', 'EventCalendar', 'EnhancedEventCalendar']
    }
  }
};
