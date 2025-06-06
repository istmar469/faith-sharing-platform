#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pryfcspttlbogumcijju.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});

// Main domain organization ID from the logs
const MAIN_DOMAIN_ORG_ID = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84';

async function createMainDomainSiteElements() {
  console.log('🔍 Setting up site elements for main domain (church-os.com)...');
  console.log(`📋 Organization ID: ${MAIN_DOMAIN_ORG_ID}`);
  
  try {
    // First, verify the organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', MAIN_DOMAIN_ORG_ID)
      .single();

    if (orgError || !org) {
      console.error('❌ Error fetching organization:', orgError);
      return;
    }

    console.log(`✅ Found organization: ${org.name}`);

    // Check existing site elements
    const { data: elements, error: elementsError } = await supabase
      .from('site_elements')
      .select('*')
      .eq('organization_id', MAIN_DOMAIN_ORG_ID);

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
      console.log('\n🔨 Creating main domain header...');
      await createMainDomainHeader();
    } else {
      console.log('✅ Header already exists');
    }

    if (!hasFooter) {
      console.log('\n🔨 Creating main domain footer...');
      await createMainDomainFooter();
    } else {
      console.log('✅ Footer already exists');
    }

    console.log('\n🎉 Main domain site elements setup complete!');
    console.log('🔄 Refresh church-os.com to see the header and footer with super admin controls');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function createMainDomainHeader() {
  const headerData = {
    content: [
      {
        type: "SimpleHeader",
        props: {
          id: "main-header-1",
          logo: {
            text: "Church-OS Platform",
            url: "/"
          },
          navigation: [
            {
              id: "nav-1",
              label: "Home",
              url: "/",
              target: "_self"
            },
            {
              id: "nav-2", 
              label: "Features",
              url: "/features",
              target: "_self"
            },
            {
              id: "nav-3",
              label: "Pricing", 
              url: "/pricing",
              target: "_self"
            },
            {
              id: "nav-4",
              label: "Support",
              url: "/support", 
              target: "_self"
            }
          ],
          authButton: {
            text: "Sign in",
            showUserInfo: true
          }
        }
      }
    ],
    root: {
      props: {
        title: "Church-OS Platform Header"
      }
    }
  };

  const { data, error } = await supabase
    .from('site_elements')
    .insert({
      organization_id: MAIN_DOMAIN_ORG_ID,
      type: 'header',
      content: headerData,
      published: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating header:', error);
  } else {
    console.log('✅ Main domain header created successfully:', data.id);
  }
}

async function createMainDomainFooter() {
  const footerData = {
    content: [
      {
        type: "Text",
        props: {
          text: "© 2024 Church-OS Platform. Empowering faith communities with modern technology.",
          id: "main-footer-text-1"
        }
      }
    ],
    root: {
      props: {
        title: "Church-OS Platform Footer"
      }
    }
  };

  const { data, error } = await supabase
    .from('site_elements')
    .insert({
      organization_id: MAIN_DOMAIN_ORG_ID,
      type: 'footer',
      content: footerData,
      published: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating footer:', error);
  } else {
    console.log('✅ Main domain footer created successfully:', data.id);
  }
}

createMainDomainSiteElements(); 