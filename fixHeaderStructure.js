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

async function fixHeaderStructure() {
  console.log('🔧 Fixing header structure for Puck...');
  
  try {
    // Get the current header
    const { data: header, error: fetchError } = await supabase
      .from('site_elements')
      .select('*')
      .eq('organization_id', TEST3_ORG_ID)
      .eq('type', 'header')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching header:', fetchError);
      return;
    }

    // Create a properly structured header for Puck
    const correctedHeaderData = {
      content: [
        {
          type: "Logo",
          props: {
            id: "logo-1",
            text: "Test3 Organization",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#000000"
          }
        },
        {
          type: "Navigation",
          props: {
            id: "nav-1",
            items: [
              { id: "nav-home", label: "Home", url: "/", openInNewTab: false },
              { id: "nav-about", label: "About", url: "/about", openInNewTab: false },
              { id: "nav-contact", label: "Contact", url: "/contact", openInNewTab: false }
            ],
            direction: "horizontal",
            spacing: "1rem",
            color: "#000000",
            hoverColor: "#007bff"
          }
        },
        {
          type: "Button",
          props: {
            id: "login-btn",
            text: "Login",
            variant: "outline",
            size: "default",
            url: "/login",
            openInNewTab: false
          }
        }
      ],
      root: {
        props: {
          title: "Test3 Organization Header with Auth"
        }
      }
    };

    const { error: updateError } = await supabase
      .from('site_elements')
      .update({ 
        content: correctedHeaderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', header.id);

    if (updateError) {
      console.error('❌ Error updating header:', updateError);
    } else {
      console.log('✅ Header structure fixed successfully!');
      console.log('🔄 Refresh your browser to see the corrected header');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

fixHeaderStructure(); 