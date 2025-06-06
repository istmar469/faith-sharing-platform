const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vlbqqibqxtsnybxgvhpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnFxaWJxeHRzbnlieGd2aHB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTg2ODM4MSwiZXhwIjoyMDQ1NDQ0MzgxfQ.GiYC5yOQIWVDZOLQSK1vpEF0h_mVvRxGpTVFZGpB8lY'
);

console.log('👥 Adding super admin to main domain organization...');

const addSuperAdminToMainOrg = async () => {
  try {
    const superAdminUserId = '6e8143fa-207c-440f-a3b1-adf586b5f283'; // icampos@istmardigital.com
    const mainOrgId = 'df5b8196-7bc4-44fd-b3cb-e559f67c2f84'; // Church-OS Platform main org

    // Check if already a member
    const { data: existingMembership, error: checkError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', superAdminUserId)
      .eq('organization_id', mainOrgId);

    if (checkError) {
      console.error('❌ Error checking existing membership:', checkError);
      return;
    }

    if (existingMembership && existingMembership.length > 0) {
      console.log('✅ Super admin is already a member of the main organization');
      console.log('Current role:', existingMembership[0].role);
      return;
    }

    // Add as admin member
    const { data, error } = await supabase
      .from('organization_members')
      .insert({
        user_id: superAdminUserId,
        organization_id: mainOrgId,
        role: 'admin',
        joined_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error adding super admin to main org:', error);
    } else {
      console.log('✅ Successfully added super admin as admin member of main organization');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

addSuperAdminToMainOrg(); 