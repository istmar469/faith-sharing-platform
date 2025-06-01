
import { supabase } from '../../integrations/supabase/client';

// Simple interface to avoid type complexity
interface SimpleUser {
  id: string;
  email: string;
}

async function verifyTest3Setup() {
  try {
    console.log('🔍 Verifying Test3 Organization Setup...');
    
    // Check if Test3 organization exists
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', 'Test3')
      .single();

    if (orgError || !orgData) {
      console.log('❌ Test3 organization not found');
      return false;
    }

    console.log('✅ Test3 organization found:', orgData);

    // Check organization members
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('organization_id', orgData.id);

    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
      return false;
    }

    console.log('👥 Organization members:', members);

    // Create simple user objects to avoid type issues
    const usersList: SimpleUser[] = [];
    
    if (members && members.length > 0) {
      members.forEach(member => {
        if (member.profiles && typeof member.profiles === 'object') {
          const profile = member.profiles as any;
          if (profile.email) {
            usersList.push({
              id: profile.id,
              email: profile.email
            });
          }
        }
      });
    }

    console.log('📧 User emails found:', usersList.map(u => u.email));

    // Check church_info
    const { data: churchInfo, error: churchError } = await supabase
      .from('church_info')
      .select('*')
      .eq('organization_id', orgData.id)
      .single();

    if (churchError) {
      console.log('⚠️ No church_info found for Test3:', churchError.message);
    } else {
      console.log('⛪ Church info found:', churchInfo);
    }

    // Check pages
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('organization_id', orgData.id);

    if (pagesError) {
      console.error('❌ Error fetching pages:', pagesError);
    } else {
      console.log('📄 Pages found:', pages?.length || 0);
    }

    console.log('✅ Test3 setup verification complete');
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// Export for use in other files
export { verifyTest3Setup };

// Run verification if this file is executed directly
if (typeof window !== 'undefined') {
  verifyTest3Setup();
}
