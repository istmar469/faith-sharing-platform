const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://pryxcsptllbogumcijju.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');

    // Create a test user
    const testEmail = 'admin@church-os.com';
    const testPassword = 'admin123';

    console.log('📧 Creating user with email:', testEmail);

    // Create user using admin API
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true // Auto-confirm email
    });

    if (userError) {
      if (userError.message.includes('already registered')) {
        console.log('✅ User already exists:', testEmail);
        
        // Get existing user
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError);
          return;
        }
        
        const existingUser = existingUsers.users.find(u => u.email === testEmail);
        if (existingUser) {
          console.log('👤 Found existing user:', existingUser.id);
          
          // Make sure user is super admin
          await makeSuperAdmin(existingUser.id);
          
          console.log('✅ Test user ready!');
          console.log('📋 Login credentials:');
          console.log('   Email:', testEmail);
          console.log('   Password:', testPassword);
          console.log('🌐 Go to: http://localhost:8086/dashboard');
          return;
        }
      } else {
        console.error('❌ Error creating user:', userError);
        return;
      }
    }

    if (user?.user) {
      console.log('✅ User created successfully:', user.user.id);
      
      // Make user super admin
      await makeSuperAdmin(user.user.id);
      
      console.log('✅ Test user created and configured!');
      console.log('📋 Login credentials:');
      console.log('   Email:', testEmail);
      console.log('   Password:', testPassword);
      console.log('🌐 Go to: http://localhost:8086/dashboard');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function makeSuperAdmin(userId) {
  try {
    console.log('🔧 Making user super admin...');
    
    // Check if super admin record exists
    const { data: existing, error: checkError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking super admin status:', checkError);
      return;
    }

    if (existing) {
      console.log('✅ User is already a super admin');
      return;
    }

    // Add super admin record
    const { error: insertError } = await supabase
      .from('super_admins')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Error making user super admin:', insertError);
    } else {
      console.log('✅ User is now a super admin');
    }

  } catch (error) {
    console.error('💥 Error making super admin:', error);
  }
}

// Run the script
createTestUser(); 