
import { EditorJSData } from '../context/pageBuilderTypes';

export function validateEditorData(data: any): boolean {
  return data && 
         typeof data === 'object' && 
         'blocks' in data && 
         Array.isArray(data.blocks);
}

export function safeCastToEditorJSData(data: any): EditorJSData {
  // Check if data has the expected EditorJS structure
  if (validateEditorData(data)) {
    return {
      time: data.time || Date.now(),
      blocks: data.blocks,
      version: data.version || "2.30.8"
    };
  }
  
  // Convert legacy array format to empty EditorJS structure
  if (Array.isArray(data)) {
    console.log("Converting legacy array format to EditorJS format");
    return {
      time: Date.now(),
      blocks: [],
      version: "2.30.8"
    };
  }
  
  // Fallback to default empty structure
  return {
    time: Date.now(),
    blocks: [],
    version: "2.30.8"
  };
}

export function createDefaultEditorData(): EditorJSData {
  return {
    time: Date.now(),
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "Start writing your content here..."
        }
      }
    ],
    version: "2.30.8"
  };
}
