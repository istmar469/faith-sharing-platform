
import React, { useState, useEffect } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContactForms } from '@/hooks/useContactForms';
import { useContactFormFields } from '@/hooks/useContactForms';
import { useTenantContext } from '@/components/context/TenantContext';
import { submitContactForm, ContactFormField } from '@/services/contactFormService';
import { useToast } from '@/components/ui/use-toast';

export interface ContactFormProps {
  formId?: string;
  backgroundColor?: string;
  textColor?: string;
  showLabels?: boolean;
  compactMode?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  formId,
  backgroundColor = 'white',
  textColor = 'gray-900',
  showLabels = true,
  compactMode = false
}) => {
  const { organizationId } = useTenantContext();
  const { forms } = useContactForms(organizationId);
  const { fields } = useContactFormFields(formId);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedForm = forms.find(form => form.id === formId);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formId || !organizationId || !selectedForm) {
      toast({
        title: 'Error',
        description: 'Form configuration error',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContactForm(formId, organizationId, formData, {
        ip: undefined, // Will be handled by the edge function
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });

      setShowSuccess(true);
      setFormData({});
      
      toast({
        title: 'Success',
        description: selectedForm.success_message || 'Thank you for your message!',
      });

      // Handle redirect if configured
      if (selectedForm.redirect_url) {
        setTimeout(() => {
          window.location.href = selectedForm.redirect_url!;
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ContactFormField) => {
    const baseProps = {
      id: field.field_name,
      name: field.field_name,
      placeholder: field.placeholder || '',
      required: field.is_required,
      value: formData[field.field_name] || '',
      className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    };

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            {...baseProps}
            type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={compactMode ? 3 : 4}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
          />
        );
      
      case 'select':
        return (
          <select
            {...baseProps}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
          >
            <option value="">Select an option...</option>
            {field.field_options?.map((option: any, index: number) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.field_name}
              name={field.field_name}
              checked={formData[field.field_name] || false}
              onChange={(e) => handleInputChange(field.field_name, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.field_name} className="ml-2 text-sm">
              {field.label}
            </label>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.field_options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.field_name}_${index}`}
                  name={field.field_name}
                  value={option.value || option}
                  checked={formData[field.field_name] === (option.value || option)}
                  onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`${field.field_name}_${index}`} className="ml-2 text-sm">
                  {option.label || option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            {...baseProps}
            type="date"
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
          />
        );
      
      case 'number':
        return (
          <input
            {...baseProps}
            type="number"
            onChange={(e) => handleInputChange(field.field_name, parseFloat(e.target.value))}
          />
        );
      
      case 'file':
        return (
          <input
            type="file"
            id={field.field_name}
            name={field.field_name}
            required={field.is_required}
            onChange={(e) => handleInputChange(field.field_name, e.target.files?.[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      default:
        return null;
    }
  };

  if (!formId) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-300`}>
        <p className="text-center text-gray-500">
          Select a contact form to display here
        </p>
      </div>
    );
  }

  if (!selectedForm) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
        <p className="text-center text-red-500">
          Selected form not found
        </p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-green-600">Thank You!</h3>
          <p className="text-gray-600">
            {selectedForm.success_message || 'Your message has been sent successfully.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-${backgroundColor} text-${textColor} p-6 rounded-lg shadow-sm`}>
      <h3 className="text-xl font-semibold mb-4">{selectedForm.name}</h3>
      {selectedForm.description && (
        <p className="text-gray-600 mb-4">{selectedForm.description}</p>
      )}
      
      <form onSubmit={handleSubmit} className={`space-y-${compactMode ? '3' : '4'}`}>
        {fields.map((field) => (
          <div key={field.id}>
            {showLabels && field.field_type !== 'checkbox' && (
              <label htmlFor={field.field_name} className="block text-sm font-medium mb-1">
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {field.help_text && (
              <p className="text-xs text-gray-500 mb-1">{field.help_text}</p>
            )}
            {renderField(field)}
          </div>
        ))}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
};

export const contactFormConfig: ComponentConfig<ContactFormProps> = {
  fields: {
    formId: {
      type: 'custom',
      label: 'Contact Form',
      render: ({ name, onChange, value }) => {
        const { organizationId } = useTenantContext();
        const { forms, loading } = useContactForms(organizationId);
        
        return (
          <div className="space-y-2">
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading forms..." : "Select a form"} />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id!}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {forms.length === 0 && !loading && (
              <p className="text-xs text-gray-500">
                No forms found. Create a form in the dashboard first.
              </p>
            )}
          </div>
        );
      }
    },
    backgroundColor: {
      type: 'select',
      label: 'Background Color',
      options: [
        { label: 'White', value: 'white' },
        { label: 'Light Gray', value: 'gray-50' },
        { label: 'Light Blue', value: 'blue-50' },
        { label: 'Light Green', value: 'green-50' },
      ]
    },
    textColor: {
      type: 'select',
      label: 'Text Color',
      options: [
        { label: 'Dark Gray', value: 'gray-900' },
        { label: 'Black', value: 'black' },
        { label: 'Blue', value: 'blue-900' },
        { label: 'Green', value: 'green-900' },
      ]
    },
    showLabels: {
      type: 'radio',
      label: 'Show Field Labels',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    },
    compactMode: {
      type: 'radio',
      label: 'Compact Mode',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ]
    }
  },
  render: (props) => <ContactForm {...props} />
};

export default ContactForm;
