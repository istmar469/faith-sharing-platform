// Helper functions for Puck data format handling

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

// Deep sanitization function to ensure all values are serializable
function sanitizeProps(props: any): any {
  if (props === null || props === undefined) {
    return {};
  }
  
  if (typeof props !== 'object') {
    return props;
  }
  
  if (Array.isArray(props)) {
    return props.map(item => sanitizeProps(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      try {
        // Test if the object can be stringified safely
        JSON.stringify(value);
        sanitized[key] = sanitizeProps(value);
      } catch (error) {
        console.warn('PuckDataHelpers: Skipping non-serializable prop:', key, error);
        sanitized[key] = null;
      }
    } else if (typeof value === 'function') {
      console.warn('PuckDataHelpers: Skipping function prop:', key);
      sanitized[key] = null;
    } else {
      // For other types, try to convert to string safely
      try {
        sanitized[key] = String(value);
      } catch (error) {
        console.warn('PuckDataHelpers: Failed to convert prop to string:', key, error);
        sanitized[key] = null;
      }
    }
  }
  
  return sanitized;
}

export function validatePuckData(data: any): boolean {
  return data && 
         typeof data === 'object' && 
         'content' in data && 
         Array.isArray(data.content) &&
         'root' in data &&
         typeof data.root === 'object';
}

export function safeCastToPuckData(data: any): PuckData {
  if (validatePuckData(data)) {
    try {
      const newRoot: PuckData['root'] = { ...(data.root || {}) };

      if (typeof newRoot.props === 'undefined') {
        newRoot.props = {};
      } else {
        // Sanitize root props
        newRoot.props = sanitizeProps(newRoot.props);
      }

      // Preserve title if it exists
      if (data.root && typeof data.root.title !== 'undefined' && typeof newRoot.title === 'undefined') {
        newRoot.title = String(data.root.title);
      }
      
      // Ensure all content items have proper structure and sanitized props
      const validatedContent = data.content.map((item: any, index: number) => {
        if (!item || typeof item !== 'object') {
          console.warn(`PuckDataHelpers: Invalid content item at index ${index}, skipping:`, item);
          return null;
        }
        
        // Ensure type is a valid string
        const type = typeof item.type === 'string' && item.type.trim() !== '' 
          ? item.type 
          : 'TextBlock'; // Default to TextBlock if type is missing or invalid
        
        // Sanitize props deeply
        const props = sanitizeProps(item.props || {});
        
        // Ensure readOnly is a boolean
        const readOnly = Boolean(item.readOnly);
        
        return {
          type,
          props,
          readOnly
        };
      }).filter(Boolean); // Remove null items

      const result = {
        content: validatedContent,
        root: newRoot
      };
      
      // Final validation - ensure the result can be JSON serialized
      try {
        JSON.stringify(result);
        return result;
      } catch (error) {
        console.error('PuckDataHelpers: Final validation failed, data not serializable:', error);
        return createDefaultPuckData();
      }
    } catch (error) {
      console.error('PuckDataHelpers: Error processing valid puck data:', error);
      return createDefaultPuckData();
    }
  }
  
  // Convert Editor.js format to empty Puck structure
  if (data && data.blocks && Array.isArray(data.blocks)) {
    console.log("Converting Editor.js format to Puck format");
    return {
      content: [],
      root: { props: {} }
    };
  }
  
  // Convert legacy array format to empty Puck structure
  if (Array.isArray(data)) {
    console.log("Converting legacy array format to Puck format");
    return {
      content: [],
      root: { props: {} }
    };
  }
  
  // Fallback to default empty structure
  console.warn('PuckDataHelpers: Invalid data structure, returning default:', data);
  return createDefaultPuckData();
}

export function createDefaultPuckData(): PuckData {
  return {
    content: [
      {
        type: "Hero",
        props: {
          title: "Welcome to Your Website",
          subtitle: "Start building amazing pages with our visual editor",
          buttonText: "Get Started",
          buttonLink: "#",
          size: "large",
          alignment: "center"
        }
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
  return data && 
         typeof data === 'object' && 
         'blocks' in data && 
         Array.isArray(data.blocks);
}
