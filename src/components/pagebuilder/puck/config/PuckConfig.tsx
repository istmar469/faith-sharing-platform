import React from 'react';
import { Config } from '@measured/puck';
import { ComponentConfig } from '@measured/puck';

// Basic Components
import { Hero, heroConfig } from './components/Hero';
import { TextBlock, textBlockConfig } from './components/TextBlock';
import { Image, imageConfig } from './components/Image';
import { Card, cardConfig } from './components/Card';
import Header, { headerConfig } from './components/Header';
import { flexLayoutConfig } from './components/FlexLayout';
import { buttonConfig } from './components/Button';
import Footer, { footerConfig } from './components/Footer';
import { statsConfig } from './components/Stats';
import { testimonialConfig } from './components/Testimonial';
import { ContactForm, ContactFormProps } from './components/ContactForm';
import { videoEmbedConfig } from './components/VideoEmbed';
import ImageGallery, { imageGalleryConfig } from './components/ImageGallery';
import { spacerConfig } from './components/Spacer';

// Flex Item Support
import { withFlexItemSupport, FlexItemProps } from './components/FlexItemWrapper';

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
  Hero: React.ComponentProps<typeof Hero> & FlexItemProps;
  TextBlock: React.ComponentProps<typeof TextBlock> & FlexItemProps;
  Image: React.ComponentProps<typeof Image> & FlexItemProps;
  Card: React.ComponentProps<typeof Card> & FlexItemProps;
  Header: React.ComponentProps<typeof Header>;
  FlexLayout: any; // FlexLayout props
  Footer: React.ComponentProps<typeof Footer>;
  Stats: any & FlexItemProps;
  Testimonial: any & FlexItemProps;
  ContactForm: ContactFormProps & FlexItemProps;
  VideoEmbed: any & FlexItemProps;
  ImageGallery: React.ComponentProps<typeof ImageGallery> & FlexItemProps;
  ServiceTimes: React.ComponentProps<typeof ServiceTimes> & FlexItemProps;
  ContactInfo: React.ComponentProps<typeof ContactInfo> & FlexItemProps;
  ChurchStats: React.ComponentProps<typeof ChurchStats> & FlexItemProps;
  EventCalendar: React.ComponentProps<typeof EventCalendar> & FlexItemProps;
};

// Safe wrapper to ensure all component configs have proper structure
const safeComponentConfig = (config: any, componentName: string): ComponentConfig<any> => {
  // Ensure config is an object
  if (!config || typeof config !== 'object') {
    console.warn(`${componentName}: Invalid config object, creating fallback`);
    return {
      fields: {},
      defaultProps: getDefaultPropsForComponent(componentName),
      render: createFallbackRenderer(componentName)
    };
  }

  // Ensure defaultProps exist and are safe
  const safeDefaultProps = {
    ...getDefaultPropsForComponent(componentName),
    ...(config.defaultProps || {})
  };

  // Convert all default props to string-safe values
  const stringifiedDefaultProps = Object.fromEntries(
    Object.entries(safeDefaultProps).map(([key, value]) => [
      key,
      value === null || value === undefined ? '' :
      typeof value === 'object' ? JSON.stringify(value) :
      String(value)
    ])
  );

  // Create a safe wrapper around the original render function
  const originalRender = config.render;
  const safeRender = originalRender ? createSafeRenderWrapper(originalRender, componentName) : createFallbackRenderer(componentName);

  return {
    ...config,
    defaultProps: stringifiedDefaultProps,
    render: safeRender,
    fields: config.fields || {}
  };
};

// Create a safe wrapper around any render function to prevent toString errors
const createSafeRenderWrapper = (originalRender: any, componentName: string) => {
  return (props: any) => {
    try {
      // Make props safe before passing to the component
      const safeProps = createSafeProps(props || {}, componentName);
      
      console.log(`${componentName}: Rendering with safe props:`, Object.keys(safeProps));
      
      // Call the original render function with safe props
      return originalRender(safeProps);
    } catch (error) {
      console.error(`${componentName}: Error in safe render wrapper:`, error);
      
      // Return fallback if the component itself crashes
      return createFallbackRenderer(componentName)(props);
    }
  };
};

