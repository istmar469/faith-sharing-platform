
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { FormData } from '../hooks/useOrganizationForm';
import { SubdomainInput } from './SubdomainInput';

interface FormFieldsProps {
  formData: FormData;
  subdomainStatus: any;
  onInputChange: (field: keyof FormData, value: string) => void;
  onBlur: (field: keyof FormData) => void;
  getFieldError: (fieldName: keyof FormData) => string | null;
  getInputClassName: (fieldName: keyof FormData) => string;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  subdomainStatus,
  onInputChange,
  onBlur,
  getFieldError,
  getInputClassName
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => onInputChange('organizationName', e.target.value)}
            onBlur={() => onBlur('organizationName')}
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

        <SubdomainInput
          formData={formData}
          subdomainStatus={subdomainStatus}
          onInputChange={onInputChange}
          onBlur={onBlur}
          getFieldError={getFieldError}
          getInputClassName={getInputClassName}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pastorName">Pastor/Leader Name</Label>
          <Input
            id="pastorName"
            value={formData.pastorName}
            onChange={(e) => onInputChange('pastorName', e.target.value)}
            onBlur={() => onBlur('pastorName')}
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
            onChange={(e) => onInputChange('contactEmail', e.target.value)}
            onBlur={() => onBlur('contactEmail')}
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
            onChange={(e) => onInputChange('phoneNumber', e.target.value)}
            onBlur={() => onBlur('phoneNumber')}
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
          <Select value={formData.subscriptionTier} onValueChange={(value) => onInputChange('subscriptionTier', value)}>
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
    </>
  );
};
