
import React from 'react';
import { ComponentConfig } from '@measured/puck';
import { FlexItemProps } from './components/FlexItemWrapper';

export interface Props {
  Hero: React.ComponentProps<any> & FlexItemProps;
  TextBlock: React.ComponentProps<any> & FlexItemProps;
  Image: React.ComponentProps<any> & FlexItemProps;
  Card: React.ComponentProps<any> & FlexItemProps;
  Header: React.ComponentProps<any>;
  FlexLayout: any;
  GridBlock: any;
  Footer: React.ComponentProps<any>;
  Stats: any & FlexItemProps;
  Testimonial: any & FlexItemProps;
  ContactForm: any & FlexItemProps;
  VideoEmbed: any & FlexItemProps;
  ImageGallery: React.ComponentProps<any> & FlexItemProps;
  ServiceTimes: React.ComponentProps<any> & FlexItemProps;
  ContactInfo: React.ComponentProps<any> & FlexItemProps;
  ChurchStats: React.ComponentProps<any> & FlexItemProps;
  EventCalendar: React.ComponentProps<any> & FlexItemProps;
}

export interface SafeComponentConfig extends ComponentConfig<any> {
  defaultProps: Record<string, any>;
  render: (props: any) => React.ReactElement;
  fields: Record<string, any>;
}
