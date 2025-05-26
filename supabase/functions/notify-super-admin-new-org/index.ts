
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  organizationId: string;
  organizationName: string;
  subdomain: string;
  pastorName?: string;
  contactEmail: string;
  phoneNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { 
      organizationId, 
      organizationName, 
      subdomain, 
      pastorName, 
      contactEmail, 
      phoneNumber 
    }: NotificationRequest = await req.json();

    console.log("Notifying super admins of new organization:", organizationName);

    // Get all super admin user IDs
    const { data: superAdminData, error: superAdminError } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('role', 'super_admin');

    if (superAdminError) {
      console.error("Error fetching super admins:", superAdminError);
      throw superAdminError;
    }

    if (!superAdminData || superAdminData.length === 0) {
      console.log("No super admins found to notify");
      return new Response(
        JSON.stringify({ message: "No super admins found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get email addresses for super admins from auth.users
    const superAdminIds = superAdminData.map(admin => admin.user_id);
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }

    // Filter users to get super admin emails
    const superAdminEmails = userData.users
      .filter(user => superAdminIds.includes(user.id))
      .map(user => user.email)
      .filter(email => email);

    if (superAdminEmails.length === 0) {
      console.log("No super admin emails found");
      return new Response(
        JSON.stringify({ message: "No super admin emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create email content
    const currentDomain = Deno.env.get("CUSTOM_DOMAIN") || "church-os.com";
    const subdomainUrl = `https://${subdomain}.${currentDomain}`;
    const dashboardUrl = `https://${currentDomain}/dashboard/${organizationId}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Organization Created</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Organization Details</h3>
          <p><strong>Name:</strong> ${organizationName}</p>
          <p><strong>Subdomain:</strong> ${subdomain}</p>
          <p><strong>Website:</strong> <a href="${subdomainUrl}" target="_blank">${subdomainUrl}</a></p>
          ${pastorName ? `<p><strong>Pastor:</strong> ${pastorName}</p>` : ''}
          <p><strong>Contact Email:</strong> ${contactEmail}</p>
          ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ''}
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Organization Dashboard
          </a>
        </div>

        <div style="margin: 30px 0;">
          <h4>Quick Actions:</h4>
          <ul>
            <li><a href="${subdomainUrl}" target="_blank">Visit Organization Website</a></li>
            <li><a href="${dashboardUrl}" target="_blank">Manage Organization</a></li>
            <li><a href="https://${currentDomain}/dashboard" target="_blank">View All Organizations</a></li>
          </ul>
        </div>

        <div style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>This notification was sent because you are a super administrator of the ChurchSite Builder platform.</p>
        </div>
      </div>
    `;

    // Send email to all super admins
    const emailPromises = superAdminEmails.map(email => 
      resend.emails.send({
        from: "ChurchSite Builder <notifications@church-os.com>",
        to: [email],
        subject: `New Organization Created: ${organizationName}`,
        html: emailHtml,
      })
    );

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Log results
    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Email sent successfully to ${superAdminEmails[index]}`);
      } else {
        console.error(`Failed to send email to ${superAdminEmails[index]}:`, result.reason);
      }
    });

    const successCount = emailResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = emailResults.length - successCount;

    return new Response(
      JSON.stringify({ 
        message: `Notifications sent`,
        success: successCount,
        failures: failureCount,
        recipients: superAdminEmails.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in notify-super-admin-new-org function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
