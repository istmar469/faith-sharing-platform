
import { createDefaultHomepage } from "@/services/defaultHomepageTemplate";
import { getCachedOrgData } from "./organizationCache";
import { convertToPageData } from "./pageHelpers";

export const createDefaultPage = async (organizationId: string) => {
  console.log("defaultPageCreator: No pages found, creating lightweight homepage");
  
  try {
    const orgData = await getCachedOrgData(organizationId);
    
    if (!orgData) {
      throw new Error("Failed to load organization data");
    }

    const newHomepage = await createDefaultHomepage(organizationId, orgData.name);
    return convertToPageData(newHomepage);
  } catch (createError) {
    console.error("defaultPageCreator: Error creating default homepage:", createError);
    throw new Error("Failed to create default homepage");
  }
};
