
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.7";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FixContactFormsRequest {
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId }: FixContactFormsRequest = await req.json();
    
    console.log('Fixing contact forms for organization:', organizationId);

    // Check existing forms
    const { data: existingForms, error: formsError } = await supabase
      .from('contact_forms')
      .select('id, name')
      .eq('organization_id', organizationId);

    if (formsError) {
      console.error('Error fetching existing forms:', formsError);
      throw new Error('Failed to fetch existing forms');
    }

    console.log('Found existing forms:', existingForms?.length || 0);

    let formId: string;

    if (!existingForms || existingForms.length === 0) {
      // Create default contact form
      console.log('Creating new default contact form');
      const { data: newForm, error: createFormError } = await supabase
        .from('contact_forms')
        .insert({
          organization_id: organizationId,
          name: 'Contact Us',
          slug: 'contact',
          description: 'General contact form for inquiries',
          is_active: true,
          email_notifications: true,
          auto_responder: true,
          success_message: 'Thank you for your message! We will get back to you as soon as possible.'
        })
        .select()
        .single();

      if (createFormError) {
        console.error('Error creating form:', createFormError);
        throw new Error('Failed to create contact form');
      }

      formId = newForm.id;
      console.log('Created new form with ID:', formId);
    } else {
      formId = existingForms[0].id;
      console.log('Using existing form with ID:', formId);
    }

    // Check if form has fields
    const { data: existingFields, error: fieldsError } = await supabase
      .from('contact_form_fields')
      .select('id')
      .eq('form_id', formId);

    if (fieldsError) {
      console.error('Error fetching existing fields:', fieldsError);
      throw new Error('Failed to fetch existing fields');
    }

    console.log('Found existing fields:', existingFields?.length || 0);

    if (!existingFields || existingFields.length === 0) {
      // Create default form fields
      console.log('Creating default form fields');
      const defaultFields = [
        {
          form_id: formId,
          field_type: 'text',
          label: 'Full Name',
          field_name: 'name',
          placeholder: 'Enter your full name',
          is_required: true,
          field_order: 0
        },
        {
          form_id: formId,
          field_type: 'email',
          label: 'Email Address',
          field_name: 'email',
          placeholder: 'Enter your email address',
          is_required: true,
          field_order: 1
        },
        {
          form_id: formId,
          field_type: 'text',
          label: 'Phone Number',
          field_name: 'phone',
          placeholder: 'Enter your phone number (optional)',
          is_required: false,
          field_order: 2
        },
        {
          form_id: formId,
          field_type: 'textarea',
          label: 'Message',
          field_name: 'message',
          placeholder: 'Enter your message or inquiry',
          is_required: true,
          field_order: 3
        }
      ];

      const { data: createdFields, error: createFieldsError } = await supabase
        .from('contact_form_fields')
        .insert(defaultFields)
        .select();

      if (createFieldsError) {
        console.error('Error creating fields:', createFieldsError);
        throw new Error('Failed to create contact form fields');
      }

      console.log('Created fields:', createdFields?.length || 0);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact forms fixed successfully',
      formId: formId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error fixing contact forms:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
