
import { Config } from '@measured/puck';
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Footer, footerConfig } from './components/Footer';
import { Header, headerConfig } from './components/Header';
import { EnhancedHeader, enhancedHeaderConfig } from './components/EnhancedHeader';
import { EnhancedFooter, enhancedFooterConfig } from './components/EnhancedFooter';
import { ContactForm, contactFormConfig } from './components/ContactForm';
import { Testimonial, testimonialConfig } from './components/Testimonial';
import { Stats, statsConfig } from './components/Stats';
import { VideoEmbed, videoEmbedConfig } from './components/VideoEmbed';
import { ImageGallery, imageGalleryConfig } from './components/ImageGallery';

// Church Management Components
import { 
  ServiceTimes, 
  serviceTimesConfig,
  EventCalendar,
  eventCalendarConfig,
  ContactInfo,
  contactInfoConfig,
  ChurchStats,
  churchStatsConfig
} from './components/church';

export type Props = {
  Hero: React.ComponentProps<typeof Hero>;
  TextBlock: React.ComponentProps<typeof TextBlock>;
  Image: React.ComponentProps<typeof Image>;
  Footer: React.ComponentProps<typeof Footer>;
  Header: React.ComponentProps<typeof Header>;
  EnhancedHeader: React.ComponentProps<typeof EnhancedHeader>;
  EnhancedFooter: React.ComponentProps<typeof EnhancedFooter>;
  ContactForm: React.ComponentProps<typeof ContactForm>;
  Testimonial: React.ComponentProps<typeof Testimonial>;
  Stats: React.ComponentProps<typeof Stats>;
  VideoEmbed: React.ComponentProps<typeof VideoEmbed>;
  ImageGallery: React.ComponentProps<typeof ImageGallery>;
  
  // Church Components
  ServiceTimes: React.ComponentProps<typeof ServiceTimes>;
  EventCalendar: React.ComponentProps<typeof EventCalendar>;
  ContactInfo: React.ComponentProps<typeof ContactInfo>;
  ChurchStats: React.ComponentProps<typeof ChurchStats>;
};

export const puckConfig: Config<Props> = {
  components: {
    Hero: heroConfig,
    TextBlock: textBlockConfig,
    Image: imageConfig,
    Footer: footerConfig,
    Header: headerConfig,
    EnhancedHeader: enhancedHeaderConfig,
    EnhancedFooter: enhancedFooterConfig,
    ContactForm: contactFormConfig,
    Testimonial: testimonialConfig,
    Stats: statsConfig,
    VideoEmbed: videoEmbedConfig,
    ImageGallery: imageGalleryConfig,
    
    // Church Management Components
    ServiceTimes: serviceTimesConfig,
    EventCalendar: eventCalendarConfig,
    ContactInfo: contactInfoConfig,
    ChurchStats: churchStatsConfig,
  },
  categories: {
    layout: {
      components: ["Hero", "Header", "EnhancedHeader", "Footer", "EnhancedFooter"]
    },
    content: {
      components: ["TextBlock", "Image", "VideoEmbed", "ImageGallery"]
    },
    interactive: {
      components: ["ContactForm", "Testimonial", "Stats"]
    },
    church: {
      title: "Church Management",
      components: ["ServiceTimes", "EventCalendar", "ContactInfo", "ChurchStats"]
    }
  }
};
