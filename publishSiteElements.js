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

async function publishSiteElements() {
  console.log('🔍 Finding unpublished site elements...');
  
  try {
    // Get all site elements for the organization
    const { data: elements, error: elementsError } = await supabase
      .from('site_elements')
      .select('*')
      .eq('organization_id', TEST3_ORG_ID);

    if (elementsError) {
      console.error('❌ Error fetching site elements:', elementsError);
      return;
    }

    console.log(`📊 Found ${elements?.length || 0} site elements:`);
    
    if (elements && elements.length > 0) {
      for (const element of elements) {
        console.log(`  - ${element.type}: ${element.published ? '✅ Published' : '❌ Unpublished'} (ID: ${element.id})`);
        
        if (!element.published) {
          console.log(`    📤 Publishing ${element.type}...`);
          
          const { error: publishError } = await supabase
            .from('site_elements')
            .update({ published: true })
            .eq('id', element.id);

          if (publishError) {
            console.error(`    ❌ Error publishing ${element.type}:`, publishError);
          } else {
            console.log(`    ✅ Successfully published ${element.type}`);
          }
        }
      }
    }

    console.log('\n🎉 Site elements publish complete!');
    console.log('🔄 Refresh your browser to see the header and footer');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

publishSiteElements(); 