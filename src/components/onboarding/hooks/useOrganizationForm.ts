
import { useState, useEffect, useCallback, useMemo } from 'react';
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

export interface FormData {
  organizationName: string;
  subdomain: string;
  pastorName: string;
  contactEmail: string;
  phoneNumber: string;
  subscriptionTier: string;
}

export interface FieldValidation {
  [key: string]: ValidationResult & { touched: boolean };
}

export interface SubdomainStatus {
  checking: boolean;
  available: boolean | null;
  error: string | null;
}

export const useOrganizationForm = () => {
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
  const [subdomainManuallyTouched, setSubdomainManuallyTouched] = useState(false);

  // Validate individual field
  const validateField = useCallback((fieldName: keyof FormData, value: string): ValidationResult => {
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
  }, []);

  // Update field validation state
  const updateFieldValidation = useCallback((fieldName: keyof FormData, value: string, touched: boolean = true) => {
    const validation = validateField(fieldName, value);
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: { ...validation, touched }
    }));
  }, [validateField]);

  // Auto-generate subdomain from organization name
  useEffect(() => {
    if (formData.organizationName && !subdomainManuallyTouched) {
      const generatedSubdomain = sanitizeSubdomain(formData.organizationName);
      
      if (generatedSubdomain && generatedSubdomain.length >= 3) {
        setFormData(prev => ({ ...prev, subdomain: generatedSubdomain }));
        const validation = validateField('subdomain', generatedSubdomain);
        setFieldValidation(prev => ({
          ...prev,
          subdomain: { ...validation, touched: false }
        }));
      }
    }
  }, [formData.organizationName, subdomainManuallyTouched, validateField]);

  // Check subdomain availability with debounce
  useEffect(() => {
    const subdomain = formData.subdomain;
    const subdomainValidation = fieldValidation.subdomain;
    
    if (!subdomain || subdomain.length < 3 || !subdomainValidation?.isValid) {
      setSubdomainStatus({ checking: false, available: null, error: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSubdomainStatus({ checking: true, available: null, error: null });
      
      try {
        const { data, error } = await supabase.rpc('check_subdomain_availability', {
          subdomain_name: subdomain
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

  // Memoize form validation to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    const requiredFields: (keyof FormData)[] = ['organizationName', 'subdomain', 'contactEmail'];
    
    for (const field of requiredFields) {
      const validation = fieldValidation[field];
      if (!validation || !validation.isValid) {
        return false;
      }
    }

    const optionalFields: (keyof FormData)[] = ['pastorName', 'phoneNumber'];
    for (const field of optionalFields) {
      const value = formData[field];
      if (value && value.trim()) {
        const validation = fieldValidation[field];
        if (!validation || !validation.isValid) {
          return false;
        }
      }
    }

    if (!subdomainStatus.available) {
      return false;
    }

    return true;
  }, [fieldValidation, formData, subdomainStatus.available]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    if (field === 'subdomain') {
      processedValue = sanitizeSubdomain(value);
      setSubdomainManuallyTouched(true);
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

  return {
    formData,
    fieldValidation,
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
  };
};
