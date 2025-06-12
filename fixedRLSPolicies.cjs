const { createClient } = require('@supabase/supabase-js');

// Use production Supabase with service role for RLS admin operations
const supabase = createClient(
  'https://pryfcspttlbogumcijju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew',
  {
    auth: {
      persistSession: false
    }
  }
);

async function generateFixedRLSPolicies() {
  try {
    console.log('🔧 Generating CORRECTED RLS policies...');
    console.log('✅ Fixed issues:');
    console.log('   - Removed non-existent "status" column');
    console.log('   - Super admin override works without organization membership requirement');
    
    const sqlCommands = [
      `-- Drop existing policies`,
      `DROP POLICY IF EXISTS "super_admins_can_insert_pages" ON pages;`,
      `DROP POLICY IF EXISTS "super_admins_can_update_pages" ON pages;`,
      ``,
      `-- Fixed INSERT policy (without status column)`,
      `CREATE POLICY "super_admins_can_insert_pages" ON pages
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (any role)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check (works without organization membership)
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
);`,
      ``,
      `-- Fixed UPDATE policy (without status column)`,
      `CREATE POLICY "super_admins_can_update_pages" ON pages
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (any role)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check (works without organization membership)
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (any role)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check (works without organization membership)
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
);`
    ];
    
    console.log('\n📋 CORRECTED SQL Commands to run in Supabase Dashboard SQL Editor:');
    console.log('=' .repeat(80));
    
    sqlCommands.forEach((sql) => {
      console.log(sql);
    });
    
    console.log('=' .repeat(80));
    console.log('\n📝 Instructions:');
    console.log('1. Go to https://supabase.com/dashboard/project/pryfcspttlbogumcijju/sql/new');
    console.log('2. Copy and paste the SQL commands above');
    console.log('3. Click "Run" to execute');
    console.log('4. This will add corrected super admin override policies');
    
    console.log('\n✅ Key fixes:');
    console.log('   - Removed the non-existent "status" column reference');
    console.log('   - Super admins can now create/edit pages for ANY organization');
    console.log('   - Regular users still need organization membership');
    
    // Test connection
    const { data, error } = await supabase
      .from('super_admins')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error('\n❌ Connection test failed:', error);
    } else {
      console.log('\n✅ Connection successful. Super admins found:', data?.length || 0);
      console.log('🔑 Super admin user ID:', data?.[0]?.user_id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateFixedRLSPolicies(); 