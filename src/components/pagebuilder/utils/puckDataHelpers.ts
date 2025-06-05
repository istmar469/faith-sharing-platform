
// Helper functions for Puck data format handling with enhanced drag operation safety

export interface PuckData {
  content: Array<{
    type: string;
    props: any;
    readOnly?: boolean;
  }>;
  root: {
    props?: any;
    title?: string;
  };
}

// Enhanced data sanitization to prevent crashes and toString errors during drag operations
function sanitizeProps(props: any): any {
  if (props === null || props === undefined) {
    return {};
  }
  
  // Handle primitive values safely
  if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean') {
    return props;
  }
  
  // Handle functions - skip them completely as they can't be serialized
  if (typeof props === 'function') {
    console.warn('PuckDataHelpers: Skipping function prop during sanitization');
    return {};
  }
  
  // Handle symbols and other non-serializable types
  if (typeof props === 'symbol' || typeof props === 'bigint') {
    console.warn('PuckDataHelpers: Converting non-serializable type to string:', typeof props);
    try {
      return String(props);
    } catch (error) {
      console.warn('PuckDataHelpers: Failed to convert to string, using empty string');
      return '';
    }
  }
  
  if (!props || typeof props !== 'object') {
    // Handle other primitive-like values
    try {
      return props;
    } catch (error) {
      console.warn('PuckDataHelpers: Error handling primitive value:', error);
      return {};
    }
  }
  
  if (Array.isArray(props)) {
    return props.map(item => {
      const sanitized = sanitizeProps(item);
      // Ensure array items won't cause toString errors - provide fallback for undefined/null
      if (sanitized === null || sanitized === undefined) {
        return '';
      }
      return sanitized;
    }).filter(item => item !== null && item !== undefined);
  }
  
  const sanitized: any = {};
  
  try {
    for (const [key, value] of Object.entries(props)) {
      // Skip internal/invalid keys
      if (key.startsWith('__') || typeof key !== 'string') {
        continue;
      }
      
      // Handle null/undefined values - critical for preventing toString errors
      if (value === null || value === undefined) {
        sanitized[key] = '';
        continue;
      }
      
      // Handle primitive values
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
        continue;
      }
      
      // Handle functions - skip them as they cause serialization issues
      if (typeof value === 'function') {
        console.warn(`PuckDataHelpers: Skipping function prop: ${key}`);
        continue;
      }
      
      // Handle objects and arrays with extra safety for drag operations
      if (typeof value === 'object') {
        try {
          // Test serialization first to ensure it won't crash during drag
          const testSerialization = JSON.stringify(value);
          if (testSerialization && testSerialization !== 'undefined') {
            const sanitizedValue = sanitizeProps(value);
            // Extra check to ensure the sanitized value won't cause toString errors
            if (sanitizedValue !== null && sanitizedValue !== undefined) {
              sanitized[key] = sanitizedValue;
            } else {
              sanitized[key] = '';
            }
          } else {
            sanitized[key] = '';
          }
        } catch (error) {
          console.warn(`PuckDataHelpers: Skipping non-serializable prop: ${key}`, error);
          sanitized[key] = '';
        }
        continue;
      }
      
      // Handle other types (symbols, bigint, etc.) with enhanced safety
      try {
        const stringValue = String(value);
        if (stringValue && stringValue !== '[object Object]' && stringValue !== 'undefined' && stringValue !== 'null') {
          sanitized[key] = stringValue;
        } else {
          sanitized[key] = '';
        }
      } catch (error) {
        console.warn(`PuckDataHelpers: Failed to convert prop to string: ${key}`, error);
        sanitized[key] = '';
      }
    }
  } catch (error) {
    console.error('PuckDataHelpers: Critical error sanitizing props:', error);
    return {};
  }
  
  return sanitized;
}

