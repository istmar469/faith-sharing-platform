
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { getCurrentDomain } from '@/utils/environment';
import { FormData, SubdomainStatus } from '../hooks/useOrganizationForm';

interface SubdomainInputProps {
  formData: FormData;
  subdomainStatus: SubdomainStatus;
  onInputChange: (field: keyof FormData, value: string) => void;
  onBlur: (field: keyof FormData) => void;
  getFieldError: (fieldName: keyof FormData) => string | null;
  getInputClassName: (fieldName: keyof FormData) => string;
}

export const SubdomainInput: React.FC<SubdomainInputProps> = ({
  formData,
  subdomainStatus,
  onInputChange,
  onBlur,
  getFieldError,
  getInputClassName
}) => {
  const currentDomain = getCurrentDomain();

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

  return (
    <div className="space-y-2">
      <Label htmlFor="subdomain">Subdomain *</Label>
      <div className="relative">
        <Input
          id="subdomain"
          value={formData.subdomain}
          onChange={(e) => onInputChange('subdomain', e.target.value)}
          onBlur={() => onBlur('subdomain')}
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
  );
};
