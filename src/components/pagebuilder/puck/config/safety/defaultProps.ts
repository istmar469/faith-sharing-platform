
// Get safe default props for each component type
export const getDefaultPropsForComponent = (componentName: string): Record<string, any> => {
  // Simplified defaults - remove complex flex props that interfere with drag operations
  const flexItemDefaults = {};

  // Layout components (no flex item props)
  const layoutDefaults = {};

  switch (componentName) {
    case 'Hero':
      return {
        title: 'Welcome to Your Website',
        subtitle: 'Create amazing experiences with our powerful tools',
        backgroundImage: '',
        backgroundColor: '#3B82F6',
        gradientFrom: '#3B82F6',
        gradientTo: '#8B5CF6',
        useGradient: true,
        textColor: 'white',
        customTextColor: '#FFFFFF',
        buttonText: 'Get Started',
        buttonLink: '#',
        size: 'large',
        alignment: 'center',
        overlayOpacity: 40,
        ...flexItemDefaults
      };
    case 'TextBlock':
      return {
        content: 'Add your content here...',
        size: 'medium',
        alignment: 'left',
        color: '#374151',
        backgroundColor: 'transparent',
        fontWeight: 'normal',
        padding: 'medium',
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
        buttonLink: '#',
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
        flexWrap: 'wrap',
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
        stats: [
          { number: '10K+', label: 'Happy Customers', description: 'Worldwide' },
          { number: '99%', label: 'Satisfaction Rate', description: 'Customer feedback' },
          { number: '24/7', label: 'Support', description: 'Always available' },
          { number: '5★', label: 'Rating', description: 'App stores' }
        ],
        layout: 'grid',
        color: 'blue',
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
    case 'GridBlock':
      return {
        columns: 3,
        gap: '1rem',
        backgroundColor: 'transparent',
        padding: '1rem',
        minHeight: '200px',
        equalHeight: true,
        ...layoutDefaults
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
