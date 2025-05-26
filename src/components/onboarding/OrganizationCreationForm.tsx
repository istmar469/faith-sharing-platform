
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  validateEmail, 
  validatePhoneNumber, 
  validateOrganizationName, 
  validatePastorName, 
  validateSubdomain,
  sanitizeSubdomain,
  formatPhoneNumber,
  ValidationResult 
} from '@/utils/validation';
import { getCurrentDomain, shouldRequireEmailVerification } from '@/utils/environment';

interface FormData {
  organizationName: string;
  subdomain: string;
  pastorName: string;
  contactEmail: string;
  phoneNumber: string;
  subscriptionTier: string;
}

interface FieldValidation {
  [key: string]: ValidationResult & { touched: boolean };
}

interface SubdomainStatus {
  checking: boolean;
  available: boolean | null;
  error: string | null;
}

interface OrganizationCreationFormProps {
  onSuccess?: (organizationId: string, subdomain: string) => void;
}

const OrganizationCreationForm: React.FC<OrganizationCreationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    subdomain: '',
    pastorName: '',
    contactEmail: user?.email || '',
    phoneNumber: '',
    subscriptionTier: 'basic'
  });

  const [fieldValidation, setFieldValidation] = useState<FieldValidation>({});
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>({
    checking: false,
    available: null,
    error: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentDomain = getCurrentDomain();

  // Validate individual field
  const validateField = (fieldName: keyof FormData, value: string): ValidationResult => {
    switch (fieldName) {
      case 'organizationName':
        return validateOrganizationName(value);
      case 'subdomain':
        return validateSubdomain(value);
      case 'pastorName':
        return validatePastorName(value);
      case 'contactEmail':
        return validateEmail(value);
      case 'phoneNumber':
        return validatePhoneNumber(value);
      default:
        return { isValid: true };
    }
  };

  // Update field validation state
  const updateFieldValidation = (fieldName: keyof FormData, value: string, touched: boolean = true) => {
    const validation = validateField(fieldName, value);
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: { ...validation, touched }
    }));
  };

  // Auto-generate subdomain from organization name
  useEffect(() => {
    if (formData.organizationName && !fieldValidation.subdomain?.touched) {
      const generatedSubdomain = sanitizeSubdomain(formData.organizationName);
      
      if (generatedSubdomain && generatedSubdomain.length >= 3) {
        setFormData(prev => ({ ...prev, subdomain: generatedSubdomain }));
        updateFieldValidation('subdomain', generatedSubdomain, false);
      }
    }
  }, [formData.organizationName, fieldValidation.subdomain?.touched]);

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 3 || !fieldValidation.subdomain?.isValid) {
      setSubdomainStatus({ checking: false, available: null, error: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSubdomainStatus({ checking: true, available: null, error: null });
      
      try {
        const { data, error } = await supabase.rpc('check_subdomain_availability', {
          subdomain_name: formData.subdomain
        });

        if (error) {
          setSubdomainStatus({ 
            checking: false, 
            available: null, 
            error: `Error checking availability: ${error.message}` 
          });
          return;
        }

        setSubdomainStatus({ 
          checking: false, 
          available: data, 
          error: null 
        });
      } catch (err) {
        setSubdomainStatus({ 
          checking: false, 
          available: null, 
          error: 'Failed to check subdomain availability' 
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.subdomain, fieldValidation.subdomain?.isValid]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    // Special processing for specific fields
    if (field === 'subdomain') {
      processedValue = sanitizeSubdomain(value);
    } else if (field === 'phoneNumber') {
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    updateFieldValidation(field, processedValue);
    setSubmitError(null);
  };

  const handleBlur = (field: keyof FormData) => {
    updateFieldValidation(field, formData[field], true);
  };

  const validateForm = (): boolean => {
    // Validate all fields
    const validations: FieldValidation = {};
    let isFormValid = true;

    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormData;
      const validation = validateField(fieldName, formData[fieldName]);
      validations[fieldName] = { ...validation, touched: true };
      
      if (!validation.isValid) {
        isFormValid = false;
      }
    });

    setFieldValidation(validations);

    // Check subdomain availability
    if (!subdomainStatus.available) {
      isFormValid = false;
    }

    return isFormValid;
  };

  const getFieldError = (fieldName: keyof FormData): string | null => {
    const validation = fieldValidation[fieldName];
    if (validation?.touched && !validation.isValid) {
      return validation.error || null;
    }
    return null;
  };

  const getFieldState = (fieldName: keyof FormData): 'default' | 'valid' | 'invalid' => {
    const validation = fieldValidation[fieldName];
    if (!validation?.touched) return 'default';
    return validation.isValid ? 'valid' : 'invalid';
  };

  const notifySuperAdmins = async (organizationId: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitError('You must be logged in to create an organization');
      return;
    }

    if (!validateForm()) {
      setSubmitError('Please fix the validation errors before submitting');
      return;
    }

    // Check email verification requirement
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
      notifySuperAdmins(organizationId);
      
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

  const getSubdomainStatusIcon = () => {
    if (subdomainStatus.checking) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (subdomainStatus.available === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (subdomainStatus.available === false) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getSubdomainStatusMessage = () => {
    if (subdomainStatus.error) {
      return subdomainStatus.error;
    }
    if (subdomainStatus.checking) {
      return 'Checking availability...';
    }
    if (subdomainStatus.available === true) {
      return 'Subdomain is available!';
    }
    if (subdomainStatus.available === false) {
      return 'Subdomain is already taken';
    }
    return '';
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const state = getFieldState(fieldName);
    const baseClass = "w-full";
    
    if (state === 'valid') {
      return `${baseClass} border-green-500 focus:border-green-500`;
    } else if (state === 'invalid') {
      return `${baseClass} border-red-500 focus:border-red-500`;
    }
    return baseClass;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                onBlur={() => handleBlur('organizationName')}
                placeholder="e.g., Grace Community Church"
                className={getInputClassName('organizationName')}
                required
              />
              {getFieldError('organizationName') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('organizationName')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain *</Label>
              <div className="relative">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value)}
                  onBlur={() => handleBlur('subdomain')}
                  placeholder="e.g., gracechurch"
                  className={`${getInputClassName('subdomain')} pr-10`}
                  required
                  minLength={3}
                  maxLength={63}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getSubdomainStatusIcon()}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your site will be available at: <strong>{formData.subdomain}.{currentDomain}</strong>
              </p>
              {getFieldError('subdomain') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('subdomain')}
                </p>
              )}
              {getSubdomainStatusMessage() && !getFieldError('subdomain') && (
                <p className={`text-sm flex items-center gap-1 ${
                  subdomainStatus.available === true ? 'text-green-600' : 
                  subdomainStatus.available === false ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {subdomainStatus.available === false && <AlertCircle className="h-3 w-3" />}
                  {getSubdomainStatusMessage()}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pastorName">Pastor/Leader Name</Label>
              <Input
                id="pastorName"
                value={formData.pastorName}
                onChange={(e) => handleInputChange('pastorName', e.target.value)}
                onBlur={() => handleBlur('pastorName')}
                placeholder="e.g., Pastor John Smith"
                className={getInputClassName('pastorName')}
              />
              {getFieldError('pastorName') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('pastorName')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                onBlur={() => handleBlur('contactEmail')}
                placeholder="admin@church.com"
                className={getInputClassName('contactEmail')}
                required
              />
              {getFieldError('contactEmail') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('contactEmail')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="(555) 123-4567"
                className={getInputClassName('phoneNumber')}
              />
              {getFieldError('phoneNumber') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('phoneNumber')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Subscription Plan</Label>
              <Select value={formData.subscriptionTier} onValueChange={(value) => handleInputChange('subscriptionTier', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Free</SelectItem>
                  <SelectItem value="pro">Pro - $29/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $99/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
            disabled={!validateForm() || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Organization...
              </>
            ) : (
              'Create Organization'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationCreationForm;
