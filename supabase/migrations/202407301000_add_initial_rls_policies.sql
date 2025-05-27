-- Supabase Migration: Add Initial Row Level Security Policies
-- Timestamp: 202407301000

BEGIN;

-- Section 1: Helper Functions
-- These functions are used by RLS policies to determine user permissions.
-- They use SECURITY DEFINER to execute with the permissions of the function owner,
-- allowing access to tables like organization_members that the calling user might not directly have.

CREATE OR REPLACE FUNCTION public.is_member_of_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current authenticated user is a member of the specified organization.
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_of_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current authenticated user has an admin-like role in the specified organization.
  -- Adjust roles ('admin', 'owner') as per your application's role definitions.
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role_for_organization(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role of the current authenticated user for the specified organization.
  SELECT role
  INTO user_role
  FROM public.organization_members om
  WHERE om.organization_id = org_id
    AND om.user_id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Note: public.check_super_admin() is assumed to be defined in a previous migration
-- (e.g., supabase/migrations/20250525_add_super_admin_check_function.sql).
-- If not, its definition should be included here.
-- Example:
-- CREATE OR REPLACE FUNCTION public.check_super_admin()
-- RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
-- BEGIN
--   RETURN EXISTS (
--     SELECT 1 FROM public.super_admins sa -- Assuming a super_admins table
--     WHERE sa.user_id = auth.uid() AND sa.is_active = true -- Adjust as per your super_admin setup
--   );
-- END;
-- $$;


-- Section 2: RLS Policies for Tables with Direct `organization_id`

-- Macro to generate policies for standard organization-scoped tables
DO $$
DECLARE
  table_name TEXT;
  tables_list TEXT[] := ARRAY[
    'activities', 'announcements', 'attendance_records', 'church_info', 
    'contact_form_submissions', 'contact_forms', 'donations', 'email_configurations', 
    'email_templates', 'event_categories', 'event_registrations', 'event_templates', 
    'events', 'funds', 'pages', 'payment_history', 'site_settings', 
    'staff_members', 'subscriptions', 'usage_metrics'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_list
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);

    EXECUTE format('
      CREATE POLICY "Allow SELECT for members and super_admins on %I"
      ON public.%I FOR SELECT
      USING (public.is_member_of_organization(organization_id) OR public.check_super_admin());',
      table_name, table_name
    );

    EXECUTE format('
      CREATE POLICY "Allow INSERT for members on %I"
      ON public.%I FOR INSERT
      WITH CHECK (public.is_member_of_organization(organization_id));',
      table_name, table_name
    );

    EXECUTE format('
      CREATE POLICY "Allow UPDATE for org_members/admins and super_admins on %I"
      ON public.%I FOR UPDATE
      USING (public.is_member_of_organization(organization_id) OR public.is_admin_of_organization(organization_id) OR public.check_super_admin())
      WITH CHECK (public.is_member_of_organization(organization_id) OR public.is_admin_of_organization(organization_id) OR public.check_super_admin());',
      table_name, table_name
    );

    EXECUTE format('
      CREATE POLICY "Allow DELETE for org_admins and super_admins on %I"
      ON public.%I FOR DELETE
      USING (public.is_admin_of_organization(organization_id) OR public.check_super_admin());',
      table_name, table_name
    );
  END LOOP;
END $$;

-- Section 3: RLS Policies for `organizations` Table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on organizations for members and super_admins"
ON public.organizations FOR SELECT
USING (public.is_member_of_organization(id) OR public.check_super_admin());

CREATE POLICY "Allow INSERT on organizations for super_admins"
ON public.organizations FOR INSERT
WITH CHECK (public.check_super_admin());

CREATE POLICY "Allow UPDATE on organizations for org_admins and super_admins"
ON public.organizations FOR UPDATE
USING (public.is_admin_of_organization(id) OR public.check_super_admin())
WITH CHECK (public.is_admin_of_organization(id) OR public.check_super_admin());

CREATE POLICY "Allow DELETE on organizations for super_admins"
ON public.organizations FOR DELETE
USING (public.check_super_admin());


-- Section 4: RLS Policies for `organization_members` Table
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow SELECT on organization_members for self, org_admins, super_admins"
ON public.organization_members FOR SELECT
USING (user_id = auth.uid() OR public.is_admin_of_organization(organization_id) OR public.check_super_admin());

CREATE POLICY "Allow INSERT on organization_members for org_admins and super_admins"
ON public.organization_members FOR INSERT
WITH CHECK (public.is_admin_of_organization(organization_id) OR public.check_super_admin());

CREATE POLICY "Allow UPDATE on organization_members for org_admins and super_admins"
ON public.organization_members FOR UPDATE
USING (public.is_admin_of_organization(organization_id) OR public.check_super_admin())
WITH CHECK (public.is_admin_of_organization(organization_id) OR public.check_super_admin());
-- More granular update control (e.g., user cannot change their own role unless admin) might be needed at application level or more complex RLS.

CREATE POLICY "Allow DELETE on organization_members for self, org_admins, super_admins"
ON public.organization_members FOR DELETE
USING (user_id = auth.uid() OR public.is_admin_of_organization(organization_id) OR public.check_super_admin());


-- Section 5: RLS Policies for Tables with Nullable `organization_id`

-- enabled_components
ALTER TABLE public.enabled_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on enabled_components"
ON public.enabled_components FOR SELECT
USING (
    (organization_id IS NOT NULL AND public.is_member_of_organization(organization_id))
    OR organization_id IS NULL -- Global templates/records visible to all authenticated users
    OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on enabled_components"
ON public.enabled_components FOR INSERT
WITH CHECK (
    (organization_id IS NOT NULL AND public.is_member_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin()) -- Only super_admins can insert global records
);
CREATE POLICY "Allow UPDATE on enabled_components"
ON public.enabled_components FOR UPDATE
USING (
    (organization_id IS NOT NULL AND (public.is_admin_of_organization(organization_id) OR public.is_member_of_organization(organization_id)) ) -- Members or Admins for their org-specific
    OR (organization_id IS NULL AND public.check_super_admin()) -- Super admins for global
    OR public.check_super_admin() -- Super admins overall
)
WITH CHECK (
    (organization_id IS NOT NULL AND (public.is_admin_of_organization(organization_id) OR public.is_member_of_organization(organization_id)) )
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on enabled_components"
ON public.enabled_components FOR DELETE
USING (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id)) -- Org admins for their org-specific
    OR (organization_id IS NULL AND public.check_super_admin()) -- Super admins for global
    OR public.check_super_admin() -- Super admins overall
);

-- component_permissions
ALTER TABLE public.component_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on component_permissions"
ON public.component_permissions FOR SELECT
USING (
    (organization_id IS NOT NULL AND public.is_member_of_organization(organization_id))
    OR organization_id IS NULL -- Global permissions visible to all authenticated users
    OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on component_permissions"
ON public.component_permissions FOR INSERT
WITH CHECK (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id)) -- Org admins for their org-specific
    OR (organization_id IS NULL AND public.check_super_admin()) -- Only super_admins can insert global records
);
CREATE POLICY "Allow UPDATE on component_permissions"
ON public.component_permissions FOR UPDATE
USING (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
)
WITH CHECK (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on component_permissions"
ON public.component_permissions FOR DELETE
USING (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
);

-- stripe_integrations (Assuming NULL organization_id is rare or super_admin only)
ALTER TABLE public.stripe_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on stripe_integrations"
ON public.stripe_integrations FOR SELECT
USING (
    (organization_id IS NOT NULL AND public.is_member_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin()) -- Only super_admin can see global/unlinked ones
    OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on stripe_integrations"
ON public.stripe_integrations FOR INSERT
WITH CHECK (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
);
CREATE POLICY "Allow UPDATE on stripe_integrations"
ON public.stripe_integrations FOR UPDATE
USING (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
)
WITH CHECK (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on stripe_integrations"
ON public.stripe_integrations FOR DELETE
USING (
    (organization_id IS NOT NULL AND public.is_admin_of_organization(organization_id))
    OR (organization_id IS NULL AND public.check_super_admin())
    OR public.check_super_admin()
);


-- Section 6: RLS Policies for Child Tables

-- contact_form_fields (parent: contact_forms via form_id)
ALTER TABLE public.contact_form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on contact_form_fields via parent"
ON public.contact_form_fields FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.contact_forms cf
        WHERE cf.id = contact_form_fields.form_id AND (public.is_member_of_organization(cf.organization_id) OR public.check_super_admin())
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on contact_form_fields via parent"
ON public.contact_form_fields FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contact_forms cf
        WHERE cf.id = contact_form_fields.form_id AND public.is_member_of_organization(cf.organization_id) -- Changed to is_member for insert
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow UPDATE on contact_form_fields via parent"
ON public.contact_form_fields FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.contact_forms cf
        WHERE cf.id = contact_form_fields.form_id AND (public.is_member_of_organization(cf.organization_id) OR public.is_admin_of_organization(cf.organization_id))
    ) OR public.check_super_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contact_forms cf
        WHERE cf.id = contact_form_fields.form_id AND (public.is_member_of_organization(cf.organization_id) OR public.is_admin_of_organization(cf.organization_id))
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on contact_form_fields via parent"
ON public.contact_form_fields FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.contact_forms cf
        WHERE cf.id = contact_form_fields.form_id AND public.is_admin_of_organization(cf.organization_id)
    ) OR public.check_super_admin()
);

