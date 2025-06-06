const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vlbqqibqxtsnybxgvhpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
);

console.log('🔧 Applying super admin pages policies directly...');

const applySuperAdminPagesPolicies = async () => {
  try {
    // Drop existing policies that might conflict first (ignore errors if they don't exist)
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Super admins can view all pages" ON "public"."pages"',
      'DROP POLICY IF EXISTS "Super admins can create pages for any organization" ON "public"."pages"',
      'DROP POLICY IF EXISTS "Super admins can update any pages" ON "public"."pages"',
      'DROP POLICY IF EXISTS "Super admins can delete any pages" ON "public"."pages"'
    ];

    console.log('🗑️ Dropping existing policies...');
    for (const dropPolicy of dropPolicies) {
      const { error } = await supabase.from('_').select('1').limit(0); // Just to test connection
      // Use direct postgres client approach
      const { data, error: sqlError } = await supabase.rpc('exec', { 
        sql: dropPolicy 
      });
      // Ignore errors as policies might not exist
    }

    // Create the new policies
    const createPolicies = [
      `CREATE POLICY "Super admins can view all pages" ON "public"."pages"
       FOR SELECT TO "authenticated" 
       USING (
         EXISTS (
           SELECT 1 FROM "public"."super_admins" 
           WHERE "super_admins"."user_id" = "auth"."uid"()
         )
       )`,

      `CREATE POLICY "Super admins can create pages for any organization" ON "public"."pages"
       FOR INSERT TO "authenticated"
       WITH CHECK (
         EXISTS (
           SELECT 1 FROM "public"."super_admins" 
           WHERE "super_admins"."user_id" = "auth"."uid"()
         )
       )`,

      `CREATE POLICY "Super admins can update any pages" ON "public"."pages"
       FOR UPDATE TO "authenticated"
       USING (
         EXISTS (
           SELECT 1 FROM "public"."super_admins" 
           WHERE "super_admins"."user_id" = "auth"."uid"()
         )
       )`,

      `CREATE POLICY "Super admins can delete any pages" ON "public"."pages"
       FOR DELETE TO "authenticated"
       USING (
         EXISTS (
           SELECT 1 FROM "public"."super_admins" 
           WHERE "super_admins"."user_id" = "auth"."uid"()
         )
       )`
    ];

    console.log('✨ Creating new super admin policies...');
    for (const [index, policy] of createPolicies.entries()) {
      console.log(`📝 Creating policy ${index + 1}/4...`);
      
      // Use the service role to execute raw SQL
      const response = await fetch('https://vlbqqibqxtsnybxgvhpz.supabase.co/rest/v1/rpc/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
        },
        body: JSON.stringify({ sql: policy })
      });
      
      if (response.ok) {
        console.log(`✅ Policy ${index + 1} created successfully`);
      } else {
        const errorData = await response.text();
        console.error(`❌ Error creating policy ${index + 1}:`, errorData);
      }
    }

    console.log('🎉 Super admin pages policies setup complete!');
    
  } catch (error) {
    console.error('❌ Error applying policies:', error);
  }
};

applySuperAdminPagesPolicies(); 