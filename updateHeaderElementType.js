import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryxcsptllbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const organizationId = '33333333-3333-3333-3333-333333333333';

async function updateHeaderElementType() {
  try {
    console.log('🔧 Ensuring header element type is correct...');

    // Update both the element_type and content structure
    const headerData = {
      root: {
        type: 'SimpleHeader',
        props: {
          backgroundColor: '#ffffff',
          height: '70px',
          borderBottom: true,
          sticky: true,
          maxWidth: '1200px',
          padding: '0 1rem'
        }
      },
      content: [],
      zones: {
        'header-1:logo': [
          {
            type: 'Logo',
            props: {
              text: 'Test3 Organization',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              imageUrl: '',
              imageAlt: '',
              link: '/',
              openInNewTab: false
            }
          }
        ],
        'header-1:navigation': [
          {
            type: 'Navigation',
            props: {
              items: [
                { id: '1', label: 'Home', url: '/', icon: '🏠', openInNewTab: false },
                { id: '2', label: 'About', url: '/about', icon: 'ℹ️', openInNewTab: false },
                { id: '3', label: 'Contact', url: '/contact', icon: '📞', openInNewTab: false }
              ],
              layout: 'horizontal',
              showIcons: false,
              spacing: '1.5rem',
              fontSize: '15px',
              fontWeight: '500',
              color: '#374151',
              hoverColor: '#1f2937'
            }
          }
        ],
        'header-1:actions': [
          {
            type: 'AuthButton',
            props: {
              variant: 'default',
              size: 'sm',
              showText: true,
              loginText: 'Login',
              signupText: 'Sign Up',
              dashboardText: 'Dashboard'
            }
          }
        ]
      }
    };

    // Update the header with proper element type and content
    const { data, error } = await supabase
      .from('site_elements')
      .update({ 
        element_type: 'SimpleHeader',
        content: headerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .eq('organization_id', organizationId)
      .select();

    if (error) {
      console.error('❌ Error updating header:', error);
      return;
    }

    console.log('✅ Header element type and content updated successfully!');
    console.log('📄 Element Type: SimpleHeader');
    console.log('📱 Mobile responsive features active');
    console.log('🔄 Changes should take effect immediately');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateHeaderElementType(); 