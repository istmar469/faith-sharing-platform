#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, serviceRoleKey);
const TEST3_ORG_ID = '33333333-3333-3333-3333-333333333333';

async function checkCurrentHeader() {
  console.log('🔍 Checking current header structure...');
  
  try {
    const { data: elements, error } = await supabase
      .from('site_elements')
      .select('*')
      .eq('organization_id', TEST3_ORG_ID);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${elements?.length || 0} site elements:`);
    
    elements?.forEach(element => {
      console.log(`\n--- ${element.type.toUpperCase()} ---`);
      console.log(`ID: ${element.id}`);
      console.log(`Published: ${element.published}`);
      console.log(`Content:`, JSON.stringify(element.content, null, 2));
    });

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkCurrentHeader(); 