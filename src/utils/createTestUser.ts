
import { supabase } from '@/integrations/supabase/client';

export const createTestAdminUser = async () => {
  try {
    console.log('Creating test admin user for Test3...');
    
    // First, try to sign up the test user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test3admin@example.com',
      password: 'Test123!',
      options: {
        data: {
          full_name: 'Test3 Admin',
          role: 'org_admin'
        }
      }
    });

    if (signupError && !signupError.message.includes('User already registered')) {
      console.error('Error creating test user:', signupError);
      return { success: false, error: signupError.message };
    }

    const userId = signupData?.user?.id;
    if (!userId) {
      console.error('No user ID returned from signup');
      return { success: false, error: 'Failed to create user' };
    }

    console.log('Test user created with ID:', userId);

    // Get the Test3 organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('subdomain', 'test3')
      .single();

    if (orgError || !orgData) {
      console.error('Error finding Test3 organization:', orgError);
      return { success: false, error: 'Test3 organization not found' };
    }

    console.log('Found Test3 organization:', orgData);

    // Add user as admin to the Test3 organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: orgData.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) {
      console.error('Error adding user to organization:', memberError);
      return { success: false, error: 'Failed to add user to organization' };
    }

    console.log('Successfully added test user as admin to Test3 organization');

    return {
      success: true,
      user: {
        id: userId,
        email: 'test3admin@example.com',
        organizationId: orgData.id,
        organizationName: orgData.name
      }
    };

  } catch (error) {
    console.error('Unexpected error creating test user:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const signInTestAdmin = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test3admin@example.com',
      password: 'Test123!'
    });

    if (error) {
      console.error('Error signing in test admin:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully signed in test admin');
    return { success: true, data };

  } catch (error) {
    console.error('Unexpected error signing in:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};
