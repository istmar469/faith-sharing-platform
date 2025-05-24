
import { supabase } from "@/integrations/supabase/client";
import { PageData } from '../context/types';
import { loadPageData } from '../utils/loadPageData';

export interface PageManagerState {
  isLoading: boolean;
  isAuthenticated: boolean | null;
  organizationId: string | null;
  pageData: PageData | null;
  error: string | null;
  isEditorReady: boolean;
  retryCount: number;
}

export interface PageManagerConfig {
  maxRetries: number;
  timeoutMs: number;
  retryDelayMs: number;
}

export class PageManager {
  private state: PageManagerState;
  private config: PageManagerConfig;
  private listeners: Set<(state: PageManagerState) => void> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: Partial<PageManagerConfig> = {}) {
    this.config = {
      maxRetries: 3,
      timeoutMs: 10000,
      retryDelayMs: 1000,
      ...config
    };

    this.state = {
      isLoading: false,
      isAuthenticated: null,
      organizationId: null,
      pageData: null,
      error: null,
      isEditorReady: false,
      retryCount: 0
    };
  }

  subscribe(listener: (state: PageManagerState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<PageManagerState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): PageManagerState {
    return { ...this.state };
  }

  async initializePage(pageId: string | null, organizationId: string | null) {
    console.log("PageManager: Starting page initialization", { pageId, organizationId });
    
    this.setState({ 
      isLoading: true, 
      error: null, 
      retryCount: 0,
      organizationId 
    });

    // Set timeout for overall operation
    this.timeoutId = setTimeout(() => {
      if (this.state.isLoading) {
        this.setState({
          isLoading: false,
          error: "Page initialization timed out. Please try again."
        });
      }
    }, this.config.timeoutMs);

    try {
      // Step 1: Check authentication
      await this.checkAuthentication();
      
      // Step 2: Verify organization access
      if (organizationId) {
        await this.verifyOrganizationAccess(organizationId);
      }
      
      // Step 3: Load page data
      await this.loadPageData(pageId, organizationId);
      
      this.setState({ isLoading: false });
      console.log("PageManager: Page initialization completed successfully");
      
    } catch (error) {
      console.error("PageManager: Page initialization failed:", error);
      await this.handleError(error as Error, pageId, organizationId);
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  private async checkAuthentication() {
    console.log("PageManager: Checking authentication");
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Authentication check failed: ${error.message}`);
    }
    
    if (!session?.user) {
      throw new Error("User not authenticated");
    }
    
    this.setState({ isAuthenticated: true });
    console.log("PageManager: Authentication verified");
  }

  private async verifyOrganizationAccess(organizationId: string) {
    console.log("PageManager: Verifying organization access");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No authenticated user found");
    }

    const { count, error } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Organization access check failed: ${error.message}`);
    }

    if (count === 0) {
      throw new Error("You do not have access to this organization");
    }

    console.log("PageManager: Organization access verified");
  }

  private async loadPageData(pageId: string | null, organizationId: string | null) {
    console.log("PageManager: Loading page data");
    
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const { pageData, error } = await loadPageData(pageId, organizationId);
    
    if (error) {
      throw new Error(`Failed to load page data: ${error}`);
    }

    this.setState({ pageData });
    console.log("PageManager: Page data loaded successfully");
  }

  private async handleError(error: Error, pageId: string | null, organizationId: string | null) {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.config.maxRetries) {
      console.log(`PageManager: Retrying initialization (attempt ${newRetryCount}/${this.config.maxRetries})`);
      
      this.setState({ 
        retryCount: newRetryCount,
        error: `Retry ${newRetryCount}/${this.config.maxRetries}: ${error.message}`
      });
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs * newRetryCount));
      
      // Retry the initialization
      return this.initializePage(pageId, organizationId);
    }
    
    // Max retries reached
    this.setState({
      isLoading: false,
      error: `Failed after ${this.config.maxRetries} attempts: ${error.message}`
    });
  }

  onEditorReady() {
    console.log("PageManager: Editor ready");
    this.setState({ isEditorReady: true });
  }

  reset() {
    console.log("PageManager: Resetting state");
    this.setState({
      isLoading: false,
      isAuthenticated: null,
      organizationId: null,
      pageData: null,
      error: null,
      isEditorReady: false,
      retryCount: 0
    });
  }

  retry(pageId: string | null, organizationId: string | null) {
    console.log("PageManager: Manual retry requested");
    this.reset();
    return this.initializePage(pageId, organizationId);
  }
}
