
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
  submissionId: string;
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
    const { submissionId, formId, organizationId, formData }: ProcessContactFormRequest = await req.json();
    
    console.log('Processing contact form submission:', submissionId);

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
        message: 'Submission processed, but no email configuration found' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Send notification email to admin
    if (form.email_notifications && emailConfig.notification_emails?.length > 0) {
      const notificationSubject = `New Contact Form Submission: ${form.name}`;
      const notificationHtml = generateNotificationEmail(form, formData);

      const { error: notificationError } = await resend.emails.send({
        from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
        to: emailConfig.notification_emails,
        subject: notificationSubject,
        html: notificationHtml,
        reply_to: emailConfig.reply_to_email || emailConfig.from_email,
      });

      if (notificationError) {
        console.error('Error sending notification email:', notificationError);
      } else {
        console.log('Notification email sent successfully');
      }
    }

    // Send auto-response email to submitter
    if (form.auto_responder && formData.email) {
      const autoResponseSubject = `Thank you for contacting us`;
      const autoResponseHtml = generateAutoResponseEmail(form, formData);

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
          .eq('id', submissionId);
      }
    }

    // Update submission to mark email as sent
    await supabase
      .from('contact_form_submissions')
      .update({ email_sent: true })
      .eq('id', submissionId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact form processed and emails sent successfully' 
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

function generateNotificationEmail(form: any, formData: any): string {
  const formFields = Object.entries(formData)
    .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`)
    .join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>Form:</strong> ${form.name}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Submission Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${formFields}
          </table>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This email was automatically generated from your contact form.
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateAutoResponseEmail(form: any, formData: any): string {
  const successMessage = form.success_message || 'Thank you for your message. We will get back to you soon.';
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
          <p>Hello${formData.name ? ` ${formData.name}` : ''},</p>
          <p>${successMessage}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your submission summary:</h3>
            <p><strong>Form:</strong> ${form.name}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