-- form_submission_attachments (parent: contact_form_submissions via submission_id)
-- Assuming contact_form_submissions.organization_id is the linking org_id
ALTER TABLE public.form_submission_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on form_submission_attachments via parent"
ON public.form_submission_attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.contact_form_submissions cfs
        WHERE cfs.id = form_submission_attachments.submission_id AND (public.is_member_of_organization(cfs.organization_id) OR public.check_super_admin())
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on form_submission_attachments via parent"
ON public.form_submission_attachments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contact_form_submissions cfs
        WHERE cfs.id = form_submission_attachments.submission_id AND public.is_member_of_organization(cfs.organization_id)
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow UPDATE on form_submission_attachments via parent"
ON public.form_submission_attachments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.contact_form_submissions cfs
        WHERE cfs.id = form_submission_attachments.submission_id AND (public.is_member_of_organization(cfs.organization_id) OR public.is_admin_of_organization(cfs.organization_id))
    ) OR public.check_super_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.contact_form_submissions cfs
        WHERE cfs.id = form_submission_attachments.submission_id AND (public.is_member_of_organization(cfs.organization_id) OR public.is_admin_of_organization(cfs.organization_id))
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on form_submission_attachments via parent"
ON public.form_submission_attachments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.contact_form_submissions cfs
        WHERE cfs.id = form_submission_attachments.submission_id AND public.is_admin_of_organization(cfs.organization_id)
    ) OR public.check_super_admin()
);

-- subscription_items (parent: subscriptions via subscription_id)
-- Assuming subscriptions.organization_id is the linking org_id
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow SELECT on subscription_items via parent"
ON public.subscription_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.id = subscription_items.subscription_id AND (public.is_member_of_organization(s.organization_id) OR public.check_super_admin())
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow INSERT on subscription_items via parent"
ON public.subscription_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.id = subscription_items.subscription_id AND public.is_member_of_organization(s.organization_id) -- Org member can add items to their subscription
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow UPDATE on subscription_items via parent"
ON public.subscription_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.id = subscription_items.subscription_id AND (public.is_member_of_organization(s.organization_id) OR public.is_admin_of_organization(s.organization_id))
    ) OR public.check_super_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.id = subscription_items.subscription_id AND (public.is_member_of_organization(s.organization_id) OR public.is_admin_of_organization(s.organization_id))
    ) OR public.check_super_admin()
);
CREATE POLICY "Allow DELETE on subscription_items via parent"
ON public.subscription_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.id = subscription_items.subscription_id AND public.is_admin_of_organization(s.organization_id) -- Only org admin or super admin
    ) OR public.check_super_admin()
);

COMMIT;
