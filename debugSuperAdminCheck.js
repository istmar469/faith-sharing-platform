#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

const USER_EMAIL = 'icampos@istmardigital.com';
const USER_ID = '6e8143fa-207c-440f-a3b1-adf586b5f283';

async function debugSuperAdminCheck() {
  console.log('🔍 Debugging super admin check...');
  console.log(`👤 User Email: ${USER_EMAIL}`);
  console.log(`🆔 User ID: ${USER_ID}`);
  
  try {
    // 1. Check if user exists in super_admins table
    console.log('\n📋 Checking super_admins table...');
    const { data: superAdmins, error: superAdminsError } = await supabase
      .from('super_admins')
      .select('*')
      .eq('user_id', USER_ID);

    if (superAdminsError) {
      console.error('❌ Error querying super_admins table:', superAdminsError);
    } else {
      console.log(`✅ Found ${superAdmins?.length || 0} records in super_admins table:`, superAdmins);
    }

    // 2. Test the direct_super_admin_check RPC function
    console.log('\n🔧 Testing direct_super_admin_check RPC...');
    
    // We need to test this with the actual user context, but let's first check what the RPC does
    const { data: rpcResult, error: rpcError } = await supabase.rpc('direct_super_admin_check');
    
    if (rpcError) {
      console.error('❌ RPC Error:', rpcError);
    } else {
      console.log('✅ RPC Result:', rpcResult);
    }

    // 3. Check the RPC function definition
    console.log('\n📝 The RPC function needs to be called in the context of the authenticated user.');
    console.log('🔑 The issue might be that the RPC is being called from service role instead of user context.');
    
    // 4. Check if there are any auth.uid() issues
    console.log('\n🔍 Checking auth context in RPC...');
    console.log('💡 The direct_super_admin_check RPC likely uses auth.uid() which returns NULL when called with service role.');
    console.log('🛠️  Solution: The RPC needs to be called from the browser with user authentication, not from service role.');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

debugSuperAdminCheck(); 