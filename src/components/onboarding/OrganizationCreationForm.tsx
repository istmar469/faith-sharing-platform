import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { shouldRequireEmailVerification } from '@/utils/domain';
import { useOrganizationForm } from './hooks/useOrganizationForm';
import { useOrganizationSubmit } from './hooks/useOrganizationSubmit';
import { FormFields } from './components/FormFields';

interface OrganizationCreationFormProps {
  onSuccess?: (organizationId: string, subdomain: string) => void;
}

const OrganizationCreationForm: React.FC<OrganizationCreationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const {
    formData,
    subdomainStatus,
    submitting,
    submitError,
    isFormValid,
    handleInputChange,
    handleBlur,
    getFieldError,
    getFieldState,
    setSubmitting,
    setSubmitError
  } = useOrganizationForm();

  const { submitOrganization } = useOrganizationSubmit();

  const getInputClassName = (fieldName: keyof typeof formData) => {
    const state = getFieldState(fieldName);
    const baseClass = "w-full";
    
    if (state === 'valid') {
      return `${baseClass} border-green-500 focus:border-green-500`;
    } else if (state === 'invalid') {
      return `${baseClass} border-red-500 focus:border-red-500`;
    }
    return baseClass;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitError('You must be logged in to create an organization');
      return;
    }

    if (!isFormValid) {
      setSubmitError('Please fix the validation errors before submitting');
      return;
    }

    await submitOrganization(formData, setSubmitting, setSubmitError, onSuccess);
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center">
            Please sign in to create your organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <CardTitle className="text-2xl">Create Your Organization</CardTitle>
        <p className="text-gray-600">
          Set up your church or organization with a custom subdomain
        </p>
        {!shouldRequireEmailVerification() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Development mode: Email verification is disabled for testing
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormFields
            formData={formData}
            subdomainStatus={subdomainStatus}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
            getFieldError={getFieldError}
            getInputClassName={getInputClassName}
          />

          {submitError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up organization...
              </>
            ) : (
              'Next'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationCreationForm;
