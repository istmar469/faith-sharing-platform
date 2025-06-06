const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vlbqqibqxtsnybxgvhpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
);

console.log('🔧 Applying super admin pages policies...');

const applySuperAdminPagesPolicies = async () => {
  try {
    // Apply all the super admin policies for pages table
    const policies = [
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

    for (const [index, policy] of policies.entries()) {
      console.log(`📝 Applying policy ${index + 1}/4...`);
      const { error } = await supabase.rpc('exec_sql', { 
        sql: policy 
      });
      
      if (error) {
        console.error(`❌ Error applying policy ${index + 1}:`, error);
      } else {
        console.log(`✅ Policy ${index + 1} applied successfully`);
      }
    }

    console.log('🎉 All super admin pages policies applied!');
    
  } catch (error) {
    console.error('❌ Error applying policies:', error);
  }
};

applySuperAdminPagesPolicies(); 