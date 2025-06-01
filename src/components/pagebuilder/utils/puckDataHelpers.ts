
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

// Comprehensive data sanitization to prevent crashes
function sanitizeProps(props: any): any {
  if (props === null || props === undefined) {
    return {};
  }
  
  if (typeof props !== 'object') {
    // Handle primitive values
    if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean') {
      return props;
    }
    return {};
  }
  
  if (Array.isArray(props)) {
    return props.map(item => sanitizeProps(item)).filter(item => item !== null);
  }
  
  const sanitized: any = {};
  
  try {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('__') || typeof key !== 'string') {
        // Skip internal/invalid keys
        continue;
      }
      
      if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (typeof value === 'object') {
        try {
          // Test serialization
          JSON.stringify(value);
          sanitized[key] = sanitizeProps(value);
        } catch (error) {
          console.warn('PuckDataHelpers: Skipping non-serializable prop:', key);
          sanitized[key] = null;
        }
      } else if (typeof value === 'function') {
        // Skip functions completely
        continue;
      } else {
        // Try to convert to string safely
        try {
          sanitized[key] = String(value);
        } catch (error) {
          console.warn('PuckDataHelpers: Failed to convert prop:', key);
          sanitized[key] = null;
        }
      }
    }
  } catch (error) {
    console.error('PuckDataHelpers: Error sanitizing props:', error);
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
    
    // Validate content items
    for (const item of data.content) {
      if (!item || typeof item !== 'object') {
        return false;
      }
      if (typeof item.type !== 'string' || item.type.trim() === '') {
        return false;
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
    if (validatePuckData(data)) {
      // Create safe root object
      const safeRoot: PuckData['root'] = {
        props: sanitizeProps(data.root?.props || {}),
        ...(data.root?.title && { title: String(data.root.title) })
      };

      // Validate and sanitize content items
      const safeContent = data.content
        .map((item: any, index: number) => {
          if (!item || typeof item !== 'object') {
            console.warn(`PuckDataHelpers: Invalid content item at index ${index}, creating default`);
            return {
              type: 'TextBlock',
              props: {},
              readOnly: false
            };
          }
          
          // Ensure valid type
          let type = item.type;
          if (typeof type !== 'string' || type.trim() === '') {
            console.warn(`PuckDataHelpers: Invalid type at index ${index}, defaulting to TextBlock`);
            type = 'TextBlock';
          }
          
          // Sanitize props
          const props = sanitizeProps(item.props || {});
          
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
      
      // Final validation - ensure the result can be JSON serialized
      try {
        JSON.stringify(result);
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
        },
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

// Helper to safely clone Puck data
export function clonePuckData(data: PuckData): PuckData {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error('PuckDataHelpers: Error cloning data:', error);
    return createDefaultPuckData();
  }
}

// Helper to merge Puck data safely
export function mergePuckData(base: PuckData, updates: Partial<PuckData>): PuckData {
  try {
    const result = clonePuckData(base);
    
    if (updates.content && Array.isArray(updates.content)) {
      result.content = updates.content.map(item => ({
        type: typeof item.type === 'string' ? item.type : 'TextBlock',
        props: sanitizeProps(item.props || {}),
        readOnly: Boolean(item.readOnly)
      }));
    }
    
    if (updates.root && typeof updates.root === 'object') {
      result.root = {
        props: sanitizeProps(updates.root.props || result.root.props || {}),
        ...(updates.root.title && { title: String(updates.root.title) })
      };
    }
    
    return result;
  } catch (error) {
    console.error('PuckDataHelpers: Error merging data:', error);
    return base;
  }
}
