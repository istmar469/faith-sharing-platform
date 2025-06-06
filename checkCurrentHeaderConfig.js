import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryxcsptllbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const organizationId = '33333333-3333-3333-3333-333333333333';

async function checkCurrentHeaderConfig() {
  try {
    console.log('🔍 Checking current header configuration...');

    // Get current header data
    const { data: currentData, error: fetchError } = await supabase
      .from('site_elements')
      .select('*')
      .eq('id', 1)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current header:', fetchError);
      return;
    }

    console.log('✅ Current header data:');
    console.log('📄 Element Type:', currentData.element_type);
    console.log('📄 Published:', currentData.is_published);
    console.log('📄 Updated At:', currentData.updated_at);
    console.log('');
    
    if (currentData.content) {
      console.log('🏗️  Header Structure:');
      console.log('   Root Component:', currentData.content.root?.props ? 'Has props' : 'No props');
      
      if (currentData.content.content && Array.isArray(currentData.content.content)) {
        console.log('   Content Array Length:', currentData.content.content.length);
        currentData.content.content.forEach((item, index) => {
          console.log(`   Content[${index}]:`, item.type);
        });
      }
      
      if (currentData.content.zones) {
        console.log('   Zones:');
        Object.keys(currentData.content.zones).forEach(zone => {
          console.log(`     ${zone}:`, currentData.content.zones[zone]?.length || 0, 'items');
          if (currentData.content.zones[zone]?.length > 0) {
            currentData.content.zones[zone].forEach((item, index) => {
              console.log(`       [${index}] ${item.type}:`, Object.keys(item.props || {}));
            });
          }
        });
      }
      
      console.log('');
      console.log('🔧 Full Content Structure:');
      console.log(JSON.stringify(currentData.content, null, 2));
    } else {
      console.log('❌ No content found in header');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCurrentHeaderConfig(); 