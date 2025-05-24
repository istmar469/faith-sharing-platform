
import { PageData } from '../context/types';
import { loadPageData } from '../utils/loadPageData';

export interface PageManagerState {
  isLoading: boolean;
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
  private debugId: string;

  constructor(config: Partial<PageManagerConfig> = {}) {
    this.debugId = `PageManager-${Date.now()}`;
    console.log(`🏗️ ${this.debugId}: Creating fresh PageManager instance at ${new Date().toISOString()}`);
    
    this.config = {
      maxRetries: 2,
      timeoutMs: 10000, // Reduced timeout
      retryDelayMs: 1000,
      ...config
    };

    this.state = {
      isLoading: false,
      organizationId: null,
      pageData: null,
      error: null,
      isEditorReady: false,
      retryCount: 0
    };
    
    console.log(`🏗️ ${this.debugId}: Initialized with config:`, this.config);
  }

  subscribe(listener: (state: PageManagerState) => void) {
    console.log(`📡 ${this.debugId}: Adding state listener`);
    this.listeners.add(listener);
    return () => {
      console.log(`📡 ${this.debugId}: Removing state listener`);
      this.listeners.delete(listener);
    };
  }

  private setState(updates: Partial<PageManagerState>) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    console.log(`🔄 ${this.debugId}: State update at ${new Date().toISOString()}:`, {
      from: prevState,
      to: this.state,
      changes: updates
    });
    
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error(`❌ ${this.debugId}: Error in state listener:`, error);
      }
    });
  }

  getState(): PageManagerState {
    return { ...this.state };
  }

  async initializePage(pageId: string | null, organizationId: string | null) {
    console.log(`🚀 ${this.debugId}: Starting fresh page initialization at ${new Date().toISOString()}`, { 
      pageId, 
      organizationId
    });
    
    if (!organizationId) {
      console.error(`❌ ${this.debugId}: No organization ID provided`);
      this.setState({
        error: "Organization ID is required",
        isLoading: false
      });
      return;
    }

    this.setState({ 
      isLoading: true, 
      error: null, 
      retryCount: 0,
      organizationId,
      isEditorReady: false
    });

    // Set timeout for overall operation
    this.timeoutId = setTimeout(() => {
      if (this.state.isLoading) {
        console.error(`⏰ ${this.debugId}: Page initialization timed out after ${this.config.timeoutMs}ms`);
        this.setState({
          isLoading: false,
          error: `Page initialization timed out. Please refresh the page.`
        });
      }
    }, this.config.timeoutMs);

    try {
      console.log(`📄 ${this.debugId}: Loading fresh page data...`);
      await this.loadPageData(pageId, organizationId);
      
      console.log(`✅ ${this.debugId}: Page data loaded successfully`);
      this.setState({ isLoading: false });
      
      console.log(`🎯 ${this.debugId}: Page initialization completed successfully at ${new Date().toISOString()}`);
      
    } catch (error) {
      console.error(`❌ ${this.debugId}: Page initialization failed:`, error);
      await this.handleError(error as Error, pageId, organizationId);
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        console.log(`🧹 ${this.debugId}: Cleared initialization timeout`);
      }
    }
  }

  private async loadPageData(pageId: string | null, organizationId: string | null) {
    console.log(`📋 ${this.debugId}: Loading fresh page data for pageId: ${pageId}, orgId: ${organizationId}`);
    
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const startTime = Date.now();
    const { pageData, error } = await loadPageData(pageId, organizationId);
    const loadTime = Date.now() - startTime;
    
    console.log(`📋 ${this.debugId}: Page data query completed in ${loadTime}ms`, { 
      pageData: !!pageData, 
      error,
      hasContent: pageData?.content?.blocks?.length || 0
    });
    
    if (error) {
      throw new Error(`Failed to load page data: ${error}`);
    }

    this.setState({ pageData });
    console.log(`✅ ${this.debugId}: Fresh page data stored in state successfully`);
  }

  private async handleError(error: Error, pageId: string | null, organizationId: string | null) {
    const newRetryCount = this.state.retryCount + 1;
    
    console.log(`🔄 ${this.debugId}: Handling error, retry count: ${newRetryCount}/${this.config.maxRetries}`, error);
    
    if (newRetryCount <= this.config.maxRetries) {
      console.log(`🔄 ${this.debugId}: Retrying initialization (attempt ${newRetryCount}/${this.config.maxRetries})`);
      
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
    console.error(`❌ ${this.debugId}: Max retries reached, giving up`);
    this.setState({
      isLoading: false,
      error: `Failed after ${this.config.maxRetries} attempts: ${error.message}. Please refresh the page.`
    });
  }

  onEditorReady() {
    console.log(`🎨 ${this.debugId}: Editor ready callback received at ${new Date().toISOString()}!`);
    this.setState({ isEditorReady: true });
    console.log(`✅ ${this.debugId}: Editor ready state updated to true`);
  }

  reset() {
    console.log(`🔄 ${this.debugId}: Resetting state`);
    this.setState({
      isLoading: false,
      organizationId: null,
      pageData: null,
      error: null,
      isEditorReady: false,
      retryCount: 0
    });
  }

  retry(pageId: string | null, organizationId: string | null) {
    console.log(`🔄 ${this.debugId}: Manual retry requested`);
    this.reset();
    return this.initializePage(pageId, organizationId);
  }
}
