
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.7";
import { Resend } from "npm:resend@4.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessContactFormRequest {
  formId: string;
  organizationId: string;
  formData: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId, organizationId, formData }: ProcessContactFormRequest = await req.json();
    
    console.log('Processing contact form submission:', {
      formId,
      organizationId,
      subdomain: formData._subdomain,
      source: formData._source
    });

    // Create submission record first
    const { data: submission, error: submissionError } = await supabase
      .from('contact_form_submissions')
      .insert({
        form_id: formId,
        organization_id: organizationId,
        form_data: formData,
        submitted_from_ip: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        referrer: formData._source || 'unknown',
        status: 'pending',
        email_sent: false,
        auto_response_sent: false
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error creating submission:', submissionError);
      throw new Error('Failed to save submission');
    }

    // Get form configuration
    const { data: form, error: formError } = await supabase
      .from('contact_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      console.error('Error fetching form:', formError);
      throw new Error('Form not found');
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name, subdomain')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      console.error('Error fetching organization:', orgError);
      throw new Error('Organization not found');
    }

    // Get email configuration
    const { data: emailConfig, error: emailConfigError } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (emailConfigError || !emailConfig) {
      console.log('No email configuration found for organization:', organizationId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Submission saved, but no email configuration found',
        submissionId: submission.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send notification email to admin
    if (form.email_notifications && emailConfig.notification_emails?.length > 0) {
      const notificationSubject = `New Contact Form Submission from ${organization.name}`;
      const notificationHtml = generateNotificationEmail(form, formData, organization, formData._subdomain);

      // Include the developer in notifications during testing
      const notificationEmails = [
        ...emailConfig.notification_emails,
        // Add your email here for testing - replace with actual email
        // 'developer@example.com'
      ];

      const { error: notificationError } = await resend.emails.send({
        from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
        to: notificationEmails,
        subject: notificationSubject,
        html: notificationHtml,
        reply_to: formData.email || emailConfig.reply_to_email || emailConfig.from_email,
      });

      if (notificationError) {
        console.error('Error sending notification email:', notificationError);
      } else {
        console.log('Notification email sent successfully');
      }
    }

    // Send auto-response email to submitter
    if (form.auto_responder && formData.email) {
      const autoResponseSubject = `Thank you for contacting ${organization.name}`;
      const autoResponseHtml = generateAutoResponseEmail(form, formData, organization);

      const { error: autoResponseError } = await resend.emails.send({
        from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
        to: [formData.email],
        subject: autoResponseSubject,
        html: autoResponseHtml,
        reply_to: emailConfig.reply_to_email || emailConfig.from_email,
      });

      if (autoResponseError) {
        console.error('Error sending auto-response email:', autoResponseError);
      } else {
        console.log('Auto-response email sent successfully');
        
        // Update submission to mark auto-response as sent
        await supabase
          .from('contact_form_submissions')
          .update({ auto_response_sent: true })
          .eq('id', submission.id);
      }
    }

    // Update submission to mark email as sent
    await supabase
      .from('contact_form_submissions')
      .update({ email_sent: true })
      .eq('id', submission.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact form processed and emails sent successfully',
      submissionId: submission.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function generateNotificationEmail(form: any, formData: any, organization: any, subdomain?: string): string {
  // Filter out internal fields
  const displayData = Object.entries(formData)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; text-transform: capitalize;">${key.replace(/_/g, ' ')}</td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`)
    .join('');

  const sourceInfo = subdomain ? `<p><strong>Source:</strong> ${subdomain} (${formData._source || 'Direct'})</p>` : '';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>Organization:</strong> ${organization.name}</p>
          <p><strong>Form:</strong> ${form.name}</p>
          ${sourceInfo}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Submission Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${displayData}
          </table>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This email was automatically generated from your contact form submission system.
            ${formData.email ? `Reply directly to this email to respond to ${formData.name || 'the submitter'}.` : ''}
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateAutoResponseEmail(form: any, formData: any, organization: any): string {
  const successMessage = form.success_message || `Thank you for contacting ${organization.name}. We will get back to you soon.`;
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Thank you for contacting ${organization.name}!</h2>
          <p>Hello${formData.name ? ` ${formData.name}` : ''},</p>
          <p>${successMessage}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your submission summary:</h3>
            <p><strong>Organization:</strong> ${organization.name}</p>
            <p><strong>Form:</strong> ${form.name}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated response from ${organization.name}. Please do not reply to this email directly.
          </p>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
