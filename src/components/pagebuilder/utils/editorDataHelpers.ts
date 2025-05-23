
import { EditorJSData } from '../context/pageBuilderTypes';

export function safeCastToEditorJSData(data: any): EditorJSData {
  // Check if data has the expected EditorJS structure
  if (data && typeof data === 'object' && 'blocks' in data && Array.isArray(data.blocks)) {
    return {
      time: data.time || Date.now(),
      blocks: data.blocks,
      version: data.version || "2.30.8"
    };
  }
  
  // If data is an array (legacy format), convert to empty EditorJS structure
  if (Array.isArray(data)) {
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
