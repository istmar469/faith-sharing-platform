
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
  // Check if data has the expected Puck structure
  if (validatePuckData(data)) {
    return {
      content: data.content,
      root: data.root || {}
    };
  }
  
  // Convert Editor.js format to empty Puck structure
  if (data && data.blocks && Array.isArray(data.blocks)) {
    console.log("Converting Editor.js format to Puck format");
    return {
      content: [],
      root: {}
    };
  }
  
  // Convert legacy array format to empty Puck structure
  if (Array.isArray(data)) {
    console.log("Converting legacy array format to Puck format");
    return {
      content: [],
      root: {}
    };
  }
  
  // Fallback to default empty structure
  return {
    content: [],
    root: {}
  };
}

export function createDefaultPuckData(): PuckData {
  return {
    content: [
      {
        type: "Hero",
        props: {
          title: "Welcome to Your Website",
          subtitle: "Start building amazing pages with our visual editor"
        }
      }
    ],
    root: {
      title: "Homepage"
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
