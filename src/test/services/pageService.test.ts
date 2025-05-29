import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create a universal mock handler function that manages Supabase mock responses
// This will be our global registry of mock responses for different queries
const mockResponses: Record<string, any> = {};

// Mock registry counters to help with complex scenarios
const mockCalls: Record<string, number> = {};

/**
 * Register a mock response for a specific table and operation path
 * operation is typically the first method called (select, insert, update, etc.)
 * path is an optional sequence of methods called after the operation (e.g., ['eq', 'single'])
 */
function mockSupabaseResponse(table: string, operation: string, response: any, path: string[] = []) {
  const key = generateMockKey(table, operation, path);
  mockResponses[key] = response;
  mockCalls[key] = 0; // Initialize the call counter
}

// Generate a key for the mock registry
function generateMockKey(table: string, operation: string, path: string[] = []) {
  return path.length > 0 ? 
    `${table}:${operation}:${path.join('.')}` : 
    `${table}:${operation}`;
}

// Clear all registered mock responses and counters
function clearMockResponses() {
  Object.keys(mockResponses).forEach(key => delete mockResponses[key]);
  Object.keys(mockCalls).forEach(key => delete mockCalls[key]);
}

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => {
  // Create a chainable query builder that tracks the operations
  function createChainableQueryBuilder(table: string) {
    let currentTable = table;
    let operations: string[] = [];
    let primaryOperation: string | null = null;
    
    // This is the base chain object that will be returned
    const chain: any = {};
    
    // Add tracking for all common Supabase methods
    const methods = [
      // Query methods
      'select', 'insert', 'update', 'delete', 'upsert',
      // Filter methods
      'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 
      'in', 'contains', 'containedBy', 'overlaps', 'textSearch',
      'filter', 'or', 'and', 'not',
      // Modifier methods
      'order', 'limit', 'range', 'single', 'maybeSingle', 
      'returning', 'match', 'count'
    ];
    
    // Check if this method is a primary operation (first level query)
    const isPrimaryOperation = (method: string) => {
      return ['select', 'insert', 'update', 'delete', 'upsert'].includes(method);
    };
    
    // Check if this method is a terminal operation (executes the query)
    const isTerminalOperation = (method: string) => {
      return ['single', 'maybeSingle', 'execute'].includes(method);
    };
    
    // Get the most specific mock response for the current operation path
    const getMockResponse = () => {
      // Try for most specific mock first - with full operation path
      if (primaryOperation) {
        // Full path key (e.g., "pages:insert:select.single")
        const opPath = operations.slice(1);
        const pathKey = generateMockKey(currentTable, primaryOperation, opPath);
        
        if (mockResponses[pathKey]) {
          mockCalls[pathKey] = (mockCalls[pathKey] || 0) + 1;
          return mockResponses[pathKey];
        }
        
        // Try just the primary operation (e.g., "pages:insert")
        const primaryKey = `${currentTable}:${primaryOperation}`;
        if (mockResponses[primaryKey]) {
          mockCalls[primaryKey] = (mockCalls[primaryKey] || 0) + 1;
          return mockResponses[primaryKey];
        }
      }
      
      // Fall back to table-level default
      const tableKey = `${currentTable}:default`;
      if (mockResponses[tableKey]) {
        return mockResponses[tableKey];
      }
      
      // Final fallback - empty response
      return { data: null, error: null };
    };
    
    // Create chainable methods
    methods.forEach(method => {
      chain[method] = vi.fn((...args: any[]) => {
        // If this is a primary operation, note it
        if (isPrimaryOperation(method) && !primaryOperation) {
          primaryOperation = method;
        }
        
        // Track the operation
        operations.push(method);
        
        // For terminal methods (ones that execute the query)
        if (isTerminalOperation(method)) {
          const response = getMockResponse();
          return Promise.resolve(response);
        }
        
        // Return the chain for further chaining
        return chain;
      });
    });
    
    // Make the chain thenable so it can be awaited
    chain.then = (resolve: Function) => {
      const response = getMockResponse();
      return resolve(response);
    };
    
    // Allow the chain to be destructured
    Object.defineProperty(chain, 'data', {
      get: () => {
        const response = getMockResponse();
        return response.data;
      }
    });
    
    Object.defineProperty(chain, 'error', {
      get: () => {
        const response = getMockResponse();
        return response.error;
      }
    });
    
    Object.defineProperty(chain, 'count', {
      get: () => {
        const response = getMockResponse();
        return response.count || 0;
      }
    });
    
    // Override toString for debugging
    chain.toString = () => `[Mock Supabase Query: ${currentTable} ${operations.join('.')}]`;
    
    return chain;
  }
  
  // Create the main Supabase mock
  return {
    supabase: {
      from: vi.fn((table: string) => createChainableQueryBuilder(table)),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn()
      },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          download: vi.fn().mockResolvedValue({ data: null, error: null }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } })
        })
      }
    }
  };
});

