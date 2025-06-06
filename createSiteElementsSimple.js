#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';

// You need to set this environment variable with your service role key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('💡 Please run this command with your service role key:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node createSiteElementsSimple.js');
  console.log('\n🔑 You can find your service role key in:');
  console.log('   Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, serviceRoleKey);

const TEST3_ORG_ID = '33333333-3333-3333-3333-333333333333';

async function createSiteElements() {
  console.log('🔍 Checking existing site elements...');
  
  try {
    // Check existing site elements
    const { data: elements, error: elementsError } = await supabase
      .from('site_elements')
      .select('*')
      .eq('organization_id', TEST3_ORG_ID);

    if (elementsError) {
      console.error('❌ Error fetching site elements:', elementsError);
      return;
    }

    console.log(`📊 Found ${elements?.length || 0} existing site elements`);
    
    if (elements && elements.length > 0) {
      elements.forEach(element => {
        console.log(`  - ${element.type}: ${element.published ? '✅ Published' : '❌ Unpublished'} (ID: ${element.id})`);
      });
    }

    const hasHeader = elements?.some(el => el.type === 'header');
    const hasFooter = elements?.some(el => el.type === 'footer');

    if (!hasHeader) {
      console.log('\n🔨 Creating default header...');
      await createDefaultHeader();
    } else {
      console.log('✅ Header already exists');
    }

    if (!hasFooter) {
      console.log('\n🔨 Creating default footer...');
      await createDefaultFooter();
    } else {
      console.log('✅ Footer already exists');
    }

    console.log('\n🎉 Site elements setup complete!');
    console.log('🔄 Refresh your browser to see the header and footer');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function createDefaultHeader() {
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

  const { data, error } = await supabase
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

async function createDefaultFooter() {
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

  const { data, error } = await supabase
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

createSiteElements(); 