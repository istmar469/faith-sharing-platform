
import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Test3 Setup Verification', () => {
  beforeAll(async () => {
    // Setup test environment if needed
  });

  it('should have access to Supabase client', () => {
    expect(supabase).toBeDefined();
  });

  it('should be able to query organizations table', async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1);

    // Should not error (table should exist)
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should be able to query pages table', async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('id, title')
      .limit(1);

    // Should not error (table should exist)
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should verify database connectivity', async () => {
    // Simple query to verify connection
    const { error } = await supabase
      .from('organizations')
      .select('count')
      .limit(0);

    expect(error).toBeNull();
  });
});
