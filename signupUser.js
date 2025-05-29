// signupUser.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co'; // Your Supabase project URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // Use your anon/public key

if (!SUPABASE_ANON_KEY) {
  console.error('Please set SUPABASE_ANON_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signupUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@church-os.com',
    password: '@dmin123',
  });

  if (error) {
    console.error('Error signing up user:', error);
  } else {
    console.log('User signed up:', data.user);
  }
}

signupUser();