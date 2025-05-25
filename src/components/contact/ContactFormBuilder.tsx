
import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTenantContext } from '@/components/context/TenantContext';
import { ContactForm, ContactFormField, createContactForm, updateContactForm } from '@/services/contactFormService';
import { useContactFormFields } from '@/hooks/useContactForms';

interface ContactFormBuilderProps {
  form?: ContactForm;
  onSave: () => void;
  onCancel: () => void;
}

const ContactFormBuilder: React.FC<ContactFormBuilderProps> = ({ form, onSave, onCancel }) => {
  const { organizationId } = useTenantContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ContactForm>>({
    name: '',
    description: '',
    slug: '',
    is_active: true,
    allow_file_uploads: false,
    max_file_size: 5242880, // 5MB
    success_message: 'Thank you for your message. We will get back to you soon.',
    redirect_url: '',
    email_notifications: true,
    auto_responder: true,
    require_approval: false,
    spam_protection: true,
  });

  // Fields state
  const [fields, setFields] = useState<Partial<ContactFormField>[]>([
    {
      field_type: 'text',
      label: 'Name',
      field_name: 'name',
      placeholder: 'Your full name',
      is_required: true,
      field_order: 0,
    },
    {
      field_type: 'email',
      label: 'Email',
      field_name: 'email',
      placeholder: 'your.email@example.com',
      is_required: true,
      field_order: 1,
    },
    {
      field_type: 'textarea',
      label: 'Message',
      field_name: 'message',
      placeholder: 'Your message...',
      is_required: true,
      field_order: 2,
    },
  ]);

  // Load existing form data
  useEffect(() => {
    if (form) {
      setFormData(form);
      // Load fields would be handled by a separate hook/service call
    }
  }, [form]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFormChange = (field: keyof ContactForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && !form ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleFieldChange = (index: number, field: keyof ContactFormField, value: any) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const addField = () => {
    const newField: Partial<ContactFormField> = {
      field_type: 'text',
      label: 'New Field',
      field_name: `field_${fields.length}`,
      placeholder: '',
      is_required: false,
      field_order: fields.length,
    };
    setFields(prev => [...prev, newField]);
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, field_order: i })));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update field_order
    newFields.forEach((field, i) => {
      field.field_order = i;
    });
    
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!organizationId) return;

    if (!formData.name || !formData.slug) {
      toast({
        title: 'Error',
        description: 'Form name and slug are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formPayload: ContactForm = {
        ...formData,
        organization_id: organizationId,
      } as ContactForm;

      if (form?.id) {
        await updateContactForm(form.id, formPayload);
      } else {
        await createContactForm(formPayload);
      }

      // TODO: Save fields as well
      
      toast({
        title: 'Success',
        description: `Contact form ${form ? 'updated' : 'created'} successfully`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'file', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {form ? 'Edit Contact Form' : 'Create Contact Form'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Form Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Contact Us"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => handleFormChange('slug', e.target.value)}
                placeholder="contact-us"
              />
              <p className="text-sm text-gray-500 mt-1">
                Form will be accessible at: /forms/{formData.slug}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="A brief description of this form"
              />
            </div>

            <div>
              <Label htmlFor="success_message">Success Message</Label>
              <Textarea
                id="success_message"
                value={formData.success_message || ''}
                onChange={(e) => handleFormChange('success_message', e.target.value)}
                placeholder="Thank you for your message..."
              />
            </div>

            <div>
              <Label htmlFor="redirect_url">Redirect URL (optional)</Label>
              <Input
                id="redirect_url"
                value={formData.redirect_url || ''}
                onChange={(e) => handleFormChange('redirect_url', e.target.value)}
                placeholder="https://example.com/thank-you"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Form Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => handleFormChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <Switch
                  id="email_notifications"
                  checked={formData.email_notifications || false}
                  onCheckedChange={(checked) => handleFormChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto_responder">Auto-responder</Label>
                <Switch
                  id="auto_responder"
                  checked={formData.auto_responder || false}
                  onCheckedChange={(checked) => handleFormChange('auto_responder', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allow_file_uploads">Allow File Uploads</Label>
                <Switch
                  id="allow_file_uploads"
                  checked={formData.allow_file_uploads || false}
                  onCheckedChange={(checked) => handleFormChange('allow_file_uploads', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="spam_protection">Spam Protection</Label>
                <Switch
                  id="spam_protection"
                  checked={formData.spam_protection || false}
                  onCheckedChange={(checked) => handleFormChange('spam_protection', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Form Fields</CardTitle>
              <Button size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Field {index + 1}</span>
                    </div>
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveField(index, 'up')}
                        >
                          ↑
                        </Button>
                      )}
                      {index < fields.length - 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveField(index, 'down')}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Field Type</Label>
                      <Select
                        value={field.field_type}
                        onValueChange={(value) => handleFieldChange(index, 'field_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.field_name || ''}
                        onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                        placeholder="field_name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Label</Label>
                    <Input
                      value={field.label || ''}
                      onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                      placeholder="Field Label"
                    />
                  </div>

                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                      placeholder="Enter placeholder text..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.is_required || false}
                      onCheckedChange={(checked) => handleFieldChange(index, 'is_required', checked)}
                    />
                    <Label>Required field</Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactFormBuilder;