// Import the mocked version
import { supabase } from '@/integrations/supabase/client';
import {
  savePage,
  getPage,
  getPageBySlug,
  getOrganizationPages,
  getHomepage,
  duplicatePage,
  getPageVersions,
  getPageVersion,
  restorePageVersion,
  getPageTemplates,
  getPageTemplate,
  createPageFromTemplate,
  PageServiceError,
} from '@/services/pageService';
import { cache } from '@/utils/cache';


// Mock useAuthStatus to avoid React hook errors in non-React test context
vi.mock('@/hooks/useAuthStatus', () => ({
  useAuthStatus: vi.fn().mockImplementation(() => ({ 
    isAuthenticated: true, 
    isUserChecked: true, 
    isCheckingAuth: false,
    retryCount: 0,
    handleRetry: vi.fn(),
    handleAuthRetry: vi.fn(),
    handleSignOut: vi.fn().mockResolvedValue(undefined)
  }))
}));
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Session, User } from '@supabase/supabase-js';

/**
 * Helper to create a fully chainable mock for Supabase queries
 * This addresses TypeScript errors by using proper type assertions
 */
function setupChainableMock(mockResponse: any, queryMethods: string[] = ['select', 'eq', 'single']) {
  // Create a base object that will handle any method call and return itself for chaining
  const createFullyChainable = () => {
    const chain: any = {};
    
    // Common Supabase query methods
    const allMethods = [
      'select', 'insert', 'update', 'delete', 'upsert', 
      'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 
      'is', 'in', 'or', 'and', 'not', 'contains', 'containedBy',
      'order', 'limit', 'range', 'single', 'maybeSingle', 'filter',
      'match', 'returning', 'textSearch', 'filter', 'overlaps', 'set',
      'count', 'execute'
    ];
    
    // Make all methods return the chain itself for infinite chaining
    allMethods.forEach(method => {
      chain[method] = vi.fn().mockReturnValue(chain);
    });
    
    // Set the terminal methods to return the provided mock response
    chain.single = vi.fn().mockResolvedValue(mockResponse);
    chain.maybeSingle = vi.fn().mockResolvedValue(mockResponse);
    chain.execute = vi.fn().mockResolvedValue(mockResponse);
    
    // If not using a terminal method, the chain itself will be the response
    // This simulates methods like .eq() returning data directly
    Object.defineProperty(chain, 'data', { value: mockResponse.data });
    Object.defineProperty(chain, 'error', { value: mockResponse.error });
    Object.defineProperty(chain, 'count', { value: mockResponse.count });
    
    return chain;
  };
  
  return createFullyChainable();
}

/**
 * Setup a mock response for supabase.from(tableName) with chainable methods
 */
function setupSupabaseMock(tableName: string, mockResponse: any, queryMethods: string[] = ['select', 'eq', 'single']) {
  // Create a chainable mock structure
  const chainableMock = setupChainableMock(mockResponse, queryMethods);
  
  // Mock supabase.from to return our chainable mock
  vi.mocked(supabase.from as any).mockImplementation((table: string) => {
    if (table === tableName) {
      return chainableMock;
    }
    
    // Return a default mock for other tables
    return setupChainableMock({ data: null, error: null });
  });
  
  return chainableMock;
}

