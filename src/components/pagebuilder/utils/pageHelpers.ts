
import { PageData } from "../context/pageBuilderTypes";
import { safeCastToPuckData, createDefaultPuckData } from "./puckDataHelpers";

export const createBlankPageData = (organizationId: string): PageData => {
  console.log("pageHelpers: Creating new blank page with Puck data");
  
  return {
    title: 'New Page',
    slug: '',
    content: createDefaultPuckData(),
    published: false,
    show_in_navigation: true,
    is_homepage: false,
    organization_id: organizationId
  } as PageData;
};

export const convertToPageData = (pageData: any): PageData => {
  return {
    ...pageData,
    content: safeCastToPuckData(pageData.content)
  };
};

export const findHomepage = (pages: any[]): any | null => {
  return pages.find(page => page.is_homepage) || null;
};

export const getFallbackPage = (pages: any[]): any | null => {
  return pages.length > 0 ? pages[0] : null;
};
