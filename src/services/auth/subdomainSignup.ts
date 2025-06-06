import { supabase } from '@/integrations/supabase/client';

export interface SubdomainSignupData {
  organizationId: string;
  organizationName: string;
  userEmail: string;
}

/**
 * Handles adding a user to an organization after they've signed up from a subdomain
 * This is called after email verification or immediate auth
 */
export async function addUserToSubdomainOrganization(
  userId: string, 
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('SubdomainSignup: Adding user to organization:', { userId, organizationId });

    // Check if organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      console.error('SubdomainSignup: Organization not found:', orgError);
      return { success: false, error: 'Organization not found' };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      console.log('SubdomainSignup: User already a member');
      return { success: true };
    }

    // Add user as admin to the organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) {
      console.error('SubdomainSignup: Error adding user to organization:', memberError);
      return { success: false, error: 'Failed to add user to organization' };
    }

    console.log('SubdomainSignup: Successfully added user to organization');
    return { success: true };

  } catch (error) {
    console.error('SubdomainSignup: Unexpected error:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
}

/**
 * Processes pending subdomain signups when user verification is complete
 * This should be called in auth state change handlers
 */
export async function processPendingSubdomainSignup(user: any): Promise<void> {
  try {
    const userMetadata = user.user_metadata || {};
    
    // Check if this was a subdomain signup
    if (!userMetadata.organization_signup || !userMetadata.target_organization_id) {
      return; // Not a subdomain signup
    }

    const organizationId = userMetadata.target_organization_id;
    console.log('SubdomainSignup: Processing pending signup for org:', organizationId);

    const result = await addUserToSubdomainOrganization(user.id, organizationId);
    
    if (result.success) {
      console.log('SubdomainSignup: Successfully processed pending signup');
    } else {
      console.error('SubdomainSignup: Failed to process pending signup:', result.error);
    }

  } catch (error) {
    console.error('SubdomainSignup: Error processing pending signup:', error);
  }
} 