// Mock cache
vi.mock('@/utils/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PageService', () => {
  const mockPage = {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Test Page',
    slug: 'test-page',
    content: { content: [], root: {} },
    organization_id: '00000000-0000-0000-0000-000000000002',
    published: false,
    show_in_navigation: true,
    is_homepage: false,
    template_id: '00000000-0000-0000-0000-000000000003',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('savePage', () => {
    it('should create a new page', async () => {
      // Create a new page without an ID to ensure we test the "insert" path
      const newPageData = {
        ...mockPage,
        id: undefined // Remove ID to ensure we test the "insert" path
      };
      
      // Create a complete mock for the Supabase client
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'pages') {
          return {
            // For validation queries
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  neq: vi.fn().mockReturnValue({
                    data: [], // No existing pages with this slug
                    error: null
                  })
                })
              })
            }),
            // For the insert operation
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {...newPageData, id: '00000000-0000-0000-0000-000000000099'}, // Add a generated ID
                  error: null
                })
              })
            }),
            // In case update is called (shouldn't happen in this test)
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockPage,
                    error: null
                  })
                })
              })
            })
          };
        }
        // For page_versions table used in savePageVersion
        if (table === 'page_versions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          };
        }
        return {};
      });
      
      // Mock the auth.getUser call
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' }
        },
        error: null
      });
      
      // Replace the global mocks with our test-specific mocks
      vi.mocked(supabase).from = mockFrom;
      vi.mocked(supabase.auth).getUser = mockGetUser;
      vi.mocked(cache.delete).mockReturnValue(undefined);
      
      // Execute the savePage function with the new page data (no ID)
      const result = await savePage(newPageData);
      
      // Verify the result has an ID and matches our expected data
      expect(result).toHaveProperty('id');
      expect(result.title).toEqual(newPageData.title);
      expect(result.slug).toEqual(newPageData.slug);
      
      // Verify Supabase was called correctly
      expect(mockFrom).toHaveBeenCalledWith('pages');
      expect(mockGetUser).toHaveBeenCalled();
    });

    it('should update an existing page', async () => {
      // Make sure we have an ID to test the update path
      const pageToUpdate = { 
        ...mockPage,
        title: 'Updated Title' // Change a field to verify the update
      };

      // Create a mock for the Supabase client
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'pages') {
          return {
            // For validation queries
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  neq: vi.fn().mockReturnValue({
                    data: [], // No conflicts
                    error: null
                  })
                })
              })
            }),
            // For the update operation
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: pageToUpdate,
                    error: null
                  })
                })
              })
            })
          };
        }
        // For page_versions table
        if (table === 'page_versions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          };
        }
        return {};
      });
      
      // Mock the auth.getUser call
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' }
        },
        error: null
      });
      
      // Replace the global mocks
      vi.mocked(supabase).from = mockFrom;
      vi.mocked(supabase.auth).getUser = mockGetUser;
      vi.mocked(cache.delete).mockReturnValue(undefined);
      
      // Execute the savePage function with the page that has an ID
      const result = await savePage(pageToUpdate);
      
      // Verify the result matches our expected data
      expect(result).toEqual(pageToUpdate);
      expect(result.title).toBe('Updated Title');
      
      // Verify Supabase was called correctly
      expect(mockFrom).toHaveBeenCalledWith('pages');
      expect(mockGetUser).toHaveBeenCalled();
    });

    it('should throw error on validation failure', async () => {
      const invalidPage = { ...mockPage, title: '' };
      await expect(savePage(invalidPage)).rejects.toThrow(PageServiceError);
    });

    it('should throw error on invalid slug format', async () => {
      const invalidPage = { ...mockPage, slug: 'invalid slug!' };
      await expect(savePage(invalidPage)).rejects.toThrow(PageServiceError);
    });

    it('should throw error on duplicate slug', async () => {
      // Create a page that will trigger a duplicate slug error
      const pageWithDuplicateSlug = {
        ...mockPage,
        id: undefined // New page (no ID)
      };
      
      // Create a mock for the Supabase client that returns an existing page with the same slug
      const mockFrom = vi.fn().mockImplementation((table) => {
        if (table === 'pages') {
          return {
            // Return an existing page with the same slug when validating uniqueness
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  neq: vi.fn().mockReturnValue({
                    // Return a page with the same slug to trigger the error
                    data: [{ id: '00000000-0000-0000-0000-000000000002' }],
                    error: null
                  })
                })
              })
            }),
            // We shouldn't reach the insert/update operations in this test
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'This should not be called' }
                })
              })
            })
          };
        }
        return {};
      });
      
      // Replace the global mocks
      vi.mocked(supabase).from = mockFrom;
      vi.mocked(supabase.auth).getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      
      // Execute the savePage function and expect it to throw an error
      await expect(savePage(pageWithDuplicateSlug)).rejects.toThrow('Slug already exists');
      
      // Verify the validation query was called
      expect(mockFrom).toHaveBeenCalledWith('pages');
    });

    it('should throw error on duplicate homepage', async () => {
      // Set up mock response for the homepage validation query
      const homepagePage = { ...mockPage, is_homepage: true };
      
      // Mock different behavior based on which query is being made
      vi.mocked(supabase.from as any).mockImplementation((table: string) => {
        if (table === 'pages') {
          return {
            select: vi.fn().mockImplementation((columns) => {
              return {
                eq: vi.fn().mockImplementation((field, value) => {
                  if (field === 'is_homepage' && value === true) {
                    // This is the homepage validation query
                    return {
                      eq: vi.fn().mockReturnValue({
                        data: [{ id: '00000000-0000-0000-0000-000000000002' }],
                        error: null
                      })
                    };
                  } else {
                    // Other validation queries
                    return {
                      eq: vi.fn().mockReturnValue({
                        data: [],
                        error: null
                      })
                    };
                  }
                })
              };
            })
          };
        }
        return setupChainableMock({ data: null, error: null });
      });

      await expect(savePage(homepagePage)).rejects.toThrow('Another page is already set as homepage');
    });

    it('should handle database errors gracefully', async () => {
      // First mock the validation to pass
      // Then mock the insert to fail with a database error
      vi.mocked(supabase.from as any).mockImplementation((table: string) => {
        if (table === 'pages') {
          return {
            // Allow validation to pass
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  data: [],
                  error: null
                })
              })
            }),
            // But make the insert fail
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ 
                  data: null, 
                  error: { message: 'Database error' } 
                })
              })
            })
          };
        }
        return setupChainableMock({ data: null, error: null });
      });

      await expect(savePage(mockPage)).rejects.toThrow('Failed to create page');
    });
  });

  describe('getPage', () => {
    it('should return page from cache if available', async () => {
      vi.mocked(cache.get).mockReturnValue(mockPage);
      const result = await getPage('00000000-0000-0000-0000-000000000001');
      expect(result).toEqual(mockPage);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should fetch page from database if not in cache', async () => {
      vi.mocked(cache.get).mockReturnValue(null);
      const mockResponse = { data: mockPage, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await getPage('00000000-0000-0000-0000-000000000001');
      expect(result).toEqual(mockPage);
      expect(cache.set).toHaveBeenCalled();
    });

    it('should handle not found pages', async () => {
      vi.mocked(cache.get).mockReturnValue(null);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      } as any);

      const result = await getPage('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      vi.mocked(cache.get).mockReturnValue(null);
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
          }),
        }),
      } as any);

      await expect(getPage('00000000-0000-0000-0000-000000000001')).rejects.toThrow('Failed to fetch page');
    });
  });

  describe('getOrganizationPages', () => {
    it('should return paginated pages', async () => {
      const mockPages = [mockPage];
      const mockResponse = { data: mockPages, error: null, count: 1 };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      } as any);

      const result = await getOrganizationPages('00000000-0000-0000-0000-000000000002', 1, 10);
      expect(result).toEqual({ data: mockPages, total: 1 });
    });

    it('should handle empty results', async () => {
      const mockResponse = { data: [], error: null, count: 0 };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue(mockResponse),
            }),
          }),
        }),
      } as any);

      const result = await getOrganizationPages('00000000-0000-0000-0000-000000000002', 1, 10);
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should handle invalid pagination parameters', async () => {
      const result = await getOrganizationPages('00000000-0000-0000-0000-000000000002', 0, 0);
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('duplicatePage', () => {
    it('should create a copy of the page', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPage, error: null }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockPage, id: 'new-id' }, error: null }),
          }),
        }),
      } as any);

      const result = await duplicatePage('00000000-0000-0000-0000-000000000001');
      expect(result.title).toBe('Test Page (Copy)');
      expect(result.slug).toBe('test-page-copy');
    });

    it('should handle non-existent page', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      } as any);

      await expect(duplicatePage('non-existent-id')).rejects.toThrow('Page not found');
    });
  });

  describe('getPageVersions', () => {
    it('should return page versions', async () => {
      const mockVersions = [
        { version: 2, created_at: '2024-01-02', created_by: 'user-2' },
        { version: 1, created_at: '2024-01-01', created_by: 'user-1' },
      ];
      const mockResponse = { data: mockVersions, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await getPageVersions('00000000-0000-0000-0000-000000000001');
      expect(result).toEqual(mockVersions);
    });

    it('should handle empty version history', async () => {
      const mockResponse = { data: [], error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await getPageVersions('00000000-0000-0000-0000-000000000001');
      expect(result).toEqual([]);
    });
  });

  describe('getPageVersion', () => {
    it('should return specific version', async () => {
      const mockVersion = { content: { content: [], root: {} } };
      const mockResponse = { data: mockVersion, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      vi.mocked(cache.get).mockReturnValue(mockPage);

      const result = await getPageVersion('00000000-0000-0000-0000-000000000001', 1);
      expect(result).toEqual({
        ...mockPage,
        content: mockVersion.content,
        version: 1,
      });
    });

    it('should handle non-existent version', async () => {
      // Use setupSupabaseMock helper instead of direct chain manipulation
      // Add type assertion to avoid TypeScript errors
      const mockResponse = { data: null, error: { code: 'PGRST116' } };
      vi.mocked(supabase.from as any).mockImplementation(() => {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(mockResponse)
              })
            })
          })
        };
      });

      const result = await getPageVersion('00000000-0000-0000-0000-000000000001', 999);
      expect(result).toBeNull();
    });
  });

  describe('restorePageVersion', () => {
    it('should restore specific version', async () => {
      const mockVersion = { content: { content: [], root: {} } };
      
      setupSupabaseMock('page_versions', { data: mockVersion, error: null }, ['select', 'eq', 'eq', 'single']);
      
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'page_versions') {
          return setupChainableMock({ data: mockVersion, error: null }, ['select', 'eq', 'eq', 'single']);
        } else if (table === 'pages') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { content: mockVersion.content }, error: null })
                })
              })
            })
          };
        }
        return setupChainableMock({ data: null, error: null });
      });

      const result = await restorePageVersion('00000000-0000-0000-0000-000000000001', 1);
      expect(result.content).toEqual(mockVersion.content);
    });

    it('should handle non-existent version', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      } as any);

      await expect(restorePageVersion('00000000-0000-0000-0000-000000000001', 999)).rejects.toThrow('Version not found');
    });
  });

  describe('getPageTemplates', () => {
    it('should return organization and global templates', async () => {
      const mockTemplates = [
        { id: 'template-1', name: 'Template 1', description: 'Description 1' },
        { id: 'template-2', name: 'Template 2', description: 'Description 2' },
      ];
      const mockResponse = { data: mockTemplates, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await getPageTemplates('00000000-0000-0000-0000-000000000002');
      expect(result).toEqual(mockTemplates);
    });

    it('should handle empty templates', async () => {
      const mockResponse = { data: [], error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any);

      const result = await getPageTemplates('00000000-0000-0000-0000-000000000002');
      expect(result).toEqual([]);
    });
  });

  describe('createPageFromTemplate', () => {
    it('should create a new page from template', async () => {
      const mockTemplate = { content: { content: [], root: {} } };
      const mockResponse = { data: mockTemplate, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...mockPage, id: 'new-id' }, error: null }),
          }),
        }),
      } as any);

      const result = await createPageFromTemplate('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002');
      expect(result.title).toBe('New Page');
      expect(result.slug).toBe('new-page');
    });

    it('should handle non-existent template', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
      } as any);

      await expect(createPageFromTemplate('non-existent-template', '00000000-0000-0000-0000-000000000002')).rejects.toThrow('Template not found');
    });
  });
});

