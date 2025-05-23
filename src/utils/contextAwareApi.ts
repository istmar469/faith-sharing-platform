
import { supabase } from "@/integrations/supabase/client";
import { extractSubdomain, isDevelopmentEnvironment } from "./domainUtils";

/**
 * Utility to validate that API calls are properly scoped to the current organization context
 */
export class ContextAwareApi {
  private static async getCurrentOrganizationId(): Promise<string | null> {
    // Get organization ID from subdomain if available
    const hostname = window.location.hostname;
    const subdomain = extractSubdomain(hostname);
    
    if (subdomain && !isDevelopmentEnvironment()) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('subdomain', subdomain)
        .single();
      
      return orgData?.id || null;
    }
    
    // Fallback to URL path extraction
    const pathMatch = window.location.pathname.match(/\/tenant-dashboard\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : null;
  }

  /**
   * Validates that an organization ID matches the current context
   */
  static async validateOrganizationAccess(organizationId: string): Promise<boolean> {
    const currentOrgId = await this.getCurrentOrganizationId();
    
    if (!currentOrgId) {
      console.warn('No organization context found for validation');
      return false;
    }
    
    if (currentOrgId !== organizationId) {
      console.error('Organization ID mismatch:', { provided: organizationId, expected: currentOrgId });
      return false;
    }
    
    return true;
  }

  /**
   * Scoped query builder that automatically includes organization context
   */
  static scopedQuery(table: string, organizationId?: string) {
    if (organizationId) {
      // Validate the organization ID matches current context
      this.validateOrganizationAccess(organizationId).then(isValid => {
        if (!isValid) {
          throw new Error('Organization access validation failed');
        }
      });
    }
    
    const query = supabase.from(table);
    
    // If organizationId is provided, automatically scope the query
    if (organizationId) {
      return query.eq('organization_id', organizationId);
    }
    
    return query;
  }

  /**
   * Get pages scoped to current organization
   */
  static async getPages(organizationId: string) {
    await this.validateOrganizationAccess(organizationId);
    
    return this.scopedQuery('pages', organizationId)
      .select('*')
      .order('title');
  }

  /**
   * Save page with organization context validation
   */
  static async savePage(pageData: any, organizationId: string) {
    await this.validateOrganizationAccess(organizationId);
    
    // Ensure the page data includes the correct organization ID
    const scopedPageData = {
      ...pageData,
      organization_id: organizationId
    };
    
    if (pageData.id) {
      return supabase
        .from('pages')
        .update(scopedPageData)
        .eq('id', pageData.id)
        .eq('organization_id', organizationId) // Double-check organization scope
        .select()
        .single();
    } else {
      return supabase
        .from('pages')
        .insert(scopedPageData)
        .select()
        .single();
    }
  }
}