// Create safe props object with defensive programming
const createSafeProps = (props: any, componentName: string): any => {
  if (!props || typeof props !== 'object') {
    console.warn(`${componentName}: Invalid props, using defaults`);
    return getDefaultPropsForComponent(componentName);
  }

  const safeProps: any = {};
  const defaultProps = getDefaultPropsForComponent(componentName);

  // Process each prop safely
  Object.keys({ ...defaultProps, ...props }).forEach(key => {
    const value = props[key];
    const defaultValue = defaultProps[key] || '';

    if (value === null || value === undefined) {
      safeProps[key] = defaultValue;
      return;
    }

    // Handle different types safely
    if (typeof value === 'string') {
      safeProps[key] = value;
    } else if (typeof value === 'number') {
      safeProps[key] = isNaN(value) ? defaultValue : value;
    } else if (typeof value === 'boolean') {
      safeProps[key] = value;
    } else if (Array.isArray(value)) {
      try {
        // Ensure arrays can be stringified
        JSON.stringify(value);
        safeProps[key] = value;
      } catch (error) {
        console.warn(`${componentName}: Invalid array prop ${key}, using default`);
        safeProps[key] = defaultValue;
      }
    } else if (typeof value === 'object') {
      try {
        // Ensure objects can be stringified
        JSON.stringify(value);
        safeProps[key] = value;
      } catch (error) {
        console.warn(`${componentName}: Invalid object prop ${key}, using default`);
        safeProps[key] = defaultValue;
      }
    } else {
      // For any other type, try to convert to string safely
      try {
        const stringValue = String(value);
        if (stringValue === '[object Object]' || stringValue === 'undefined') {
          safeProps[key] = defaultValue;
        } else {
          safeProps[key] = stringValue;
        }
      } catch (error) {
        console.warn(`${componentName}: Cannot convert prop ${key} to string, using default`);
        safeProps[key] = defaultValue;
      }
    }
  });

  return safeProps;
};

// Get safe default props for each component type
const getDefaultPropsForComponent = (componentName: string): Record<string, any> => {
  // Base flex item defaults for content components
  const flexItemDefaults = {
    layoutBehavior: 'flex-item',
    flexBasis: 'auto',
    flexGrow: '1',
    flexShrink: '1',
    alignSelf: 'auto',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0'
  };

  // Layout components (no flex item props)
  const layoutDefaults = {};

  switch (componentName) {
    case 'Hero':
      return {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        backgroundImage: '',
        buttonText: 'Learn More',
        buttonLink: '#',
        ...flexItemDefaults
      };
    case 'TextBlock':
      return {
        content: 'Default text content',
        size: 'medium',
        alignment: 'left',
        color: '#000000',
        ...flexItemDefaults
      };
    case 'Image':
      return {
        src: '',
        alt: 'Image',
        width: '100%',
        height: 'auto',
        ...flexItemDefaults
      };
    case 'Card':
      return {
        title: 'Card Title',
        description: 'Card Description',
        imageUrl: '',
        buttonText: 'Read More',
        ...flexItemDefaults
      };
    case 'Header':
      return {
        title: 'Site Title',
        navigation: '[]',
        logo: '',
        showSearch: 'false',
        ...layoutDefaults
      };
    case 'FlexLayout':
      return {
        direction: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: '16',
        backgroundColor: 'transparent',
        padding: '16',
        minHeight: '100',
        ...layoutDefaults
      };
    case 'Footer':
      return {
        copyright: '© 2024 All rights reserved',
        links: '[]',
        socialMedia: '{}',
        ...layoutDefaults
      };
    case 'Stats':
      return {
        title: 'Our Stats',
        stats: '[]',
        ...flexItemDefaults
      };
    case 'Testimonial':
      return {
        quote: 'This is a testimonial quote',
        author: 'John Doe',
        role: 'Customer',
        ...flexItemDefaults
      };
    case 'ContactForm':
      return {
        title: 'Contact Us',
        fields: '[]',
        submitText: 'Send Message',
        ...flexItemDefaults
      };
    case 'VideoEmbed':
      return {
        url: '',
        title: 'Video',
        autoplay: 'false',
        ...flexItemDefaults
      };
    case 'ImageGallery':
      return {
        images: '[]',
        columns: '3',
        showCaptions: 'true',
        ...flexItemDefaults
      };
    case 'ServiceTimes':
      return {
        title: 'Service Times',
        services: '[]',
        ...flexItemDefaults
      };
    case 'ContactInfo':
      return {
        address: '',
        phone: '',
        email: '',
        hours: '',
        ...flexItemDefaults
      };
    case 'ChurchStats':
      return {
        title: 'Church Statistics',
        stats: '[]',
        ...flexItemDefaults
      };
    case 'EventCalendar':
      return {
        title: 'Upcoming Events',
        events: '[]',
        ...flexItemDefaults
      };
    default:
      return {
        content: 'Default content',
        text: 'Default text',
        title: 'Default title',
        ...flexItemDefaults
      };
  }
};

