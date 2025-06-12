const { createClient } = require('@supabase/supabase-js');

// Use production Supabase with service role for schema inspection
const supabase = createClient(
  'https://pryfcspttlbogumcijju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew',
  {
    auth: {
      persistSession: false
    }
  }
);

async function checkOrgMembersSchema() {
  try {
    console.log('🔍 Checking organization_members table schema...');
    
    // Get a sample record to see the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('organization_members')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
    } else {
      console.log('✅ Sample organization_members record:');
      console.log(JSON.stringify(sampleData, null, 2));
      
      if (sampleData && sampleData.length > 0) {
        console.log('\n📋 Available columns:');
        Object.keys(sampleData[0]).forEach(column => {
          console.log(`  - ${column}: ${typeof sampleData[0][column]} (${sampleData[0][column]})`);
        });
      }
    }
    
    // Also check for the main domain organization super admin
    console.log('\n🔍 Checking for super admin in organization_members...');
    const { data: adminData, error: adminError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', '6e8143fa-207c-440f-a3b1-adf586b5f283')
      .eq('organization_id', 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84');
      
    if (adminError) {
      console.error('❌ Error checking admin membership:', adminError);
    } else {
      console.log('🔑 Super admin membership record:');
      console.log(JSON.stringify(adminData, null, 2));
    }
    
    // Check all records for this user
    console.log('\n🔍 All organization memberships for super admin...');
    const { data: allMemberships, error: allError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', '6e8143fa-207c-440f-a3b1-adf586b5f283');
      
    if (allError) {
      console.error('❌ Error checking all memberships:', allError);
    } else {
      console.log('📊 All memberships:');
      console.log(JSON.stringify(allMemberships, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkOrgMembersSchema(); 