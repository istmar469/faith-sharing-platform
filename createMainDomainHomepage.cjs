const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vlbqqibqxtsnybxgvhpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
);

console.log('🏠 Creating homepage for main domain organization...');

const createMainDomainHomepage = async () => {
  try {
    const mainOrgId = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84';
    
    // Create a simple homepage content
    const homepageContent = {
      "content": [
        {
          "type": "church:header",
          "props": {
            "id": "main-header",
            "logo": "Church-OS",
            "navigation": [
              {"label": "Home", "href": "/"},
              {"label": "Features", "href": "#features"},
              {"label": "Pricing", "href": "#pricing"},
              {"label": "Support", "href": "#support"}
            ],
            "cta": {"label": "Sign In", "href": "/login"}
          }
        },
        {
          "type": "hero",
          "props": {
            "id": "hero-section",
            "title": "Welcome to Church-OS Platform",
            "subtitle": "Empowering churches with modern digital tools for ministry and community building.",
            "backgroundImage": "",
            "ctaText": "Get Started",
            "ctaLink": "/login"
          }
        },
        {
          "type": "features",
          "props": {
            "id": "features-section",
            "title": "Features",
            "features": [
              {
                "title": "Website Builder",
                "description": "Create beautiful church websites with our drag-and-drop builder.",
                "icon": "globe"
              },
              {
                "title": "Member Management",
                "description": "Keep track of your congregation and manage memberships easily.",
                "icon": "users"
              },
              {
                "title": "Event Planning",
                "description": "Organize church events and keep your community informed.",
                "icon": "calendar"
              }
            ]
          }
        }
      ],
      "root": {
        "props": {
          "title": "Church-OS Platform"
        }
      }
    };

    // Check if homepage already exists
    const { data: existingHomepage, error: checkError } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', mainOrgId)
      .eq('is_homepage', true);

    if (checkError) {
      console.error('❌ Error checking existing homepage:', checkError);
      return;
    }

    if (existingHomepage && existingHomepage.length > 0) {
      console.log('📄 Homepage already exists, updating it...');
      
      // Update existing homepage
      const { data: updatedPage, error: updateError } = await supabase
        .from('pages')
        .update({
          title: 'Church-OS Platform Homepage',
          content: homepageContent,
          published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHomepage[0].id)
        .select();

      if (updateError) {
        console.error('❌ Error updating homepage:', updateError);
        return;
      }

      console.log('✅ Homepage updated successfully:', updatedPage[0].title);
    } else {
      console.log('📄 Creating new homepage...');
      
      // Create new homepage
      const { data: newPage, error: createError } = await supabase
        .from('pages')
        .insert({
          title: 'Church-OS Platform Homepage',
          slug: 'home',
          content: homepageContent,
          organization_id: mainOrgId,
          published: true,
          show_in_navigation: false,
          is_homepage: true,
          meta_title: 'Church-OS Platform - Empowering Churches',
          meta_description: 'Modern digital tools for ministry and community building.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (createError) {
        console.error('❌ Error creating homepage:', createError);
        return;
      }

      console.log('✅ Homepage created successfully:', newPage[0].title);
    }

    console.log('🎉 Main domain homepage is now set up and published!');
    console.log('🌐 Visit church-os.com to see the homepage');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

createMainDomainHomepage(); 