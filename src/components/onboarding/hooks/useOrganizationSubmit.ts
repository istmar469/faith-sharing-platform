
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { shouldRequireEmailVerification } from '@/utils/environment';
import { FormData } from './useOrganizationForm';

export const useOrganizationSubmit = () => {
  const { user } = useAuth();

  const notifySuperAdmins = async (organizationId: string, formData: FormData) => {
    try {
      console.log('Sending notification to super admins...');
      
      const { error } = await supabase.functions.invoke('notify-super-admin-new-org', {
        body: {
          organizationId,
          organizationName: formData.organizationName,
          subdomain: formData.subdomain,
          pastorName: formData.pastorName || undefined,
          contactEmail: formData.contactEmail,
          phoneNumber: formData.phoneNumber || undefined,
        }
      });

      if (error) {
        console.error('Failed to notify super admins:', error);
      } else {
        console.log('Super admin notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending super admin notification:', error);
    }
  };

  const submitOrganization = async (
    formData: FormData,
    setSubmitting: (value: boolean) => void,
    setSubmitError: (error: string | null) => void,
    onSuccess?: (organizationId: string, subdomain: string) => void
  ) => {
    if (!user) {
      setSubmitError('You must be logged in to create an organization');
      return;
    }

    if (shouldRequireEmailVerification() && !user.email_confirmed_at) {
      setSubmitError('Please verify your email address before creating an organization');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: organizationId, error } = await supabase.rpc('setup_new_organization', {
        org_name: formData.organizationName,
        org_subdomain: formData.subdomain,
        pastor_name: formData.pastorName || null,
        contact_email: formData.contactEmail,
        contact_role: 'admin',
        phone_number: formData.phoneNumber || null
      });

      if (error) {
        console.error('Organization creation error:', error);
        setSubmitError(`Failed to create organization: ${error.message}`);
        return;
      }

      console.log('Organization created successfully:', organizationId);
      
      // Send notification to super admins (non-blocking)
      notifySuperAdmins(organizationId, formData);
      
      if (onSuccess) {
        onSuccess(organizationId, formData.subdomain);
      }

    } catch (err: any) {
      console.error('Organization creation error:', err);
      setSubmitError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitOrganization };
};
