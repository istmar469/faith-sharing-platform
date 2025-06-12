const { createClient } = require('@supabase/supabase-js');

// Use production Supabase with service role for RLS admin operations
const supabase = createClient(
  'https://pryfcspttlbogumcijju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew'
);

async function fixRLSPolicies() {
  try {
    console.log('Creating super admin bypass RLS policies for pages table...');
    
    // Since exec_sql doesn't exist, let's create the policies via Supabase Edge Functions
    // or use a migration. For now, let's check what the savePage function is doing
    
    console.log('The issue is that super admin detection works in the code but RLS policies don\'t allow it.');
    console.log('The RLS policies need to be updated to check the super_admins table.');
    
    // Let's create a migration file instead
    const migrationSQL = `
-- Add super admin override policies for pages table
DROP POLICY IF EXISTS "super_admins_can_insert_pages" ON pages;
DROP POLICY IF EXISTS "super_admins_can_update_pages" ON pages;

-- Policy for INSERT operations with super admin override
CREATE POLICY "super_admins_can_insert_pages" ON pages
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
      AND om.status = 'active'
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
);

-- Policy for UPDATE operations with super admin override
CREATE POLICY "super_admins_can_update_pages" ON pages
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
      AND om.status = 'active'
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
      AND om.status = 'active'
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
);
`;

    console.log('\nGenerated migration SQL:');
    console.log(migrationSQL);
    
    console.log('\n📝 Next steps:');
    console.log('1. Create a new migration file in supabase/migrations/');
    console.log('2. Copy the SQL above into the migration file');
    console.log('3. Run: supabase db push');
    console.log('4. Or apply the SQL directly in Supabase dashboard SQL editor');
    
    // Let's try a simple query to test connection
    const { data, error } = await supabase
      .from('super_admins')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error('Connection test failed:', error);
    } else {
      console.log('✅ Connection successful. Super admins found:', data?.length || 0);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixRLSPolicies(); 