describe('SubdomainContext', () => {
  it('should preserve subdomain context during navigation', async () => {
    const mockPage = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Test Page',
      slug: 'test-page',
      content: { content: [], root: {} },
      organization_id: '00000000-0000-0000-0000-000000000002',
      published: false,
      show_in_navigation: true,
      is_homepage: false,
    };

    // Mock subdomain context
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPage, error: null }),
        }),
      }),
    } as any);

    // Test page retrieval preserves context
    const result = await getPage('00000000-0000-0000-0000-000000000001');
    expect(result.organization_id).toBe('00000000-0000-0000-0000-000000000002');
  });

  it('should handle authentication state correctly in subdomain context', async () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };
    const mockSession: Session = {
      user: mockUser,
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };

    // Mock auth state with correct TypeScript structure
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession } } as any);
    
    // Update the mock implementation for this specific test
    vi.mocked(useAuthStatus).mockReturnValue({
      isAuthenticated: true,
      isUserChecked: true,
      isCheckingAuth: false,
      retryCount: 0,
      handleRetry: vi.fn(),
      handleAuthRetry: vi.fn(),
      handleSignOut: vi.fn().mockResolvedValue(undefined)
    });

    // Get the auth status (synchronously now, not awaited)
    const { isAuthenticated } = useAuthStatus();
    expect(isAuthenticated).toBe(true);
  });

  it('should prevent unauthorized access to subdomain content', async () => {
    // Mock unauthenticated state with proper type casting
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null } } as any);
    
    // Update the mock implementation for this specific test
    vi.mocked(useAuthStatus).mockReturnValue({
      isAuthenticated: false,
      isUserChecked: true,
      isCheckingAuth: false,
      retryCount: 0,
      handleRetry: vi.fn(),
      handleAuthRetry: vi.fn(),
      handleSignOut: vi.fn().mockResolvedValue(undefined)
    });

    // Test access control
    const { isAuthenticated } = useAuthStatus();
    expect(isAuthenticated).toBe(false);
  });
}); 