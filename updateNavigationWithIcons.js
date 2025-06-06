import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryxcsptllbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const organizationId = '33333333-3333-3333-3333-333333333333';

async function updateNavigationConfiguration(enableIcons = true) {
  try {
    console.log(`🔄 ${enableIcons ? 'Enabling' : 'Disabling'} icons in navigation...`);

    // Get current header data
    const { data: currentData, error: fetchError } = await supabase
      .from('site_elements')
      .select('content')
      .eq('id', 1)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current header:', fetchError);
      return;
    }

    console.log('✅ Current header data retrieved');

    // Update the navigation component in the zones
    const updatedContent = { ...currentData.content };
    
    if (updatedContent.zones && updatedContent.zones['header-1:navigation']) {
      updatedContent.zones['header-1:navigation'] = [
        {
          type: 'Navigation',
          props: {
            items: [
              { id: '1', label: 'Home', url: '/', icon: '🏠', openInNewTab: false },
              { id: '2', label: 'About', url: '/about', icon: 'ℹ️', openInNewTab: false },
              { id: '3', label: 'Contact', url: '/contact', icon: '📞', openInNewTab: false }
            ],
            layout: 'horizontal',
            showIcons: enableIcons, // This is the key setting!
            spacing: '1.5rem',
            fontSize: '15px',
            fontWeight: '500',
            color: '#374151',
            hoverColor: '#1f2937'
          }
        }
      ];
    }

    // Update the database
    const { data, error } = await supabase
      .from('site_elements')
      .update({ 
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .eq('organization_id', organizationId)
      .select();

    if (error) {
      console.error('❌ Error updating navigation:', error);
      return;
    }

    console.log(`✅ Navigation updated successfully!`);
    console.log(`🎨 Icons are now ${enableIcons ? 'ENABLED' : 'DISABLED'}`);
    
    if (enableIcons) {
      console.log('📋 Current icons:');
      console.log('   🏠 Home');
      console.log('   ℹ️ About');
      console.log('   📞 Contact');
      console.log('');
      console.log('🔧 To customize icons:');
      console.log('   1. Go to your page builder dashboard');
      console.log('   2. Edit the header navigation component');
      console.log('   3. Modify the "Icon" field for each navigation item');
      console.log('   4. Or toggle "Show Icons" to disable them entirely');
    } else {
      console.log('📋 Icons are hidden - clean text-only navigation');
      console.log('🔧 To enable icons, set "Show Icons" to "Yes" in the navigation component settings');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// You can change this to false to disable icons
const ENABLE_ICONS = true;

updateNavigationConfiguration(ENABLE_ICONS); 