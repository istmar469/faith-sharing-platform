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

async function applyRLSPolicies() {
  try {
    console.log('🔧 Applying RLS policies directly via SQL...');
    
    // Since we can't use exec_sql, let's try using the SQL editor approach
    // We'll output the SQL that needs to be run manually in Supabase dashboard
    
    const sqlCommands = [
      `DROP POLICY IF EXISTS "super_admins_can_insert_pages" ON pages;`,
      `DROP POLICY IF EXISTS "super_admins_can_update_pages" ON pages;`,
      `
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
);`,
      `
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
);`
    ];
    
    console.log('\n📋 SQL Commands to run in Supabase Dashboard SQL Editor:');
    console.log('=' .repeat(80));
    
    sqlCommands.forEach((sql, index) => {
      console.log(`-- Command ${index + 1}:`);
      console.log(sql);
      console.log('');
    });
    
    console.log('=' .repeat(80));
    console.log('\n📝 Instructions:');
    console.log('1. Go to https://supabase.com/dashboard/project/pryfcspttlbogumcijju/sql/new');
    console.log('2. Copy and paste the SQL commands above');
    console.log('3. Click "Run" to execute');
    console.log('4. This will add super admin override policies to the pages table');
    
    // Test connection
    const { data, error } = await supabase
      .from('super_admins')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error('\n❌ Connection test failed:', error);
    } else {
      console.log('\n✅ Connection successful. Super admins found:', data?.length || 0);
      console.log('🔑 User ID in super_admins table:', data?.[0]?.user_id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyRLSPolicies(); 