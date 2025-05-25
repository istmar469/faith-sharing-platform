
import { supabase } from '@/integrations/supabase/client';

export interface ContactForm {
  id?: string;
  organization_id: string;
  name: string;
  description?: string;
  slug: string;
  is_active: boolean;
  allow_file_uploads: boolean;
  max_file_size?: number;
  success_message?: string;
  redirect_url?: string;
  email_notifications: boolean;
  auto_responder: boolean;
  require_approval: boolean;
  spam_protection: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFormField {
  id?: string;
  form_id: string;
  field_type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number';
  label: string;
  field_name: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  field_order: number;
  validation_rules?: any;
  field_options?: any[];
  conditional_logic?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFormSubmission {
  id?: string;
  form_id: string;
  organization_id: string;
  form_data: any;
  submitted_from_ip?: string;
  user_agent?: string;
  referrer?: string;
  status: 'pending' | 'reviewed' | 'replied' | 'archived' | 'spam';
  admin_notes?: string;
  email_sent: boolean;
  auto_response_sent: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailTemplate {
  id?: string;
  organization_id: string;
  template_type: 'auto_response' | 'notification' | 'confirmation';
  form_id?: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailConfiguration {
  id?: string;
  organization_id: string;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  notification_emails?: string[];
  smtp_enabled: boolean;
  smtp_settings?: any;
  created_at?: string;
  updated_at?: string;
}

// Contact Form CRUD operations
export async function createContactForm(form: ContactForm): Promise<ContactForm> {
  console.log('ContactFormService: Creating contact form:', form.name);
  
  const { data, error } = await supabase
    .from('contact_forms')
    .insert(form)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error creating contact form:', error);
    throw error;
  }

  console.log('ContactFormService: Contact form created successfully:', data.id);
  return data;
}

export async function getContactForm(id: string): Promise<ContactForm | null> {
  console.log('ContactFormService: Fetching contact form:', id);
  
  const { data, error } = await supabase
    .from('contact_forms')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('ContactFormService: Error fetching contact form:', error);
    throw error;
  }

  return data;
}

export async function getContactFormBySlug(organizationId: string, slug: string): Promise<ContactForm | null> {
  console.log('ContactFormService: Fetching contact form by slug:', slug);
  
  const { data, error } = await supabase
    .from('contact_forms')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('ContactFormService: Error fetching contact form by slug:', error);
    throw error;
  }

  return data;
}

export async function getOrganizationContactForms(organizationId: string): Promise<ContactForm[]> {
  console.log('ContactFormService: Fetching contact forms for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('contact_forms')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ContactFormService: Error fetching organization contact forms:', error);
    throw error;
  }

  console.log(`ContactFormService: Successfully fetched ${data.length} contact forms`);
  return data || [];
}

export async function updateContactForm(id: string, updates: Partial<ContactForm>): Promise<ContactForm> {
  console.log('ContactFormService: Updating contact form:', id);
  
  const { data, error } = await supabase
    .from('contact_forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error updating contact form:', error);
    throw error;
  }

  console.log('ContactFormService: Contact form updated successfully');
  return data;
}

export async function deleteContactForm(id: string): Promise<boolean> {
  console.log('ContactFormService: Deleting contact form:', id);
  
  const { error } = await supabase
    .from('contact_forms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('ContactFormService: Error deleting contact form:', error);
    throw error;
  }

  console.log('ContactFormService: Contact form deleted successfully');
  return true;
}

// Contact Form Fields CRUD operations
export async function createContactFormField(field: ContactFormField): Promise<ContactFormField> {
  console.log('ContactFormService: Creating contact form field:', field.label);
  
  const { data, error } = await supabase
    .from('contact_form_fields')
    .insert(field)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error creating contact form field:', error);
    throw error;
  }

  console.log('ContactFormService: Contact form field created successfully');
  return {
    ...data,
    field_type: data.field_type as ContactFormField['field_type'],
    field_options: (data.field_options as any) || [],
    validation_rules: (data.validation_rules as any) || {},
    conditional_logic: (data.conditional_logic as any) || {}
  };
}

export async function getContactFormFields(formId: string): Promise<ContactFormField[]> {
  console.log('ContactFormService: Fetching contact form fields for form:', formId);
  
  const { data, error } = await supabase
    .from('contact_form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('field_order', { ascending: true });

  if (error) {
    console.error('ContactFormService: Error fetching contact form fields:', error);
    throw error;
  }

  return (data || []).map(field => ({
    ...field,
    field_type: field.field_type as ContactFormField['field_type'],
    field_options: (field.field_options as any) || [],
    validation_rules: (field.validation_rules as any) || {},
    conditional_logic: (field.conditional_logic as any) || {}
  }));
}

export async function updateContactFormField(id: string, updates: Partial<ContactFormField>): Promise<ContactFormField> {
  console.log('ContactFormService: Updating contact form field:', id);
  
  const { data, error } = await supabase
    .from('contact_form_fields')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error updating contact form field:', error);
    throw error;
  }

  return {
    ...data,
    field_type: data.field_type as ContactFormField['field_type'],
    field_options: (data.field_options as any) || [],
    validation_rules: (data.validation_rules as any) || {},
    conditional_logic: (data.conditional_logic as any) || {}
  };
}

