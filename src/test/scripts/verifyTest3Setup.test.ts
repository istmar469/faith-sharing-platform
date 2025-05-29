import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://pryfcspttlbogumcijju.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Debug: Check if service role key is set
console.log('Service Role Key length:', SUPABASE_SERVICE_ROLE_KEY.length);
console.log('Service Role Key first 10 chars:', SUPABASE_SERVICE_ROLE_KEY.substring(0, 10));

// Create a client with service role key for admin operations
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  }
});

// Test the connection first
describe('Supabase Connection', () => {
  it('should connect to Supabase with service role key', async () => {
    const { data, error } = await supabase.from('organizations').select('count').limit(1);
    console.log('Connection test result:', { data, error });
    expect(error).toBeNull();
  });
});

describe('Test3 Organization Setup', () => {
  it('should verify the complete test3 organization setup', async () => {
    console.log('Starting Test3 setup verification...');

    // 1. Verify organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('subdomain', 'test3')
      .single();

    console.log('Organization query result:', { org, orgError });
    expect(orgError).toBeNull();
    expect(org).toBeDefined();
    console.log('✓ Organization found:', org.name);

    // 2. Verify admin user
    const { data: { users: adminUsers }, error: adminError } = await supabase.auth.admin.listUsers();

    expect(adminError).toBeNull();
    expect(adminUsers).toBeDefined();
    expect(adminUsers?.length).toBeGreaterThan(0);

    const adminUser = adminUsers?.find(u => u.email === 'admin@church-os.com');
    expect(adminUser).toBeDefined();
    console.log('✓ Admin user found:', adminUser?.email);

    // 3. Verify regular user
    const { data: { users: regularUsers }, error: regularError } = await supabase.auth.admin.listUsers();

    expect(regularError).toBeNull();
    expect(regularUsers).toBeDefined();
    expect(regularUsers?.length).toBeGreaterThan(0);

    const regularUser = regularUsers?.find(u => u.email === 'user@test3.church-os.com');
    expect(regularUser).toBeDefined();
    console.log('✓ Regular user found:', regularUser?.email);

    // 4. Verify admin permissions
    const { data: adminPermissions, error: adminPermError } = await supabase
      .from('component_permissions')
      .select('*')
      .eq('organization_id', org.id)
      .eq('user_id', adminUser?.id);

    expect(adminPermError).toBeNull();
    expect(adminPermissions).toBeDefined();

    const expectedAdminPermissions = [
      'website_editor',
      'page_editor',
      'template_manager',
      'media_manager',
      'dashboard_viewer',
      'analytics_viewer',
      'settings_manager',
      'user_manager',
      'role_manager'
    ];

    const adminPerms = adminPermissions?.map(p => p.component_id) || [];
    const missingAdminPerms = expectedAdminPermissions.filter(p => !adminPerms.includes(p));
    
    expect(missingAdminPerms).toHaveLength(0);
    console.log('✓ Admin permissions verified');

    // 5. Verify regular user permissions
    const { data: regularPermissions, error: regularPermError } = await supabase
      .from('component_permissions')
      .select('*')
      .eq('organization_id', org.id)
      .eq('user_id', regularUser?.id);

    expect(regularPermError).toBeNull();
    expect(regularPermissions).toBeDefined();

    const expectedRegularPermissions = [
      'dashboard_viewer',
      'analytics_viewer',
      'page_viewer',
      'media_viewer'
    ];

    const regularPerms = regularPermissions?.map(p => p.component_id) || [];
    const missingRegularPerms = expectedRegularPermissions.filter(p => !regularPerms.includes(p));
    
    expect(missingRegularPerms).toHaveLength(0);
    console.log('✓ Regular user permissions verified');

    // 6. Verify organization memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', org.id);

    expect(membershipError).toBeNull();
    expect(memberships).toBeDefined();

    const adminMembership = memberships?.find(m => m.user_id === adminUser?.id);
    const regularMembership = memberships?.find(m => m.user_id === regularUser?.id);

    expect(adminMembership).toBeDefined();
    expect(adminMembership?.role).toBe('admin');
    expect(regularMembership).toBeDefined();
    expect(regularMembership?.role).toBe('member');
    console.log('✓ Organization memberships verified');

    console.log('All verifications passed successfully!');
  });
}); 