export function validatePuckData(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for required structure
    if (!('content' in data) || !Array.isArray(data.content)) {
      return false;
    }
    
    if (!('root' in data) || typeof data.root !== 'object' || data.root === null) {
      return false;
    }
    
    // Validate content items with enhanced safety for drag operations
    for (const item of data.content) {
      if (!item || typeof item !== 'object') {
        return false;
      }
      if (typeof item.type !== 'string' || item.type.trim() === '') {
        return false;
      }
      // Ensure props exist and are an object (can be empty)
      if (item.props !== null && item.props !== undefined && typeof item.props !== 'object') {
        return false;
      }
      // Test that props can be serialized safely (important for drag operations)
      if (item.props) {
        try {
          JSON.stringify(item.props);
        } catch (error) {
          console.warn('PuckDataHelpers: Props failed serialization test:', error);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.warn('PuckDataHelpers: Error validating data:', error);
    return false;
  }
}

export function safeCastToPuckData(data: any): PuckData {
  try {
    console.log('PuckDataHelpers: safeCastToPuckData called with:', typeof data, data);
    
    if (validatePuckData(data)) {
      // Create safe root object with enhanced validation
      const safeRoot: PuckData['root'] = {
        props: sanitizeProps(data.root?.props || {}),
        ...(data.root?.title && typeof data.root.title === 'string' ? { title: data.root.title } : {})
      };

      // Validate and sanitize content items with enhanced error handling for drag operations
      const safeContent = data.content
        .map((item: any, index: number) => {
          if (!item || typeof item !== 'object') {
            console.warn(`PuckDataHelpers: Invalid content item at index ${index}, creating default`);
            return {
              type: 'TextBlock',
              props: getDefaultPropsForType('TextBlock'),
              readOnly: false
            };
          }
          
          // Ensure valid type with additional safety checks
          let type = item.type;
          if (typeof type !== 'string' || type.trim() === '') {
            console.warn(`PuckDataHelpers: Invalid type at index ${index}, defaulting to TextBlock`);
            type = 'TextBlock';
          }
          
          // Sanitize props with enhanced safety for drag operations
          let props = {};
          try {
            props = sanitizeProps(item.props || {});
            // Double-check serialization to prevent drag crashes
            const testSerialization = JSON.stringify(props);
            if (!testSerialization || testSerialization === 'undefined') {
              props = getDefaultPropsForType(type);
            }
          } catch (error) {
            console.error(`PuckDataHelpers: Props sanitization failed at index ${index}:`, error);
            props = getDefaultPropsForType(type);
          }
          
          // Ensure readOnly is boolean
          const readOnly = Boolean(item.readOnly);
          
          return {
            type,
            props,
            readOnly
          };
        })
        .filter(Boolean); // Remove any null items

      const result = {
        content: safeContent,
        root: safeRoot
      };
      
      // Final validation - ensure the result can be JSON serialized (critical for drag operations)
      try {
        const serialized = JSON.stringify(result);
        // Also test that we can parse it back
        const parsed = JSON.parse(serialized);
        if (!parsed || !parsed.content || !parsed.root) {
          throw new Error('Parsed data is invalid');
        }
        console.log('PuckDataHelpers: Successfully validated and serialized data');
        return result;
      } catch (serializationError) {
        console.error('PuckDataHelpers: Final serialization check failed:', serializationError);
        return createDefaultPuckData();
      }
    }
    
    // Handle Editor.js format conversion
    if (data && data.blocks && Array.isArray(data.blocks)) {
      console.log("PuckDataHelpers: Converting Editor.js format to Puck format");
      return createDefaultPuckData();
    }
    
    // Handle legacy array format
    if (Array.isArray(data)) {
      console.log("PuckDataHelpers: Converting legacy array format to Puck format");
      return createDefaultPuckData();
    }
    
    // Handle completely invalid data
    console.warn('PuckDataHelpers: Invalid data structure, creating default:', typeof data);
    return createDefaultPuckData();
    
  } catch (error) {
    console.error('PuckDataHelpers: Critical error in safeCastToPuckData:', error);
    return createDefaultPuckData();
  }
}

// Get safe default props for component types with enhanced safety for drag operations
function getDefaultPropsForType(type: string): Record<string, any> {
  switch (type) {
    case 'Hero':
      return {
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        backgroundImage: '',
        buttonText: 'Learn More',
        buttonLink: '#',
        size: 'large',
        alignment: 'center'
      };
    case 'TextBlock':
      return {
        content: 'Default text content',
        size: 'medium',
        alignment: 'left',
        color: '#000000'
      };
    case 'Image':
      return {
        src: '',
        alt: 'Image',
        width: '100%',
        height: 'auto'
      };
    case 'Card':
      return {
        title: 'Card Title',
        description: 'Card Description',
        imageUrl: '',
        buttonText: 'Read More',
        buttonLink: '#'
      };
    case 'Header':
      return {
        title: 'Site Title',
        navigation: [],
        logo: '',
        showSearch: false
      };
    case 'EnhancedHeader':
      return {
        logoText: 'My Church',
        logoSize: 32,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        showNavigation: true
      };
    case 'Footer':
      return {
        copyright: '© 2024 All rights reserved',
        links: [],
        socialMedia: {}
      };
    case 'Stats':
      return {
        title: 'Our Stats',
        stats: []
      };
    case 'Testimonial':
      return {
        quote: 'This is a testimonial quote',
        author: 'John Doe',
        role: 'Customer'
      };
    case 'ContactForm':
      return {
        title: 'Contact Us',
        fields: [],
        submitText: 'Send Message'
      };
    case 'VideoEmbed':
      return {
        url: '',
        title: 'Video',
        autoplay: false
      };
    case 'ImageGallery':
      return {
        images: [],
        columns: 3,
        showCaptions: true
      };
    case 'ServiceTimes':
      return {
        title: 'Service Times',
        layout: 'list',
        showIcon: true,
        backgroundColor: 'white',
        textColor: 'gray-900',
        customTimes: []
      };
    case 'ContactInfo':
      return {
        title: 'Contact Us',
        layout: 'vertical',
        showIcons: true,
        backgroundColor: 'white',
        textColor: 'gray-900'
      };
    case 'ChurchStats':
      return {
        title: 'Church Statistics',
        stats: []
      };
    case 'EventCalendar':
      return {
        title: 'Upcoming Events',
        events: []
      };
    default:
      return {
        content: 'Default content',
        text: 'Default text',
        title: 'Default title'
      };
  }
}

export function createDefaultPuckData(): PuckData {
  return {
    content: [
      {
        type: "Hero",
        props: getDefaultPropsForType("Hero"),
        readOnly: false
      }
    ],
    root: {
      title: "Homepage",
      props: {}
    }
  };
}

export function isPuckData(data: any): boolean {
  return validatePuckData(data);
}

export function isEditorJSData(data: any): boolean {
  try {
    return data && 
           typeof data === 'object' && 
           'blocks' in data && 
           Array.isArray(data.blocks);
  } catch (error) {
    return false;
  }
}

// Helper to safely clone Puck data with error handling
export function clonePuckData(data: PuckData): PuckData {
  try {
    const serialized = JSON.stringify(data);
    const parsed = JSON.parse(serialized);
    return parsed;
  } catch (error) {
    console.error('PuckDataHelpers: Error cloning data:', error);
    return createDefaultPuckData();
  }
}

// Helper to merge Puck data safely with enhanced validation for drag operations
export function mergePuckData(base: PuckData, updates: Partial<PuckData>): PuckData {
  try {
    const result = clonePuckData(base);
    
    if (updates.content && Array.isArray(updates.content)) {
      result.content = updates.content.map((item, index) => {
        if (!item || typeof item !== 'object') {
          console.warn(`mergePuckData: Invalid content item at index ${index}`);
          return {
            type: 'TextBlock',
            props: getDefaultPropsForType('TextBlock'),
            readOnly: false
          };
        }
        
        const type = typeof item.type === 'string' && item.type.trim() !== '' ? item.type : 'TextBlock';
        
        return {
          type,
          props: sanitizeProps(item.props || getDefaultPropsForType(type)),
          readOnly: Boolean(item.readOnly)
        };
      });
    }
    
    if (updates.root && typeof updates.root === 'object') {
      result.root = {
        props: sanitizeProps(updates.root.props || result.root.props || {}),
        ...(updates.root.title && typeof updates.root.title === 'string' ? { title: updates.root.title } : {})
      };
    }
    
    // Validate the merged result to ensure it won't crash during drag operations
    try {
      const testSerialization = JSON.stringify(result);
      if (!testSerialization || testSerialization === 'undefined') {
        throw new Error('Result failed serialization test');
      }
      JSON.parse(testSerialization); // Test that it can be parsed back
      return result;
    } catch (serializationError) {
      console.error('PuckDataHelpers: Merged data failed serialization:', serializationError);
      return base;
    }
  } catch (error) {
    console.error('PuckDataHelpers: Error merging data:', error);
    return base;
  }
}

// Enhanced helper to safely extract string values and prevent toString errors during drag operations
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  try {
    const stringValue = String(value);
    if (stringValue === '[object Object]') {
      try {
        return JSON.stringify(value);
      } catch (jsonError) {
        return '';
      }
    }
    return stringValue;
  } catch (error) {
    console.warn('PuckDataHelpers: safeToString failed:', error);
    return '';
  }
}
