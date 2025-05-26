
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  organizationName: string;
  subdomain: string;
  pastorName: string;
  contactEmail: string;
  phoneNumber: string;
  subscriptionTier: string;
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

  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
  }>({
    checking: false,
    available: null,
    error: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-generate subdomain from organization name
  useEffect(() => {
    if (formData.organizationName && !formData.subdomain) {
      const generatedSubdomain = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      
      if (generatedSubdomain) {
        setFormData(prev => ({ ...prev, subdomain: generatedSubdomain }));
      }
    }
  }, [formData.organizationName, formData.subdomain]);

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
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
  }, [formData.subdomain]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.organizationName.trim()) return false;
    if (!formData.subdomain.trim() || formData.subdomain.length < 3) return false;
    if (!formData.contactEmail.trim()) return false;
    if (!subdomainStatus.available) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitError('You must be logged in to create an organization');
      return;
    }

    if (!validateForm()) {
      setSubmitError('Please fill in all required fields and ensure subdomain is available');
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
                placeholder="e.g., Grace Community Church"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain *</Label>
              <div className="relative">
                <Input
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  placeholder="e.g., gracechurch"
                  required
                  minLength={3}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getSubdomainStatusIcon()}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your site will be available at: <strong>{formData.subdomain}.lovable.app</strong>
              </p>
              {getSubdomainStatusMessage() && (
                <p className={`text-sm ${
                  subdomainStatus.available === true ? 'text-green-600' : 
                  subdomainStatus.available === false ? 'text-red-600' : 'text-gray-600'
                }`}>
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
                placeholder="e.g., Pastor John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="admin@church.com"
                required
              />
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
                placeholder="(555) 123-4567"
              />
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
              <X className="h-4 w-4 text-red-500" />
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