export async function deleteContactFormField(id: string): Promise<boolean> {
  console.log('ContactFormService: Deleting contact form field:', id);
  
  const { error } = await supabase
    .from('contact_form_fields')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('ContactFormService: Error deleting contact form field:', error);
    throw error;
  }

  return true;
}

// Contact Form Submissions CRUD operations
export async function createContactFormSubmission(submission: ContactFormSubmission): Promise<ContactFormSubmission> {
  console.log('ContactFormService: Creating contact form submission');
  
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error creating contact form submission:', error);
    throw error;
  }

  console.log('ContactFormService: Contact form submission created successfully');
  return {
    ...data,
    status: data.status as ContactFormSubmission['status']
  };
}

export async function getContactFormSubmissions(formId: string): Promise<ContactFormSubmission[]> {
  console.log('ContactFormService: Fetching contact form submissions for form:', formId);
  
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ContactFormService: Error fetching contact form submissions:', error);
    throw error;
  }

  return (data || []).map(submission => ({
    ...submission,
    status: submission.status as ContactFormSubmission['status']
  }));
}

export async function getOrganizationSubmissions(organizationId: string): Promise<ContactFormSubmission[]> {
  console.log('ContactFormService: Fetching submissions for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ContactFormService: Error fetching organization submissions:', error);
    throw error;
  }

  return (data || []).map(submission => ({
    ...submission,
    status: submission.status as ContactFormSubmission['status']
  }));
}

export async function updateContactFormSubmission(id: string, updates: Partial<ContactFormSubmission>): Promise<ContactFormSubmission> {
  console.log('ContactFormService: Updating contact form submission:', id);
  
  const { data, error } = await supabase
    .from('contact_form_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error updating contact form submission:', error);
    throw error;
  }

  return {
    ...data,
    status: data.status as ContactFormSubmission['status']
  };
}

// Email Configuration CRUD operations
export async function getEmailConfiguration(organizationId: string): Promise<EmailConfiguration | null> {
  console.log('ContactFormService: Fetching email configuration for organization:', organizationId);
  
  const { data, error } = await supabase
    .from('email_configurations')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('ContactFormService: Error fetching email configuration:', error);
    throw error;
  }

  return data;
}

export async function createOrUpdateEmailConfiguration(config: EmailConfiguration): Promise<EmailConfiguration> {
  console.log('ContactFormService: Creating/updating email configuration');
  
  const { data, error } = await supabase
    .from('email_configurations')
    .upsert(config, { onConflict: 'organization_id' })
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error creating/updating email configuration:', error);
    throw error;
  }

  return data;
}

// Email Templates CRUD operations
export async function getEmailTemplates(organizationId: string, templateType?: string): Promise<EmailTemplate[]> {
  console.log('ContactFormService: Fetching email templates for organization:', organizationId);
  
  let query = supabase
    .from('email_templates')
    .select('*')
    .eq('organization_id', organizationId);

  if (templateType) {
    query = query.eq('template_type', templateType);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('ContactFormService: Error fetching email templates:', error);
    throw error;
  }

  return (data || []).map(template => ({
    ...template,
    template_type: template.template_type as EmailTemplate['template_type'],
    variables: (template.variables as any) || []
  }));
}

export async function createEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
  console.log('ContactFormService: Creating email template:', template.name);
  
  const { data, error } = await supabase
    .from('email_templates')
    .insert(template)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error creating email template:', error);
    throw error;
  }

  return {
    ...data,
    template_type: data.template_type as EmailTemplate['template_type'],
    variables: (data.variables as any) || []
  };
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
  console.log('ContactFormService: Updating email template:', id);
  
  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('ContactFormService: Error updating email template:', error);
    throw error;
  }

  return {
    ...data,
    template_type: data.template_type as EmailTemplate['template_type'],
    variables: (data.variables as any) || []
  };
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  console.log('ContactFormService: Deleting email template:', id);
  
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('ContactFormService: Error deleting email template:', error);
    throw error;
  }

  return true;
}

// Utility function to submit form and trigger email
export async function submitContactForm(
  formId: string,
  organizationId: string,
  formData: any,
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
  }
): Promise<ContactFormSubmission> {
  console.log('ContactFormService: Submitting contact form:', formId);

  // Create the submission
  const submission = await createContactFormSubmission({
    form_id: formId,
    organization_id: organizationId,
    form_data: formData,
    submitted_from_ip: metadata?.ip,
    user_agent: metadata?.userAgent,
    referrer: metadata?.referrer,
    status: 'pending',
    email_sent: false,
    auto_response_sent: false,
  });

  // Trigger email processing via edge function
  try {
    const { error: emailError } = await supabase.functions.invoke('process-contact-form', {
      body: {
        submissionId: submission.id,
        formId,
        organizationId,
        formData,
      },
    });

    if (emailError) {
      console.error('ContactFormService: Error triggering email processing:', emailError);
      // Don't throw here, submission was successful
    }
  } catch (error) {
    console.error('ContactFormService: Error calling email processing function:', error);
    // Don't throw here, submission was successful
  }

  return submission;
}
