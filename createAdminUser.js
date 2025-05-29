// createAdminUser.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co'; // Your Supabase project URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Set this in your environment

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@church-os.com',
    password: '@dmin123',
    email_confirm: true, // Auto-confirm the user
  });

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created:', data.user);
  }
}

createUser();