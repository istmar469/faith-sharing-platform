const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pryfcspttlbogumcijju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM2MDUzMSwiZXhwIjoyMDQ0OTM2NTMxfQ.zxxMSo9RKjHqmXI7cTYOJ87KrL3EW0KOsG_iCJuPP-M'
);

async function checkRLSPolicies() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies 
        WHERE tablename = 'pages' 
        ORDER BY policyname;
      `
    });
    
    if (error) throw error;
    console.log('Current RLS policies for pages table:');
    console.log(JSON.stringify(data, null, 2));
    
    // Also check for super admin function
    const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT routine_name, routine_definition 
        FROM information_schema.routines 
        WHERE routine_name LIKE '%super_admin%' OR routine_name LIKE '%admin_status%';
      `
    });
    
    if (funcError) throw funcError;
    console.log('\nSuper admin related functions:');
    console.log(JSON.stringify(funcData, null, 2));
    
  } catch (error) {
    console.error('Error checking RLS policies:', error);
  }
}

checkRLSPolicies(); 