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
    const newRoot: PuckData['root'] = { ...(data.root || {}) }; // Clone to avoid modifying original data.root if it's passed around

    if (typeof newRoot.props === 'undefined') {
      newRoot.props = {}; // Ensure root.props exists
    }

    // If data.root had a title and newRoot doesn't, preserve it.
    // Puck might use root.title for the document/page title.
    if (data.root && typeof data.root.title !== 'undefined' && typeof newRoot.title === 'undefined') {
        newRoot.title = data.root.title;
    }
    
    // Ensure all content items have proper structure
    const validatedContent = data.content.map((item: any) => {
      if (!item || typeof item !== 'object') {
        console.warn('PuckDataHelpers: Invalid content item found, skipping:', item);
        return null;
      }
      
      // Ensure each content item has required properties
      return {
        type: item.type || 'TextBlock', // Default to TextBlock if type is missing
        props: item.props && typeof item.props === 'object' ? item.props : {},
        readOnly: item.readOnly || false
      };
    }).filter(Boolean); // Remove null items

    return {
      content: validatedContent,
      root: newRoot
    };
  }
  
  // Convert Editor.js format to empty Puck structure
  if (data && data.blocks && Array.isArray(data.blocks)) {
    console.log("Converting Editor.js format to Puck format");
    return {
      content: [],
      root: { props: {} } // Initialize root.props
    };
  }
  
  // Convert legacy array format to empty Puck structure
  if (Array.isArray(data)) {
    console.log("Converting legacy array format to Puck format");
    return {
      content: [],
      root: { props: {} } // Initialize root.props
    };
  }
  
  // Fallback to default empty structure
  console.warn('PuckDataHelpers: Invalid data structure, returning default:', data);
  return {
    content: [],
    root: { props: {} } // Initialize root.props
  };
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
      title: "Homepage", // Puck might use this for the document title
      props: {}        // Initialize root.props for any other root-level page settings
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
