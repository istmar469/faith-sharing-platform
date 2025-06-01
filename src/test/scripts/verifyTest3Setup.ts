
import { supabase } from '@/integrations/supabase/client';
import { expect } from 'vitest';

// Simple interface for our auth user needs
interface TestAuthUser {
  email: string;
  id: string;
}

async function verifyTest3Setup() {
  console.log('Starting Test3 setup verification...');

  // 1. Verify organization exists
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('subdomain', 'test3')
    .single();

  if (orgError) {
    throw new Error(`Failed to find test3 organization: ${orgError.message}`);
  }
  console.log('✓ Organization found:', org.name);

  // 2. Verify admin user
  const { data: { users: adminUsers }, error: adminError } = await supabase.auth.admin.listUsers();

  if (adminError || !adminUsers?.length) {
    throw new Error(`Failed to find admin user: ${adminError?.message}`);
  }
  const adminUser = adminUsers.find(u => u.email === 'admin@church-os.com') as TestAuthUser | undefined;
  if (!adminUser) {
    throw new Error('Admin user not found');
  }
  console.log('✓ Admin user found:', adminUser.email);

  // 3. Verify regular user
  const { data: { users: regularUsers }, error: regularError } = await supabase.auth.admin.listUsers();

  if (regularError || !regularUsers?.length) {
    throw new Error(`Failed to find regular user: ${regularError?.message}`);
  }
  const regularUser = regularUsers.find(u => u.email === 'user@test3.church-os.com') as TestAuthUser | undefined;
  if (!regularUser) {
    throw new Error('Regular user not found');
  }
  console.log('✓ Regular user found:', regularUser.email);

  // 4. Verify admin permissions
  const { data: adminPermissions, error: adminPermError } = await supabase
    .from('component_permissions')
    .select('*')
    .eq('organization_id', org.id)
    .eq('user_id', adminUser.id);

  if (adminPermError) {
    throw new Error(`Failed to fetch admin permissions: ${adminPermError.message}`);
  }

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

  const adminPerms = adminPermissions.map(p => p.component_id);
  const missingAdminPerms = expectedAdminPermissions.filter(p => !adminPerms.includes(p));
  
  if (missingAdminPerms.length > 0) {
    throw new Error(`Missing admin permissions: ${missingAdminPerms.join(', ')}`);
  }
  console.log('✓ Admin permissions verified');

  // 5. Verify regular user permissions
  const { data: regularPermissions, error: regularPermError } = await supabase
    .from('component_permissions')
    .select('*')
    .eq('organization_id', org.id)
    .eq('user_id', regularUser.id);

  if (regularPermError) {
    throw new Error(`Failed to fetch regular user permissions: ${regularPermError.message}`);
  }

  const expectedRegularPermissions = [
    'dashboard_viewer',
    'analytics_viewer',
    'page_viewer',
    'media_viewer'
  ];

  const regularPerms = regularPermissions.map(p => p.component_id);
  const missingRegularPerms = expectedRegularPermissions.filter(p => !regularPerms.includes(p));
  
  if (missingRegularPerms.length > 0) {
    throw new Error(`Missing regular user permissions: ${missingRegularPerms.join(', ')}`);
  }
  console.log('✓ Regular user permissions verified');

  // 6. Verify organization memberships
  const { data: memberships, error: membershipError } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', org.id);

  if (membershipError) {
    throw new Error(`Failed to fetch organization memberships: ${membershipError.message}`);
  }

  const adminMembership = memberships.find(m => m.user_id === adminUser.id);
  const regularMembership = memberships.find(m => m.user_id === regularUser.id);

  if (!adminMembership || adminMembership.role !== 'admin') {
    throw new Error('Admin user does not have admin role');
  }
  if (!regularMembership || regularMembership.role !== 'member') {
    throw new Error('Regular user does not have member role');
  }
  console.log('✓ Organization memberships verified');

  console.log('All verifications passed successfully!');
  return true;
}

// Run the verification
verifyTest3Setup()
  .then(() => {
    console.log('Setup verification completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup verification failed:', error);
    process.exit(1);
  }); 