// Create a fallback renderer for components
const createFallbackRenderer = (componentName: string) => {
  return (props: any) => {
    try {
      // Ensure all props are string-safe before rendering
      const safeProps = Object.fromEntries(
        Object.entries(props || {}).map(([key, value]) => [
          key,
          value === null || value === undefined ? '' :
          typeof value === 'object' ? JSON.stringify(value) :
          String(value)
        ])
      );

      return React.createElement('div', {
        className: 'p-4 border border-dashed border-gray-300 text-gray-500 text-center bg-gray-50 rounded',
        'data-component': componentName,
        'data-safe-props': JSON.stringify(safeProps)
      }, [
        React.createElement('h3', { 
          key: 'title',
          className: 'font-medium text-gray-700 mb-2' 
        }, `${componentName} Component`),
        React.createElement('p', { 
          key: 'content',
          className: 'text-sm text-gray-500' 
        }, safeProps.content || safeProps.text || safeProps.title || 'Component content')
      ]);
    } catch (error) {
      console.error(`${componentName}: Error in fallback renderer:`, error);
      return React.createElement('div', {
        className: 'p-4 border border-red-300 text-red-500 text-center bg-red-50 rounded'
      }, `Error rendering ${componentName}`);
    }
  };
};

export const puckConfig: Config<Props> = {
  components: {
    // Layout Components (no flex support - they control layout)
    Header: safeComponentConfig(headerConfig, 'Header') as ComponentConfig<Props['Header']>,
    FlexLayout: safeComponentConfig(flexLayoutConfig, 'FlexLayout') as ComponentConfig<Props['FlexLayout']>,
    Footer: safeComponentConfig(footerConfig, 'Footer') as ComponentConfig<Props['Footer']>,
    
    // Content Components (with flex item support)
    Hero: safeComponentConfig(withFlexItemSupport(heroConfig, 'Hero'), 'Hero') as ComponentConfig<Props['Hero']>,
    TextBlock: safeComponentConfig(withFlexItemSupport(textBlockConfig, 'TextBlock'), 'TextBlock') as ComponentConfig<Props['TextBlock']>,
    Image: safeComponentConfig(withFlexItemSupport(imageConfig, 'Image'), 'Image') as ComponentConfig<Props['Image']>,
    Card: safeComponentConfig(withFlexItemSupport(cardConfig, 'Card'), 'Card') as ComponentConfig<Props['Card']>,
    Stats: safeComponentConfig(withFlexItemSupport(statsConfig, 'Stats'), 'Stats') as ComponentConfig<Props['Stats']>,
    Testimonial: safeComponentConfig(withFlexItemSupport(testimonialConfig, 'Testimonial'), 'Testimonial') as ComponentConfig<Props['Testimonial']>,
    VideoEmbed: safeComponentConfig(withFlexItemSupport(videoEmbedConfig, 'VideoEmbed'), 'VideoEmbed') as ComponentConfig<Props['VideoEmbed']>,
    ImageGallery: safeComponentConfig(withFlexItemSupport(imageGalleryConfig, 'ImageGallery'), 'ImageGallery') as ComponentConfig<Props['ImageGallery']>,
    
    // Form Components (with flex item support)
    ContactForm: safeComponentConfig(withFlexItemSupport({
      fields: {},
      defaultProps: {},
      render: ({ ...props }) => <ContactForm {...props as ContactFormProps} />
    }, 'ContactForm'), 'ContactForm') as ComponentConfig<Props['ContactForm']>,
    
    // Church Components (with flex item support)
    ServiceTimes: safeComponentConfig(withFlexItemSupport(serviceTimesConfig, 'ServiceTimes'), 'ServiceTimes') as ComponentConfig<Props['ServiceTimes']>,
    ContactInfo: safeComponentConfig(withFlexItemSupport(contactInfoConfig, 'ContactInfo'), 'ContactInfo') as ComponentConfig<Props['ContactInfo']>,
    ChurchStats: safeComponentConfig(withFlexItemSupport(churchStatsConfig, 'ChurchStats'), 'ChurchStats') as ComponentConfig<Props['ChurchStats']>,
    EventCalendar: safeComponentConfig(withFlexItemSupport(eventCalendarConfig, 'EventCalendar'), 'EventCalendar') as ComponentConfig<Props['EventCalendar']>,
  },
  categories: {
    layout: {
      components: ['Header', 'FlexLayout', 'Footer']
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
    if (['Hero', 'TextBlock', 'Image', 'Card', 'Header', 'FlexLayout', 'Footer', 'Stats', 'Testimonial', 'ContactForm', 'VideoEmbed', 'ImageGallery'].includes(key)) {
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
