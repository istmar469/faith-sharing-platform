
// Re-export all functionality from the modular files
export type { PageData } from './page/types';
export { PageServiceError } from './page/types';
export { 
  savePage, 
  getPage, 
  getPageBySlug, 
  getOrganizationPages, 
  getHomepage, 
  duplicatePage 
} from './page/crud';
export { 
  getPageTemplates, 
  getPageTemplate, 
  createPageFromTemplate 
} from './page/templates';
export { convertJsonToPuckData, convertPuckDataToJson } from './page/utils';
