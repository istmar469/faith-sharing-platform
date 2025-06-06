import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pryfcspttlbogumcijju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTgyODQsImV4cCI6MjA2MjA5NDI4NH0.NCJqTUhWyUy1kGzrnx16kBcWET9A3qhPFc0Q_h6nMzQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubdomainSignup() {
  try {
    const orgId = '0f31f02b-eb03-4b94-a993-4af0077c531a';
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    console.log('Testing subdomain-aware signup for test3 organization...');
    console.log('Organization ID:', orgId);
    console.log('Test Email:', testEmail);
    
    // Step 1: Create a test user with subdomain metadata
    console.log('\nStep 1: Creating test user with subdomain signup metadata...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          organization_signup: true,
          target_organization_id: orgId,
          organization_name: 'Canaan Garland',
        },
      },
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError);
      return;
    }

    console.log('✅ User created:', authData.user?.email);
    console.log('Session created:', !!authData.session);
    console.log('User metadata:', authData.user?.user_metadata);

    // Step 2: If user is immediately authenticated, add to organization
    if (authData.session && authData.user) {
      console.log('\nStep 2: Adding user to organization...');
      
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: authData.user.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('❌ Failed to add user to organization:', memberError);
        return;
      }

      console.log('✅ User added to organization as admin');

      // Step 3: Create a test homepage
      console.log('\nStep 3: Creating test homepage...');
      
      const homepageData = {
        title: 'Welcome to Canaan Garland',
        slug: 'home',
        content: {
          content: [
            {
              type: 'Hero',
              props: {
                id: 'hero-1',
                title: 'Welcome to Canaan Garland',
                subtitle: 'Join us for worship, fellowship, and growing in faith together.',
                buttonText: 'Learn More',
                buttonLink: '#about',
                backgroundColor: '#3B82F6',
                gradientFrom: '#3B82F6',
                gradientTo: '#8B5CF6',
                useGradient: true,
                textColor: 'white',
                size: 'large',
                alignment: 'center'
              }
            }
          ],
          root: {
            props: {}
          }
        },
        organization_id: orgId,
        published: true,
        is_homepage: true,
        show_in_navigation: false,
        meta_title: 'Welcome to Canaan Garland',
        meta_description: 'Join our church community for worship and fellowship',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .insert(homepageData)
        .select()
        .single();
        
      if (pageError) {
        console.error('❌ Failed to create homepage:', pageError);
        return;
      }
      
      console.log('✅ Homepage created:', pageData.title);
      
      console.log('\n🎉 SUCCESS! Subdomain signup test completed!');
      console.log('\n✅ Summary:');
      console.log(`  - User created: ${authData.user.email}`);
      console.log(`  - Added to organization: Canaan Garland`);
      console.log(`  - Role: admin`);
      console.log(`  - Homepage created: ${pageData.title}`);
      console.log(`  - Published: ${pageData.published}`);
      console.log(`  - Is homepage: ${pageData.is_homepage}`);
      
      console.log('\n🌐 The subdomain test3.church-os.com should now display the homepage!');
      console.log('\n📝 Next steps:');
      console.log('  1. Visit test3.church-os.com');
      console.log('  2. Click "Sign In" and use the credentials above');
      console.log('  3. You should be able to edit pages and create content');
      
    } else {
      console.log('\n📧 Email verification required');
      console.log('The user would need to verify their email, then our auth handler would process the organization membership');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Clean up function to remove test data
async function cleanupTestData() {
  try {
    console.log('Cleaning up test data...');
    
    // Remove test user if exists
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'test@example.com');
    
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        // Remove from organization_members
        await supabase
          .from('organization_members')
          .delete()
          .eq('user_id', profile.id);
      }
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--cleanup')) {
  cleanupTestData();
} else {
  testSubdomainSignup();
} 