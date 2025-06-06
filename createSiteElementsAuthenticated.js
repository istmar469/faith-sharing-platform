#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTgyODQsImV4cCI6MjA2MjA5NDI4NH0.NCJqTUhWyUy1kGzrnx16kBcWET9A3qhPFc0Q_h6nMzQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST3_ORG_ID = '33333333-3333-3333-3333-333333333333';

async function createSiteElementsWithAuth() {
  console.log('🔍 Finding organization members for test3...');
  
  try {
    // First, let's find a user who is a member of this organization
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('user_id, role, users(email)')
      .eq('organization_id', TEST3_ORG_ID);

    if (membersError) {
      console.error('❌ Error fetching organization members:', membersError);
      return;
    }

    console.log(`📊 Found ${members?.length || 0} organization members:`);
    if (members && members.length > 0) {
      members.forEach(member => {
        console.log(`  - User ID: ${member.user_id}, Role: ${member.role}, Email: ${member.users?.email || 'N/A'}`);
      });

      // Try to sign in as the first admin/owner
      const adminMember = members.find(m => m.role === 'owner' || m.role === 'admin') || members[0];
      
      if (adminMember && adminMember.users?.email) {
        console.log(`\n🔐 Attempting to authenticate as: ${adminMember.users.email}`);
        
        // For this to work, we need the user's password or use service role key
        // Let's try a different approach - use service role key if available
        await createSiteElementsWithServiceRole();
      } else {
        console.log('❌ No suitable admin member found with email');
      }
    } else {
      console.log('❌ No organization members found');
      console.log('💡 You may need to add a user to this organization first');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function createSiteElementsWithServiceRole() {
  console.log('\n🔧 Attempting to create site elements with service role...');
  
  // Check if we have service role key in environment
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    console.log('💡 Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
    console.log('   You can find this key in your Supabase Dashboard → Settings → API');
    return;
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey);

  try {
    // Check existing site elements first
    const { data: elements, error: elementsError } = await supabaseAdmin
      .from('site_elements')
      .select('*')
      .eq('organization_id', TEST3_ORG_ID);

    if (elementsError) {
      console.error('❌ Error fetching site elements:', elementsError);
      return;
    }

    console.log(`📊 Found ${elements?.length || 0} existing site elements`);

    const hasHeader = elements?.some(el => el.type === 'header');
    const hasFooter = elements?.some(el => el.type === 'footer');

    if (!hasHeader) {
      console.log('\n🔨 Creating default header...');
      await createDefaultHeader(supabaseAdmin);
    } else {
      console.log('✅ Header already exists');
    }

    if (!hasFooter) {
      console.log('\n🔨 Creating default footer...');
      await createDefaultFooter(supabaseAdmin);
    } else {
      console.log('✅ Footer already exists');
    }

  } catch (error) {
    console.error('💥 Error with service role:', error);
  }
}

async function createDefaultHeader(supabaseClient) {
  const defaultHeaderData = {
    content: [
      {
        type: "SimpleHeader",
        props: {
          id: "header-1"
        }
      }
    ],
    root: {
      props: {
        title: "Test3 Organization Header"
      }
    }
  };

  const { data, error } = await supabaseClient
    .from('site_elements')
    .insert({
      organization_id: TEST3_ORG_ID,
      type: 'header',
      content: defaultHeaderData,
      published: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating header:', error);
  } else {
    console.log('✅ Header created successfully:', data.id);
  }
}

async function createDefaultFooter(supabaseClient) {
  const defaultFooterData = {
    content: [
      {
        type: "Text",
        props: {
          text: "© 2024 Test3 Organization. All rights reserved.",
          id: "footer-text-1"
        }
      }
    ],
    root: {
      props: {
        title: "Test3 Organization Footer"
      }
    }
  };

  const { data, error } = await supabaseClient
    .from('site_elements')
    .insert({
      organization_id: TEST3_ORG_ID,
      type: 'footer',
      content: defaultFooterData,
      published: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating footer:', error);
  } else {
    console.log('✅ Footer created successfully:', data.id);
  }
}

createSiteElementsWithAuth(); 