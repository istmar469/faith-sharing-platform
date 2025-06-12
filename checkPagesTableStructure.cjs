const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pryfcspttlbogumcijju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew'
);

async function checkPagesTableStructure() {
  try {
    console.log('🔍 Checking pages table structure...');
    
    // Check what columns exist in the pages table
    const { data: tableInfo, error: tableError } = await supabase
      .from('pages')
      .select('*')
      .limit(0);  // Just get the structure, no data
    
    if (tableError) {
      console.error('❌ Error querying pages table:', tableError);
    } else {
      console.log('✅ Pages table accessible via API');
    }

    // Test creating a page without display_order to see the exact error
    console.log('\n🔍 Testing page creation without display_order...');
    const testPageWithoutDisplayOrder = {
      title: 'Test Page Without Display Order',
      slug: 'test-page-no-display-order-' + Date.now(),
      content: { content: [], root: { props: {} } },
      organization_id: 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
      published: false
    };

    const { data: createResult1, error: createError1 } = await supabase
      .from('pages')
      .insert(testPageWithoutDisplayOrder)
      .select();

    if (createError1) {
      console.error('❌ Page creation without display_order failed:', createError1);
    } else {
      console.log('✅ Page created without display_order:', createResult1[0]?.id);
      // Clean up
      if (createResult1 && createResult1.length > 0) {
        await supabase.from('pages').delete().eq('id', createResult1[0].id);
        console.log('🧹 Test page cleaned up');
      }
    }

    // Test with display_order
    console.log('\n🔍 Testing page creation with display_order...');
    const testPageWithDisplayOrder = {
      title: 'Test Page With Display Order',
      slug: 'test-page-with-display-order-' + Date.now(),
      content: { content: [], root: { props: {} } },
      organization_id: 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
      published: false,
      display_order: 1
    };

    const { data: createResult2, error: createError2 } = await supabase
      .from('pages')
      .insert(testPageWithDisplayOrder)
      .select();

    if (createError2) {
      console.error('❌ Page creation with display_order failed:', createError2);
    } else {
      console.log('✅ Page created with display_order:', createResult2[0]?.id);
      // Clean up
      if (createResult2 && createResult2.length > 0) {
        await supabase.from('pages').delete().eq('id', createResult2[0].id);
        console.log('🧹 Test page cleaned up');
      }
    }

    // Now let's check if we can set a default value for display_order
    console.log('\n📝 Recommendation:');
    console.log('1. The table is accessible but RLS policies may be blocking user access');
    console.log('2. Need to apply the super admin RLS policies manually');
    console.log('3. Should also set a default value for display_order');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPagesTableStructure(); 