import React, { useState, useEffect } from 'react';
import { ComponentConfig } from '@measured/puck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { useToast } from '@/components/ui/use-toast';
import ContactFormSelector from '@/components/contact/ContactFormSelector';

export type ContactFormProps = {
  formId?: string;
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
};

interface ContactFormData {
  id: string;
  name: string;
  slug: string;
  success_message: string;
}

interface ContactFormField {
  id: string;
  field_type: string;
  label: string;
  field_name: string;
  placeholder: string;
  is_required: boolean;
  field_order: number;
  field_options?: any;
}

const ContactFormComponent = ({ formId, title = "Contact Us", subtitle, showTitle = true }: ContactFormProps) => {
  const { organizationId, subdomain } = useTenantContext();
  const { toast } = useToast();
  const [form, setForm] = useState<ContactFormData | null>(null);
  const [fields, setFields] = useState<ContactFormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadForm();
    }
  }, [organizationId, formId]);

  const fixContactForms = async () => {
    try {
      setIsFixing(true);
      console.log('ContactForm: Attempting to fix contact forms');

      const { data, error } = await supabase.functions.invoke('fix-contact-forms', {
        body: { organizationId }
      });

      if (error) {
        console.error('ContactForm: Error fixing forms:', error);
        throw error;
      }

      console.log('ContactForm: Forms fixed successfully:', data);
      
      // Reload the form after fixing
      await loadForm();
      
      toast({
        title: 'Contact Form Fixed',
        description: 'Your contact form has been set up with default fields.',
      });
    } catch (error) {
      console.error('ContactForm: Failed to fix forms:', error);
      setError('Failed to fix contact form. Please try again.');
    } finally {
      setIsFixing(false);
    }
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      setError(null);
      let selectedFormId = formId;

      console.log('ContactForm: Loading form', { formId, organizationId });

      // If no specific form ID, get the first active form
      if (!selectedFormId) {
        const { data: forms, error: formsError } = await supabase
          .from('contact_forms')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1);

        if (formsError) {
          console.error('Error loading forms:', formsError);
          setError('Failed to load contact forms');
          setLoading(false);
          return;
        }

        if (forms && forms.length > 0) {
          selectedFormId = forms[0].id;
        }
      }

      if (!selectedFormId) {
        console.log('ContactForm: No form found');
        setError('No contact form found. Click "Fix Contact Form" to create one.');
        setLoading(false);
        return;
      }

      // Load form details
      const { data: formData, error: formError } = await supabase
        .from('contact_forms')
        .select('id, name, slug, success_message')
        .eq('id', selectedFormId)
        .single();

      if (formError) {
        console.error('Error loading form:', formError);
        setError('Failed to load contact form');
        setLoading(false);
        return;
      }

      // Load form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('contact_form_fields')
        .select('*')
        .eq('form_id', selectedFormId)
        .order('field_order');

      if (fieldsError) {
        console.error('Error loading form fields:', fieldsError);
        setError('Failed to load form fields');
        setLoading(false);
        return;
      }

      console.log('ContactForm: Loaded form and fields', {
        form: formData,
        fieldsCount: fieldsData?.length || 0
      });

      if (!fieldsData || fieldsData.length === 0) {
        console.log('ContactForm: Form has no fields');
        setError('Contact form has no fields configured. Click "Fix Contact Form" to add default fields.');
        setForm(formData);
        setFields([]);
        setLoading(false);
        return;
      }

      setForm(formData);
      setFields(fieldsData || []);
      
      // Initialize form data
      const initialData: Record<string, string> = {};
      fieldsData?.forEach(field => {
        initialData[field.field_name] = '';
      });
      setFormData(initialData);
      
    } catch (error) {
      console.error('Error loading contact form:', error);
      setError('An unexpected error occurred while loading the contact form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form || !organizationId) return;

    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = fields.filter(field => field.is_required);
      for (const field of requiredFields) {
        if (!formData[field.field_name] || formData[field.field_name].trim() === '') {
          toast({
            title: 'Required Field Missing',
            description: `Please fill in the ${field.label} field.`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }

      console.log('ContactForm: Submitting form', {
        formId: form.id,
        organizationId,
        subdomain,
        formData
      });

      // Add subdomain context to form data
      const submissionData = {
        ...formData,
        _subdomain: subdomain || window.location.hostname,
        _source: window.location.href
      };

      // Submit form via edge function
      const { data, error } = await supabase.functions.invoke('process-contact-form', {
        body: {
          formId: form.id,
          organizationId: organizationId,
          formData: submissionData
        }
      });

      if (error) {
        console.error('Error submitting form:', error);
        throw error;
      }

      console.log('ContactForm: Form submitted successfully', data);

      setIsSubmitted(true);
      toast({
        title: 'Message Sent',
        description: 'Thank you for your message! We will get back to you soon.',
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'There was an error sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: ContactFormField) => {
    const commonProps = {
      id: field.field_name,
      name: field.field_name,
      placeholder: field.placeholder,
      value: formData[field.field_name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(field.field_name, e.target.value),
      required: field.is_required,
      className: "w-full"
    };

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea 
            {...commonProps}
            rows={4}
          />
        );
      case 'email':
        return (
          <Input 
            {...commonProps}
            type="email"
          />
        );
      case 'phone':
        return (
          <Input 
            {...commonProps}
            type="tel"
          />
        );
      case 'number':
        return (
          <Input 
            {...commonProps}
            type="number"
          />
        );
      default:
        return (
          <Input 
            {...commonProps}
            type="text"
          />
        );
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <Alert className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {organizationId && (
            <Button 
              onClick={fixContactForms} 
              disabled={isFixing}
              className="w-full"
            >
              {isFixing ? 'Fixing Contact Form...' : 'Fix Contact Form'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Thank You!</h3>
          <p className="text-gray-600">{form?.success_message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle>{title}</CardTitle>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.field_name}>
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
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
      </CardContent>
    </Card>
  );
};

export const ContactForm: ComponentConfig<ContactFormProps> = {
  fields: {
    formId: {
      type: 'custom',
      label: 'Contact Form',
      render: ({ name, onChange, value }) => (
        <ContactFormSelector
          value={value}
          onChange={onChange}
        />
      ),
    },
    title: {
      type: 'text',
      label: 'Title',
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle',
    },
    showTitle: {
      type: 'radio',
      label: 'Show Title',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  },
  defaultProps: {
    title: 'Contact Us',
    showTitle: true,
  },
  render: ({ formId, title, subtitle, showTitle }) => (
    <ContactFormComponent 
      formId={formId}
      title={title}
      subtitle={subtitle}
      showTitle={showTitle}
    />
  ),
};
