const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vlbqqibqxtsnybxgvhpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
);

console.log('🔍 Checking for homepage for main domain organization...');

(async () => {
  try {
    // First check the main organization ID
    const mainOrgId = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84';
    
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', mainOrgId);

    if (orgError) {
      console.error('❌ Error getting organization:', orgError);
      return;
    }

    console.log('✅ Main organization:', orgs);

    // Check for homepage pages
    const { data: pages, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', mainOrgId);

    if (pageError) {
      console.error('❌ Error getting pages:', pageError);
      return;
    }

    console.log('📄 All pages for main domain:', pages?.length || 0);
    if (pages) {
      pages.forEach(page => {
        console.log(`  - ${page.title} (${page.slug}) - Homepage: ${page.is_homepage}, Published: ${page.published}`);
      });
    }

    const homepagePages = pages?.filter(p => p.is_homepage) || [];
    const publishedHomepagePages = pages?.filter(p => p.is_homepage && p.published) || [];

    console.log('🏠 Homepage pages:', homepagePages.length);
    console.log('✅ Published homepage pages:', publishedHomepagePages.length);

    if (publishedHomepagePages.length === 0) {
      console.log('❌ No published homepage found for main domain - this is why visitors see the "No published homepage" message');
    } else {
      console.log('✅ Published homepage found:', publishedHomepagePages[0].title);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
})(); 