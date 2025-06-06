#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTgyODQsImV4cCI6MjA2MjA5NDI4NH0.NCJqTUhWyUy1kGzrnx16kBcWET9A3qhPFc0Q_h6nMzQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST3_ORG_ID = '33333333-3333-3333-3333-333333333333';

async function checkSiteElements() {
  console.log('🔍 Checking site elements for test3 organization...');
  
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

    console.log(`📊 Found ${elements?.length || 0} site elements:`);
    if (elements && elements.length > 0) {
      elements.forEach(element => {
        console.log(`  - ${element.type}: ${element.published ? '✅ Published' : '❌ Unpublished'} (ID: ${element.id})`);
      });
    } else {
      console.log('  No site elements found');
    }

    // Check if we need to create default elements
    const hasHeader = elements?.some(el => el.type === 'header');
    const hasFooter = elements?.some(el => el.type === 'footer');

    if (!hasHeader) {
      console.log('\n🔨 Creating default header...');
      await createDefaultHeader();
    }

    if (!hasFooter) {
      console.log('\n🔨 Creating default footer...');
      await createDefaultFooter();
    }

    if (hasHeader && hasFooter) {
      console.log('\n✅ Both header and footer exist!');
    }

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

checkSiteElements(); 