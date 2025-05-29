// Enhanced stub for supabase client for testing purposes
// Fully flexible stub for supabase for tests
import { vi } from 'vitest';

/**
 * Creates a fully chainable mock for Supabase queries
 * All methods return the chain itself to allow indefinite chaining
 * Final methods like single() return mock promises with default null values
 */
function createChainableMock() {
  const chain: any = {};
  
  // All possible chainable methods
  const methods = [
    'select', 'insert', 'update', 'delete', 'upsert', 
    'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 
    'is', 'in', 'or', 'and', 'not', 'contains', 'containedBy',
    'order', 'limit', 'range', 'filter', 'match', 'returning',
    'textSearch', 'filter', 'overlaps', 'set', 'count'
  ];
  
  // Make all methods return the chain itself for unlimited chaining
  methods.forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });
  
  // Terminal methods that return promises
  chain.single = vi.fn(async () => ({ data: null, error: null }));
  chain.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  chain.execute = vi.fn(async () => ({ data: null, error: null }));
  
  return chain;
}

/**
 * Mock Supabase client for testing
 */
export const supabase = {
  from: vi.fn(() => createChainableMock()),
  auth: {
    getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
    getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
    signInWithPassword: vi.fn(async () => ({ data: { user: null, session: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } }, error: null })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(async () => ({ data: null, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
      remove: vi.fn(async () => ({ data: null, error: null })),
      download: vi.fn(async () => ({ data: null, error: null })),
    })),
  },
  rpc: vi.fn().mockImplementation((fn: string) => ({
    execute: vi.fn().mockResolvedValue({ data: null, error: null })
  })),
};
