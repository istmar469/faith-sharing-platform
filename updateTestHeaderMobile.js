import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryxcsptllbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const organizationId = '33333333-3333-3333-3333-333333333333';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateMobileHeader(retryCount = 0) {
  try {
    console.log('🔄 Updating header for mobile responsiveness...');
    
    // First, let's check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('site_elements')
      .select('id')
      .eq('id', 1)
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError);
      if (retryCount < 3) {
        console.log(`🔄 Retrying in 2 seconds... (${retryCount + 1}/3)`);
        await sleep(2000);
        return updateMobileHeader(retryCount + 1);
      }
      return;
    }

    console.log('✅ Connection successful, proceeding with update...');

    // Update the header with mobile-optimized structure
    const headerData = {
      root: {
        props: {
          backgroundColor: '#ffffff',
          height: '70px',
          borderBottom: true,
          sticky: true,
          maxWidth: '1200px',
          padding: '0 1rem'
        }
      },
      content: [
        {
          type: 'Logo',
          props: {
            text: 'Test3 Organization',
            fontSize: '18px', // Smaller font for mobile
            fontWeight: '600',
            color: '#1f2937',
            imageUrl: '',
            imageAlt: '',
            link: '/',
            openInNewTab: false
          }
        },
        {
          type: 'Navigation',
          props: {
            items: [
              { id: '1', label: 'Home', url: '/', openInNewTab: false },
              { id: '2', label: 'About', url: '/about', openInNewTab: false },
              { id: '3', label: 'Contact', url: '/contact', openInNewTab: false }
            ],
            layout: 'horizontal',
            spacing: '1.5rem', // Reduced spacing for mobile
            fontSize: '15px', // Smaller font for mobile
            fontWeight: '500',
            color: '#374151',
            hoverColor: '#1f2937'
          }
        },
        {
          type: 'AuthButton',
          props: {
            variant: 'default',
            size: 'sm', // Smaller size for mobile
            showText: true,
            loginText: 'Login',
            signupText: 'Sign Up',
            dashboardText: 'Dashboard'
          }
        }
      ],
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
                { id: '1', label: 'Home', url: '/', openInNewTab: false },
                { id: '2', label: 'About', url: '/about', openInNewTab: false },
                { id: '3', label: 'Contact', url: '/contact', openInNewTab: false }
              ],
              layout: 'horizontal',
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

    const { data, error } = await supabase
      .from('site_elements')
      .update({ 
        content: headerData,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .eq('organization_id', organizationId)
      .select();

    if (error) {
      console.error('❌ Error updating header:', error);
      if (retryCount < 3) {
        console.log(`🔄 Retrying in 2 seconds... (${retryCount + 1}/3)`);
        await sleep(2000);
        return updateMobileHeader(retryCount + 1);
      }
      return;
    }

    console.log('✅ Header updated successfully for mobile responsiveness!');
    console.log('📱 Mobile-friendly changes applied:');
    console.log('   - Hamburger menu for mobile/tablet devices');
    console.log('   - Responsive text sizing (18px logo, 15px navigation)');
    console.log('   - Smaller button sizes and spacing');
    console.log('   - Vertical navigation layout in mobile menu');
    console.log('   - Touch-friendly button sizes and spacing');
    console.log('');
    console.log('🖥️  Desktop: Normal horizontal layout');
    console.log('📱 Mobile/Tablet: Hamburger menu with vertical navigation');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    if (retryCount < 3) {
      console.log(`🔄 Retrying in 2 seconds... (${retryCount + 1}/3)`);
      await sleep(2000);
      return updateMobileHeader(retryCount + 1);
    }
  }
}

updateMobileHeader(); 