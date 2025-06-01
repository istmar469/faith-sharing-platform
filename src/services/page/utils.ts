
// Helper function to convert database Json to PuckData
export function convertJsonToPuckData(jsonContent: any): { content: any; root: any } {
  if (typeof jsonContent === 'string') {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed && typeof parsed === 'object') {
        return {
          content: parsed.content || [],
          root: parsed.root || {}
        };
      }
    } catch (e) {
      console.warn('Failed to parse JSON content:', e);
    }
  }
  
  if (jsonContent && typeof jsonContent === 'object') {
    return {
      content: jsonContent.content || [],
      root: jsonContent.root || {}
    };
  }
  
  return { content: [], root: {} };
}

// Helper function to convert PuckData to database Json
export function convertPuckDataToJson(puckData: { content: any; root: any }): any {
  return puckData;
}
