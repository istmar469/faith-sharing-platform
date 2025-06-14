import React from 'react';
import { ComponentConfig } from '@measured/puck';
// Temporarily disabled to debug drag crashes
// import { FlexItemProps } from './components/FlexItemWrapper';

export interface Props {
  // All component props
  Hero: React.ComponentProps<any>;
  TextBlock: React.ComponentProps<any>;
  Image: React.ComponentProps<any>;
  Card: React.ComponentProps<any>;
  // Header: React.ComponentProps<any>; // Disabled - SubdomainLayout provides site navigation
  FlexLayout: any;
  MultiColumnLayout: any;
  GridBlock: any;
  Footer: React.ComponentProps<any>;
  Stats: any;
  Testimonial: any;
  ContactForm: any;
  VideoEmbed: any;
  ImageGallery: React.ComponentProps<any>;
  SimpleHeader: React.ComponentProps<any>;
  Logo: React.ComponentProps<any>;
  Navigation: React.ComponentProps<any>;
  SmartNavigation: React.ComponentProps<any>;
  Button: React.ComponentProps<any>;
  SocialMedia: React.ComponentProps<any>;
  ServiceTimes: React.ComponentProps<any>;
  ContactInfo: React.ComponentProps<any>;
  ChurchStats: React.ComponentProps<any>;
  EventCalendar: React.ComponentProps<any>;
  // Landing Page Components
  CallToAction: React.ComponentProps<any>;
  FeatureGrid: React.ComponentProps<any>;
  PricingTable: React.ComponentProps<any>;
  FAQ: React.ComponentProps<any>;
}

export interface SafeComponentConfig extends ComponentConfig<any> {
  defaultProps: Record<string, any>;
  render: (props: any) => React.ReactElement;
  fields: Record<string, any>;
}
