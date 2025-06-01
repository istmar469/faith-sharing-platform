

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."add_organization_creator_as_admin"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Create a new organization for the user
    INSERT INTO organizations (name, slug)
    VALUES (
        'My Church',
        'church-' || substr(md5(random()::text), 1, 8)
    )
    RETURNING id INTO NEW.organization_id;

    -- Add the user as an org_admin of their organization
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (NEW.organization_id, NEW.id, 'org_admin');

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."add_organization_creator_as_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_organization_enable_component"("org_id" "uuid", "comp_id" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  can_enable boolean := false;
BEGIN
  SELECT 
    (sacc.is_globally_enabled AND COALESCE(tcp.is_included, false))
  INTO can_enable
  FROM super_admin_component_control sacc
  LEFT JOIN organizations o ON o.id = org_id
  LEFT JOIN subscription_tiers st ON st.name = o.current_tier
  LEFT JOIN tier_component_permissions tcp ON tcp.tier_id = st.id AND tcp.component_id = comp_id
  WHERE sacc.component_id = comp_id;
  
  RETURN COALESCE(can_enable, false);
END;
$$;


ALTER FUNCTION "public"."can_organization_enable_component"("org_id" "uuid", "comp_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_if_super_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  super_admin_count INTEGER;
  current_user_id UUID := auth.uid();
BEGIN
  -- Add a check to avoid NULL user_id
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT COUNT(*) INTO super_admin_count
  FROM organization_members
  WHERE user_id = current_user_id
  AND role = 'super_admin';
  
  RETURN super_admin_count > 0;
END;
$$;


ALTER FUNCTION "public"."check_if_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_if_super_admin"() IS 'Use this function instead of is_super_admin() to avoid parameter conflicts';



CREATE OR REPLACE FUNCTION "public"."check_if_super_admin"("target_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  super_admin_count INTEGER;
BEGIN
  -- Add a check to avoid NULL user_id
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT COUNT(*) INTO super_admin_count
  FROM organization_members
  WHERE user_id = target_user_id
  AND role = 'super_admin';
  
  RETURN super_admin_count > 0;
END;
$$;


ALTER FUNCTION "public"."check_if_super_admin"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_subdomain_availability"("subdomain_name" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE subdomain = subdomain_name
  );
$$;


ALTER FUNCTION "public"."check_subdomain_availability"("subdomain_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_super_admin"() RETURNS TABLE("is_super_admin" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only return one row with the result
  RETURN QUERY 
  SELECT DISTINCT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) AS is_super_admin;
END;
$$;


ALTER FUNCTION "public"."check_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_super_admin"() IS 'Returns exactly one row with super admin status (guaranteed single row)';



CREATE OR REPLACE FUNCTION "public"."check_super_admin_fixed"() RETURNS TABLE("is_super_admin" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Use explicit table alias for user_id
  RETURN QUERY 
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.user_id = auth.uid()  -- EXPLICITLY reference om.user_id
    AND om.role = 'super_admin'
  ) AS is_super_admin;
END;
$$;


ALTER FUNCTION "public"."check_super_admin_fixed"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_super_admin_fixed"() IS 'Returns exactly one row with super admin status with explicit table references';



CREATE OR REPLACE FUNCTION "public"."create_default_contact_form"("org_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  form_id uuid;
BEGIN
  -- Create default contact form
  INSERT INTO contact_forms (
    organization_id,
    name,
    slug,
    description,
    is_active,
    email_notifications,
    auto_responder,
    success_message
  ) VALUES (
    org_id,
    'Contact Us',
    'contact',
    'General contact form for inquiries',
    true,
    true,
    true,
    'Thank you for your message! We will get back to you as soon as possible.'
  ) RETURNING id INTO form_id;

  -- Create default form fields
  INSERT INTO contact_form_fields (form_id, field_type, label, field_name, placeholder, is_required, field_order) VALUES
  (form_id, 'text', 'Full Name', 'name', 'Enter your full name', true, 0),
  (form_id, 'email', 'Email Address', 'email', 'Enter your email address', true, 1),
  (form_id, 'text', 'Phone Number', 'phone', 'Enter your phone number (optional)', false, 2),
  (form_id, 'textarea', 'Message', 'message', 'Enter your message or inquiry', true, 3);

  RETURN form_id;
END;
$$;


ALTER FUNCTION "public"."create_default_contact_form"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."direct_super_admin_check"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;


ALTER FUNCTION "public"."direct_super_admin_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."exec_sql"("query" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  EXECUTE query;
END;
$$;


ALTER FUNCTION "public"."exec_sql"("query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_claims"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
  user_orgs JSONB;
  user_roles TEXT[];
BEGIN
  -- Check if super admin
  SELECT public.check_if_super_admin() INTO is_admin;
  
  -- Get organizations as JSON array
  WITH org_data AS (
    SELECT 
      id,
      name,
      role
    FROM 
      public.fetch_user_organizations()
  )
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'role', role
        )
      ),
      '[]'::jsonb
    )
  INTO user_orgs
  FROM org_data;
  
  -- Get distinct roles
  WITH role_data AS (
    SELECT role FROM public.fetch_user_roles()
  )
  SELECT 
    ARRAY_AGG(DISTINCT role)
  INTO user_roles
  FROM role_data;
  
  -- Return combined claims object
  RETURN jsonb_build_object(
    'is_super_admin', is_admin,
    'app_metadata', jsonb_build_object(
      'roles', COALESCE(to_jsonb(user_roles), '[]'::jsonb),
      'organizations', user_orgs
    )
  );
END;
$$;


ALTER FUNCTION "public"."fetch_user_claims"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fetch_user_claims"() IS 'Use this function instead of get_user_claims() to avoid parameter conflicts';



CREATE OR REPLACE FUNCTION "public"."fetch_user_claims"("target_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
  user_orgs JSONB;
  user_roles TEXT[];
BEGIN
  -- Check if super admin
  SELECT public.check_if_super_admin(target_user_id) INTO is_admin;
  
  -- Get organizations as JSON array
  WITH org_data AS (
    SELECT 
      id,
      name,
      role
    FROM 
      public.fetch_user_organizations(target_user_id)
  )
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'role', role
        )
      ),
      '[]'::jsonb
    )
  INTO user_orgs
  FROM org_data;
  
  -- Get distinct roles
  WITH role_data AS (
    SELECT role FROM public.fetch_user_roles(target_user_id)
  )
  SELECT 
    ARRAY_AGG(DISTINCT role)
  INTO user_roles
  FROM role_data;
  
  -- Return combined claims object
  RETURN jsonb_build_object(
    'is_super_admin', is_admin,
    'app_metadata', jsonb_build_object(
      'roles', COALESCE(to_jsonb(user_roles), '[]'::jsonb),
      'organizations', user_orgs
    )
  );
END;
$$;


ALTER FUNCTION "public"."fetch_user_claims"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "subdomain" "text", "custom_domain" "text", "created_at" timestamp with time zone, "role" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        o.subdomain,
        o.custom_domain,
        o.created_at,
        om.role
    FROM 
        organizations o
    JOIN 
        organization_members om ON o.id = om.organization_id
    WHERE 
        om.user_id = current_user_id;
END;
$$;


ALTER FUNCTION "public"."fetch_user_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_organizations"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "subdomain" "text", "custom_domain" "text", "created_at" timestamp with time zone, "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.subdomain,
    o.custom_domain,
    o.created_at,
    om.role
  FROM 
    organizations o
    JOIN organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."fetch_user_organizations"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_roles"() RETURNS TABLE("organization_id" "uuid", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = current_user_id;
END;
$$;


ALTER FUNCTION "public"."fetch_user_roles"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."fetch_user_roles"() IS 'Use this function instead of get_user_roles() to avoid parameter conflicts';



CREATE OR REPLACE FUNCTION "public"."fetch_user_roles"("target_user_id" "uuid") RETURNS TABLE("organization_id" "uuid", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."fetch_user_roles"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_organizations_for_super_admin"() RETURNS TABLE("id" "uuid", "name" "text", "role" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- First check if user is super admin
  WITH is_admin AS (
    SELECT EXISTS (
      SELECT 1
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    ) AS is_super
  )
  
  SELECT 
    o.id,
    o.name::text,
    'super_admin'::text AS role
  FROM 
    organizations o
  WHERE 
    (SELECT is_super FROM is_admin) = true;
$$;


ALTER FUNCTION "public"."get_all_organizations_for_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_auth_user_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_auth_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_components"("org_id" "uuid") RETURNS TABLE("component_id" "text", "enabled" boolean, "configuration" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.component_id,
    cp.enabled,
    COALESCE(ec.configuration, '{}'::jsonb) as configuration
  FROM component_permissions cp
  LEFT JOIN enabled_components ec ON cp.component_id = ec.component_id 
    AND cp.organization_id = ec.organization_id
  WHERE cp.organization_id = org_id
    AND cp.enabled = true;
END;
$$;


ALTER FUNCTION "public"."get_available_components"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_enabled_church_components"("org_id" "uuid") RETURNS TABLE("component_id" "text", "display_name" "text", "description" "text", "enabled" boolean, "configuration" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.component_id,
    cp.display_name,
    cp.description,
    cp.enabled,
    COALESCE(ec.configuration, '{}'::jsonb) as configuration
  FROM component_permissions cp
  LEFT JOIN enabled_components ec ON cp.component_id = ec.component_id 
    AND cp.organization_id = ec.organization_id
  WHERE cp.organization_id = org_id
    AND cp.category = 'church'
  ORDER BY cp.component_id;
END;
$$;


ALTER FUNCTION "public"."get_enabled_church_components"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_admin_status"() RETURNS TABLE("is_super_admin" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS(
    SELECT 1 FROM super_admins
    WHERE user_id = auth.uid()
  ) AS is_super_admin;
$$;


ALTER FUNCTION "public"."get_my_admin_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organization_available_components"("org_id" "uuid") RETURNS TABLE("component_id" "text", "display_name" "text", "description" "text", "category" "text", "is_globally_enabled" boolean, "minimum_tier_required" "text", "is_tier_included" boolean, "is_org_enabled" boolean, "can_enable" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sacc.component_id,
    cp.display_name,
    sacc.description,
    sacc.category,
    sacc.is_globally_enabled,
    sacc.minimum_tier_required,
    COALESCE(tcp.is_included, false) as is_tier_included,
    COALESCE(ec.is_active, false) as is_org_enabled,
    (sacc.is_globally_enabled AND COALESCE(tcp.is_included, false)) as can_enable
  FROM super_admin_component_control sacc
  LEFT JOIN component_permissions cp ON sacc.component_id = cp.component_id AND cp.organization_id = org_id
  LEFT JOIN organizations o ON o.id = org_id
  LEFT JOIN subscription_tiers st ON st.name = o.current_tier
  LEFT JOIN tier_component_permissions tcp ON tcp.tier_id = st.id AND tcp.component_id = sacc.component_id
  LEFT JOIN enabled_components ec ON ec.component_id = sacc.component_id AND ec.organization_id = org_id
  ORDER BY sacc.category, sacc.component_id;
END;
$$;


ALTER FUNCTION "public"."get_organization_available_components"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_single_super_admin_status"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- This guarantees exactly ONE row result with a boolean field
  SELECT jsonb_build_object(
    'is_super_admin', 
    EXISTS (
      SELECT 1
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );
$$;


ALTER FUNCTION "public"."get_single_super_admin_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_single_super_admin_status"() IS 'Returns exactly one JSON object with super admin status for the current user';



CREATE OR REPLACE FUNCTION "public"."get_super_admin_status"() RETURNS TABLE("is_super_admin" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    EXISTS (
      SELECT 1
      FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'super_admin'
    ) as is_super_admin
$$;


ALTER FUNCTION "public"."get_super_admin_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_super_admin_status"() IS 'Returns a single row with super admin status for the current user';



CREATE OR REPLACE FUNCTION "public"."get_super_admin_status_fixed"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT jsonb_build_object(
    'is_super_admin', 
    (SELECT EXISTS (
      SELECT 1
      FROM organization_members om  -- Alias the table
      WHERE om.user_id = auth.uid() -- Use the alias explicitly
      AND om.role = 'super_admin'
    ))
  );
$$;


ALTER FUNCTION "public"."get_super_admin_status_fixed"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_super_admin_status_fixed"() IS 'Returns a single JSON object with super admin status using explicit table references';



CREATE OR REPLACE FUNCTION "public"."get_user_claims"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
  user_orgs JSONB;
  user_roles TEXT[];
BEGIN
  -- Check if super admin
  SELECT public.is_super_admin(user_id) INTO is_admin;
  
  -- Get organizations as JSON array
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'role', role
        )
      ),
      '[]'::jsonb
    )
  INTO user_orgs
  FROM public.get_user_organizations(user_id);
  
  -- Get distinct roles
  SELECT 
    ARRAY_AGG(DISTINCT role)
  INTO user_roles
  FROM public.get_user_roles(user_id);
  
  -- Return combined claims object
  RETURN jsonb_build_object(
    'is_super_admin', is_admin,
    'app_metadata', jsonb_build_object(
      'roles', COALESCE(to_jsonb(user_roles), '[]'::jsonb),
      'organizations', user_orgs
    )
  );
END;
$$;


ALTER FUNCTION "public"."get_user_claims"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "role" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    o.id,
    o.name::text, -- Explicit cast to TEXT
    om.role::text -- Explicit cast to TEXT
  FROM 
    organizations o
    JOIN organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organizations"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS TABLE("id" "uuid", "name" "text", "subdomain" "text", "custom_domain" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.subdomain,
    o.custom_domain,
    o.created_at,
    o.updated_at,
    om.role
  FROM 
    organizations o
    JOIN organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = get_user_organizations.user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_organizations"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_roles"("user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS TABLE("organization_id" "uuid", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = get_user_roles.user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_roles"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Create a new organization for the user
    INSERT INTO organizations (name, slug)
    VALUES (
        'My Church',
        'church-' || substr(md5(random()::text), 1, 8)
    )
    RETURNING id INTO NEW.organization_id;

    -- Add the user as an org_admin of their organization
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (NEW.organization_id, NEW.id, 'org_admin');

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- If we're inserting/updating a role or deleting a record, update claims
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    -- For inserts and updates, use the user_id from NEW
    -- For deletes, use the user_id from OLD
    DECLARE
      affected_user_id UUID;
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        affected_user_id := OLD.user_id;
      ELSE
        affected_user_id := NEW.user_id;
      END IF;
      
      -- Update claims in auth.users - requires proper permissions
      UPDATE auth.users
      SET raw_app_meta_data = 
        (SELECT get_user_claims(affected_user_id))
      WHERE id = affected_user_id;
    END;
  END IF;
  
  -- Return NEW for INSERT/UPDATE, OLD for DELETE
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_user_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_member_of_org"("org_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE user_id = auth.uid() 
      AND organization_id = org_id
  );
END;
$$;


ALTER FUNCTION "public"."is_member_of_org"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin"("org_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Super admins are considered admins of all organizations
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check if user is an admin or owner of this organization
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = get_auth_user_id()
    AND role IN ('owner', 'admin')
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;


ALTER FUNCTION "public"."is_org_admin"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_member"("org_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  -- Super admins are considered members of all organizations
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a regular member of this organization
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = get_auth_user_id()
  ) INTO is_member;
  
  RETURN is_member;
END;
$$;


ALTER FUNCTION "public"."is_org_member"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM super_admins
        WHERE user_id = auth.uid()
    ) INTO is_admin;

    RETURN is_admin;
END;
$$;


ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_super_admin"() IS 'Checks if current user is a super admin using direct table lookup';



CREATE OR REPLACE FUNCTION "public"."is_super_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    is_admin boolean;
BEGIN
    -- Use fully qualified table reference to prevent ambiguity
    SELECT au.is_super_admin INTO is_admin
    FROM auth.users AS au
    WHERE au.id = user_id;

    -- Handle potential null values
    RETURN COALESCE(is_admin, FALSE);
END;
$$;


ALTER FUNCTION "public"."is_super_admin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Use explicit table aliases to avoid ambiguity
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.user_id = user_uuid
    AND om.role = 'super_admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;


ALTER FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") IS 'Checks if a specific user is a super admin by their UUID';



CREATE OR REPLACE FUNCTION "public"."is_super_admin_direct"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Direct lookup with no ambiguity
  SELECT EXISTS(
    SELECT 1 FROM super_admins
    WHERE user_id = auth.uid()
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."is_super_admin_direct"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rbac_fetch_user_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "subdomain" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.subdomain,
    om.role
  FROM 
    organizations o
    JOIN organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = current_user_id;
END;
$$;


ALTER FUNCTION "public"."rbac_fetch_user_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rbac_get_user_claims"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  is_admin BOOLEAN;
  user_orgs JSONB;
  user_roles TEXT[];
  current_user_id UUID := auth.uid();
BEGIN
  -- Check if super admin
  SELECT public.rbac_is_super_admin() INTO is_admin;
  
  -- Get organizations as JSON array - using simplified schema
  WITH org_data AS (
    SELECT 
      id,
      name,
      role
    FROM 
      public.rbac_get_user_organizations()
  )
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'name', name,
          'role', role
        )
      ),
      '[]'::jsonb
    )
  INTO user_orgs
  FROM org_data;
  
  -- Get distinct roles
  WITH role_data AS (
    SELECT role FROM public.rbac_get_user_roles()
  )
  SELECT 
    ARRAY_AGG(DISTINCT role)
  INTO user_roles
  FROM role_data
  WHERE role IS NOT NULL;
  
  -- Return combined claims object
  RETURN jsonb_build_object(
    'is_super_admin', is_admin,
    'app_metadata', jsonb_build_object(
      'roles', COALESCE(to_jsonb(user_roles), '[]'::jsonb),
      'organizations', user_orgs
    )
  );
END;
$$;


ALTER FUNCTION "public"."rbac_get_user_claims"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rbac_get_user_claims"() IS 'Fixed claims function that works with current schema';



CREATE OR REPLACE FUNCTION "public"."rbac_get_user_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Simplified query that won't fail if columns don't exist
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    om.role
  FROM 
    organizations o
    JOIN organization_members om ON o.id = om.organization_id
  WHERE 
    om.user_id = current_user_id;
END;
$$;


ALTER FUNCTION "public"."rbac_get_user_organizations"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rbac_get_user_organizations"() IS 'Fixed organization lookup that works with current schema';



CREATE OR REPLACE FUNCTION "public"."rbac_get_user_roles"() RETURNS TABLE("organization_id" "uuid", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  -- Bypass RLS with direct query
  RETURN QUERY
  SELECT om.organization_id, om.role
  FROM organization_members om
  WHERE om.user_id = current_user_id;
END;
$$;


ALTER FUNCTION "public"."rbac_get_user_roles"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rbac_get_user_roles"() IS 'Fixed role check function that avoids RLS recursion';



CREATE OR REPLACE FUNCTION "public"."rbac_is_super_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  super_admin_count INTEGER;
  current_user_id UUID := auth.uid();
BEGIN
  -- Add a check to avoid NULL user_id
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Direct query that bypasses RLS
  SELECT COUNT(*) INTO super_admin_count
  FROM organization_members
  WHERE user_id = current_user_id
  AND role = 'super_admin';
  
  RETURN super_admin_count > 0;
END;
$$;


ALTER FUNCTION "public"."rbac_is_super_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."rbac_is_super_admin"() IS 'Fixed super admin check function that avoids RLS recursion';



CREATE OR REPLACE FUNCTION "public"."safe_super_admin_check"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Direct query with explicit table aliases to avoid ambiguity
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role = 'super_admin'
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."safe_super_admin_check"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."safe_super_admin_check"() IS 'Safely checks if current user is a super admin, bypassing RLS recursion';



CREATE OR REPLACE FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Run a direct query with no RLS policy dependencies
  SELECT EXISTS (
    SELECT 1 
    FROM organization_members om
    WHERE om.user_id = check_user_id
    AND om.role = 'super_admin'
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") IS 'Safely checks if specified user is a super admin, bypassing RLS recursion';



CREATE OR REPLACE FUNCTION "public"."setup_new_organization"("org_name" "text", "org_subdomain" "text", "pastor_name" "text" DEFAULT NULL::"text", "contact_email" "text" DEFAULT NULL::"text", "contact_role" "text" DEFAULT 'admin'::"text", "phone_number" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  new_org_id uuid;
  current_user_id uuid;
  subdomain_taken boolean;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Validate subdomain format (3-63 chars, alphanumeric and hyphens, start/end with alphanumeric)
  IF org_subdomain !~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$' AND length(org_subdomain) > 1 THEN
    RAISE EXCEPTION 'Invalid subdomain format. Must be 3-63 characters, contain only lowercase letters, numbers, and hyphens, and start/end with alphanumeric characters.';
  END IF;
  
  IF length(org_subdomain) < 3 OR length(org_subdomain) > 63 THEN
    RAISE EXCEPTION 'Subdomain must be between 3 and 63 characters long.';
  END IF;
  
  -- Check subdomain availability directly without calling function to avoid recursion
  SELECT EXISTS (
    SELECT 1 FROM organizations 
    WHERE subdomain = org_subdomain
  ) INTO subdomain_taken;
  
  IF subdomain_taken THEN
    RAISE EXCEPTION 'Subdomain is already taken.';
  END IF;
  
  -- Create the organization
  INSERT INTO organizations (
    name, 
    slug, 
    subdomain, 
    website_enabled,
    pastor_name,
    contact_email,
    contact_role,
    phone_number,
    current_tier,
    subscription_status
  ) VALUES (
    org_name,
    lower(replace(replace(org_name, ' ', '-'), '_', '-')),
    org_subdomain,
    true,
    pastor_name,
    contact_email,
    contact_role,
    phone_number,
    'basic',
    'active'
  ) RETURNING id INTO new_org_id;
  
  -- Add the current user as an admin
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'org_admin');
  
  -- Create default site settings
  INSERT INTO site_settings (
    organization_id,
    site_title,
    site_description,
    header_config,
    footer_config,
    theme_config
  ) VALUES (
    new_org_id,
    org_name,
    'Welcome to ' || org_name,
    '{"navigation": [], "show_navigation": true}',
    '{"text": "© 2024 ' || org_name || '. All rights reserved.", "show_footer": true}',
    '{"primary_color": "#3b82f6", "secondary_color": "#64748b"}'
  );
  
  -- Create default homepage
  INSERT INTO pages (
    organization_id,
    title,
    slug,
    content,
    is_homepage,
    published,
    show_in_navigation
  ) VALUES (
    new_org_id,
    'Welcome to ' || org_name,
    'home',
    '[{"type": "header", "data": {"text": "Welcome to ' || org_name || '", "level": 1}}, {"type": "paragraph", "data": {"text": "Welcome to our website! We are excited to share our ministry with you."}}]',
    true,
    true,
    false
  );

  -- Create default email configuration
  INSERT INTO email_configurations (
    organization_id,
    from_email,
    from_name,
    notification_emails,
    smtp_enabled
  ) VALUES (
    new_org_id,
    COALESCE(contact_email, 'noreply@example.com'),
    org_name,
    ARRAY[COALESCE(contact_email, 'admin@example.com')],
    false
  );

  -- Create default contact form
  PERFORM create_default_contact_form(new_org_id);
  
  RETURN new_org_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise with context
    RAISE EXCEPTION 'Organization setup failed: %', SQLERRM;
END;
$_$;


ALTER FUNCTION "public"."setup_new_organization"("org_name" "text", "org_subdomain" "text", "pastor_name" "text", "contact_email" "text", "contact_role" "text", "phone_number" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."simple_get_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "role" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- First check if user is super admin
  WITH is_admin AS (
    SELECT EXISTS (
      SELECT 1
      FROM public.super_admins
      WHERE user_id = auth.uid()
    ) AS is_super
  )
  
  -- If super admin, return all orgs with role = 'super_admin'
  SELECT 
    o.id,
    o.name,
    CASE 
      WHEN (SELECT is_super FROM is_admin) THEN 'super_admin'::text 
      ELSE om.role::text 
    END
  FROM 
    organizations o
  LEFT JOIN 
    organization_members om ON o.id = om.organization_id AND om.user_id = auth.uid()
  WHERE 
    (SELECT is_super FROM is_admin) -- Include all orgs if super admin
    OR om.user_id = auth.uid();     -- Otherwise only include memberships
$$;


ALTER FUNCTION "public"."simple_get_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."simple_is_super_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admins
    WHERE user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."simple_is_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."super_admin_status"() RETURNS "jsonb"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT jsonb_build_object(
    'is_super_admin', 
    EXISTS (
      SELECT 1 
      FROM organization_members
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );
$$;


ALTER FUNCTION "public"."super_admin_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."super_admin_view_all_members"() RETURNS TABLE("id" "uuid", "organization_id" "uuid", "organization_name" "text", "user_id" "uuid", "user_email" "text", "role" "text", "created_at" timestamp without time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF is_super_admin() THEN
    RETURN QUERY 
    SELECT 
      om.id,
      om.organization_id,
      org.name as organization_name,
      om.user_id,
      u.email as user_email,
      om.role,
      om.created_at
    FROM organization_members om
    JOIN organizations org ON om.organization_id = org.id
    JOIN users u ON om.user_id = u.id;
  ELSE
    RAISE EXCEPTION 'Access denied. Only super admins can use this function.';
  END IF;
END;
$$;


ALTER FUNCTION "public"."super_admin_view_all_members"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "subdomain" "text",
    "custom_domain" "text",
    "website_enabled" boolean DEFAULT false,
    "current_tier" "text" DEFAULT 'basic'::"text",
    "subscription_status" "text" DEFAULT 'active'::"text",
    "subscription_expires_at" timestamp with time zone,
    "pastor_name" "text",
    "phone_number" "text",
    "contact_email" "text",
    "contact_role" "text" DEFAULT 'admin'::"text"
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."super_admin_view_all_organizations"() RETURNS SETOF "public"."organizations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF is_super_admin() THEN
    RETURN QUERY SELECT * FROM organizations;
  ELSE
    RETURN QUERY SELECT * FROM organizations WHERE false;
  END IF;
END;
$$;


ALTER FUNCTION "public"."super_admin_view_all_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_site_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_site_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "type" character varying(50) NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "user_id" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "activities_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['member_joined'::character varying, 'event_created'::character varying, 'donation'::character varying, 'message'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "priority" "text" DEFAULT 'normal'::"text",
    "start_date" "date" DEFAULT CURRENT_DATE,
    "end_date" "date",
    "is_published" boolean DEFAULT true,
    "created_by" "uuid",
    "display_order" integer DEFAULT 0,
    "target_audience" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "announcements_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"])))
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance_records" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "event_id" "uuid",
    "service_type" character varying(50) NOT NULL,
    "date" "date" NOT NULL,
    "count" integer NOT NULL,
    "new_visitors" integer DEFAULT 0,
    "check_ins" integer DEFAULT 0,
    "notes" "text",
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "attendance_records_check_ins_check" CHECK (("check_ins" >= 0)),
    CONSTRAINT "attendance_records_count_check" CHECK (("count" >= 0)),
    CONSTRAINT "attendance_records_new_visitors_check" CHECK (("new_visitors" >= 0))
);


ALTER TABLE "public"."attendance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."church_info" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "country" "text" DEFAULT 'USA'::"text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "service_times" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."church_info" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."component_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "component_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "display_name" "text",
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "dependencies" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."component_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_form_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_id" "uuid" NOT NULL,
    "field_type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "field_name" "text" NOT NULL,
    "placeholder" "text",
    "help_text" "text",
    "is_required" boolean DEFAULT false NOT NULL,
    "field_order" integer DEFAULT 0 NOT NULL,
    "validation_rules" "jsonb" DEFAULT '{}'::"jsonb",
    "field_options" "jsonb" DEFAULT '[]'::"jsonb",
    "conditional_logic" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contact_form_fields_field_type_check" CHECK (("field_type" = ANY (ARRAY['text'::"text", 'email'::"text", 'phone'::"text", 'textarea'::"text", 'select'::"text", 'checkbox'::"text", 'radio'::"text", 'file'::"text", 'date'::"text", 'number'::"text"])))
);


ALTER TABLE "public"."contact_form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "form_data" "jsonb" NOT NULL,
    "submitted_from_ip" "text",
    "user_agent" "text",
    "referrer" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "email_sent" boolean DEFAULT false NOT NULL,
    "auto_response_sent" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contact_form_submissions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'replied'::"text", 'archived'::"text", 'spam'::"text"])))
);


ALTER TABLE "public"."contact_form_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "allow_file_uploads" boolean DEFAULT false NOT NULL,
    "max_file_size" integer DEFAULT 5242880,
    "success_message" "text" DEFAULT 'Thank you for your message. We will get back to you soon.'::"text",
    "redirect_url" "text",
    "email_notifications" boolean DEFAULT true NOT NULL,
    "auto_responder" boolean DEFAULT true NOT NULL,
    "require_approval" boolean DEFAULT false NOT NULL,
    "spam_protection" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contact_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."domains" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "custom_domain" character varying(255),
    "provisioned" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."donations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "donor_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "fund" character varying(50) DEFAULT 'general'::character varying NOT NULL,
    "donation_date" "date" NOT NULL,
    "payment_method" character varying(50),
    "transaction_id" character varying(255),
    "is_recurring" boolean DEFAULT false,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "donations_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."donations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "from_email" "text" NOT NULL,
    "from_name" "text" NOT NULL,
    "reply_to_email" "text",
    "notification_emails" "text"[] DEFAULT '{}'::"text"[],
    "smtp_enabled" boolean DEFAULT false NOT NULL,
    "smtp_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "template_type" "text" NOT NULL,
    "form_id" "uuid",
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "html_content" "text" NOT NULL,
    "text_content" "text",
    "variables" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "email_templates_template_type_check" CHECK (("template_type" = ANY (ARRAY['auto_response'::"text", 'notification'::"text", 'confirmation'::"text"])))
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enabled_components" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "component_id" "text" NOT NULL,
    "configuration" "jsonb" DEFAULT '{}'::"jsonb",
    "position" integer DEFAULT 0,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."enabled_components" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(50) NOT NULL,
    "color" character varying(7) DEFAULT '#3b82f6'::character varying NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "attendee_name" "text" NOT NULL,
    "attendee_email" "text" NOT NULL,
    "attendee_phone" "text",
    "registration_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying(20) DEFAULT 'confirmed'::character varying NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "template_data" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "location" "text",
    "category" character varying(50) DEFAULT 'other'::character varying NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "recurrence_pattern" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "color" character varying(7) DEFAULT '#3b82f6'::character varying,
    "max_attendees" integer,
    "registration_required" boolean DEFAULT false NOT NULL,
    "registration_deadline" "date",
    "published" boolean DEFAULT true NOT NULL,
    "featured" boolean DEFAULT false NOT NULL,
    CONSTRAINT "events_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['service'::character varying, 'meeting'::character varying, 'outreach'::character varying, 'youth'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submission_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "field_name" "text" NOT NULL,
    "original_filename" "text" NOT NULL,
    "stored_filename" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "mime_type" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."form_submission_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."funds" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."funds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text", 'super admin'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "show_in_navigation" boolean DEFAULT true NOT NULL,
    "meta_title" "text",
    "meta_description" "text",
    "parent_id" "uuid",
    "organization_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_homepage" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "amount" integer NOT NULL,
    "currency" "text" DEFAULT 'usd'::"text" NOT NULL,
    "status" "text" NOT NULL,
    "payment_method" "text",
    "stripe_payment_intent_id" "text",
    "stripe_invoice_id" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_history_status_check" CHECK (("status" = ANY (ARRAY['succeeded'::"text", 'pending'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."payment_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "billing_address" "jsonb",
    "payment_method" "jsonb",
    "subscription_status" "text",
    "subscription_id" "text",
    "subscription_plan" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" character varying(255) NOT NULL,
    "path" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "site_title" "text" NOT NULL,
    "site_description" "text",
    "logo_url" "text",
    "favicon_url" "text",
    "header_config" "jsonb" DEFAULT '{"navigation": [], "show_navigation": true}'::"jsonb" NOT NULL,
    "footer_config" "jsonb" DEFAULT '{"text": "© 2024 My Website. All rights reserved.", "show_footer": true}'::"jsonb" NOT NULL,
    "theme_config" "jsonb" DEFAULT '{"primary_color": "#3b82f6", "secondary_color": "#64748b"}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "position" "text" NOT NULL,
    "bio" "text",
    "email" "text",
    "phone" "text",
    "photo_url" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."staff_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_integrations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "stripe_account_id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_verified" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."stripe_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "stripe_item_id" "text",
    "price_id" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "price_monthly" integer DEFAULT 0,
    "price_yearly" integer DEFAULT 0,
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "tier" "text" NOT NULL,
    "current_period_start" timestamp with time zone NOT NULL,
    "current_period_end" timestamp with time zone NOT NULL,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL,
    "trial_start" timestamp with time zone,
    "trial_end" timestamp with time zone,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'trialing'::"text", 'past_due'::"text", 'canceled'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'unpaid'::"text"]))),
    CONSTRAINT "subscriptions_tier_check" CHECK (("tier" = ANY (ARRAY['free'::"text", 'basic'::"text", 'standard'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."super_admin_component_control" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "component_id" "text" NOT NULL,
    "is_globally_enabled" boolean DEFAULT true,
    "minimum_tier_required" "text" DEFAULT 'basic'::"text",
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."super_admin_component_control" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."super_admins" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."super_admins" OWNER TO "postgres";


COMMENT ON TABLE "public"."super_admins" IS 'Sole source of super admin status (super_admin_users table removed)';



CREATE TABLE IF NOT EXISTS "public"."tier_component_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tier_id" "uuid",
    "component_id" "text" NOT NULL,
    "is_included" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tier_component_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "feature" "text" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "last_used" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usage_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text", 'org_user'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."church_info"
    ADD CONSTRAINT "church_info_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."church_info"
    ADD CONSTRAINT "church_info_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."component_permissions"
    ADD CONSTRAINT "component_permissions_organization_id_component_id_key" UNIQUE ("organization_id", "component_id");



ALTER TABLE ONLY "public"."component_permissions"
    ADD CONSTRAINT "component_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_form_fields"
    ADD CONSTRAINT "contact_form_fields_form_id_field_name_key" UNIQUE ("form_id", "field_name");



ALTER TABLE ONLY "public"."contact_form_fields"
    ADD CONSTRAINT "contact_form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_form_submissions"
    ADD CONSTRAINT "contact_form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_forms"
    ADD CONSTRAINT "contact_forms_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."contact_forms"
    ADD CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."domains"
    ADD CONSTRAINT "domains_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."domains"
    ADD CONSTRAINT "domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."donations"
    ADD CONSTRAINT "donations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_configurations"
    ADD CONSTRAINT "email_configurations_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."email_configurations"
    ADD CONSTRAINT "email_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enabled_components"
    ADD CONSTRAINT "enabled_components_organization_id_component_id_key" UNIQUE ("organization_id", "component_id");



ALTER TABLE ONLY "public"."enabled_components"
    ADD CONSTRAINT "enabled_components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_categories"
    ADD CONSTRAINT "event_categories_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."event_categories"
    ADD CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_templates"
    ADD CONSTRAINT "event_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submission_attachments"
    ADD CONSTRAINT "form_submission_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funds"
    ADD CONSTRAINT "funds_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."funds"
    ADD CONSTRAINT "funds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_history"
    ADD CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_audit_logs"
    ADD CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_members"
    ADD CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_integrations"
    ADD CONSTRAINT "stripe_integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_items"
    ADD CONSTRAINT "subscription_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_tiers"
    ADD CONSTRAINT "subscription_tiers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."subscription_tiers"
    ADD CONSTRAINT "subscription_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admin_component_control"
    ADD CONSTRAINT "super_admin_component_control_component_id_key" UNIQUE ("component_id");



ALTER TABLE ONLY "public"."super_admin_component_control"
    ADD CONSTRAINT "super_admin_component_control_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admins"
    ADD CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admins"
    ADD CONSTRAINT "super_admins_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."tier_component_permissions"
    ADD CONSTRAINT "tier_component_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tier_component_permissions"
    ADD CONSTRAINT "tier_component_permissions_tier_id_component_id_key" UNIQUE ("tier_id", "component_id");



ALTER TABLE ONLY "public"."usage_metrics"
    ADD CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activities_created_at" ON "public"."activities" USING "btree" ("created_at");



CREATE INDEX "idx_activities_organization" ON "public"."activities" USING "btree" ("organization_id");



CREATE INDEX "idx_activities_type" ON "public"."activities" USING "btree" ("type");



CREATE INDEX "idx_announcements_dates" ON "public"."announcements" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_announcements_org_published" ON "public"."announcements" USING "btree" ("organization_id", "is_published");



CREATE INDEX "idx_attendance_date" ON "public"."attendance_records" USING "btree" ("date");



CREATE INDEX "idx_attendance_organization" ON "public"."attendance_records" USING "btree" ("organization_id");



CREATE INDEX "idx_attendance_service_type" ON "public"."attendance_records" USING "btree" ("service_type");



CREATE INDEX "idx_contact_form_fields_form_order" ON "public"."contact_form_fields" USING "btree" ("form_id", "field_order");



CREATE INDEX "idx_contact_forms_org_active" ON "public"."contact_forms" USING "btree" ("organization_id", "is_active");



CREATE INDEX "idx_donations_date" ON "public"."donations" USING "btree" ("donation_date");



CREATE INDEX "idx_donations_donor" ON "public"."donations" USING "btree" ("donor_id");



CREATE INDEX "idx_donations_fund" ON "public"."donations" USING "btree" ("fund");



CREATE INDEX "idx_donations_organization" ON "public"."donations" USING "btree" ("organization_id");



CREATE INDEX "idx_email_templates_org_type" ON "public"."email_templates" USING "btree" ("organization_id", "template_type");



CREATE INDEX "idx_event_registrations_email" ON "public"."event_registrations" USING "btree" ("attendee_email");



CREATE INDEX "idx_event_registrations_event" ON "public"."event_registrations" USING "btree" ("event_id");



CREATE INDEX "idx_events_category" ON "public"."events" USING "btree" ("category");



CREATE INDEX "idx_events_date" ON "public"."events" USING "btree" ("date");



CREATE INDEX "idx_events_organization" ON "public"."events" USING "btree" ("organization_id");



CREATE INDEX "idx_events_organization_date" ON "public"."events" USING "btree" ("organization_id", "date");



CREATE INDEX "idx_events_published" ON "public"."events" USING "btree" ("published");



CREATE INDEX "idx_funds_organization" ON "public"."funds" USING "btree" ("organization_id");



CREATE INDEX "idx_organizations_custom_domain" ON "public"."organizations" USING "btree" ("custom_domain");



CREATE INDEX "idx_organizations_subdomain" ON "public"."organizations" USING "btree" ("subdomain");



CREATE INDEX "idx_staff_members_org_active" ON "public"."staff_members" USING "btree" ("organization_id", "is_active");



CREATE INDEX "idx_submissions_created" ON "public"."contact_form_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_submissions_form_status" ON "public"."contact_form_submissions" USING "btree" ("form_id", "status");



CREATE UNIQUE INDEX "idx_unique_homepage_per_org" ON "public"."pages" USING "btree" ("organization_id") WHERE ("is_homepage" = true);



CREATE UNIQUE INDEX "pages_organization_slug_idx" ON "public"."pages" USING "btree" ("organization_id", "slug");



CREATE OR REPLACE TRIGGER "add_creator_as_admin_trigger" AFTER INSERT ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."add_organization_creator_as_admin"();



CREATE OR REPLACE TRIGGER "update_contact_form_fields_updated_at" BEFORE UPDATE ON "public"."contact_form_fields" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_form_submissions_updated_at" BEFORE UPDATE ON "public"."contact_form_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_forms_updated_at" BEFORE UPDATE ON "public"."contact_forms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_configurations_updated_at" BEFORE UPDATE ON "public"."email_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_event_templates_updated_at" BEFORE UPDATE ON "public"."event_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pages_updated_at" BEFORE UPDATE ON "public"."pages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_site_settings_updated_at"();



CREATE OR REPLACE TRIGGER "update_subscription_items_updated_at" BEFORE UPDATE ON "public"."subscription_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_super_admin_component_control_updated_at" BEFORE UPDATE ON "public"."super_admin_component_control" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_usage_metrics_updated_at" BEFORE UPDATE ON "public"."usage_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."attendance_records"
    ADD CONSTRAINT "attendance_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."component_permissions"
    ADD CONSTRAINT "component_permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_form_fields"
    ADD CONSTRAINT "contact_form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."contact_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_form_submissions"
    ADD CONSTRAINT "contact_form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."contact_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."donations"
    ADD CONSTRAINT "donations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."donations"
    ADD CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."contact_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enabled_components"
    ADD CONSTRAINT "enabled_components_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_registrations"
    ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_submission_attachments"
    ADD CONSTRAINT "form_submission_attachments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_form_submissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_current_tier_fkey" FOREIGN KEY ("current_tier") REFERENCES "public"."subscription_tiers"("name");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id");



ALTER TABLE ONLY "public"."payment_history"
    ADD CONSTRAINT "payment_history_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_members"
    ADD CONSTRAINT "staff_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_items"
    ADD CONSTRAINT "subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tier_component_permissions"
    ADD CONSTRAINT "tier_component_permissions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "public"."subscription_tiers"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage contact forms" ON "public"."contact_forms" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "Admins can manage email config" ON "public"."email_configurations" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "Admins can manage email templates" ON "public"."email_templates" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "Admins can manage form fields" ON "public"."contact_form_fields" USING ((EXISTS ( SELECT 1
   FROM "public"."contact_forms" "cf"
  WHERE (("cf"."id" = "contact_form_fields"."form_id") AND "public"."is_org_admin"("cf"."organization_id")))));



CREATE POLICY "Admins can update submissions" ON "public"."contact_form_submissions" FOR UPDATE USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "Admins can update their organizations" ON "public"."organizations" FOR UPDATE USING ((("auth"."uid"() IN ( SELECT "organization_members"."user_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organizations"."id") AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))) OR "public"."is_super_admin"()));



CREATE POLICY "Admins can view submission attachments" ON "public"."form_submission_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."contact_form_submissions" "cfs"
  WHERE (("cfs"."id" = "form_submission_attachments"."submission_id") AND "public"."is_org_admin"("cfs"."organization_id")))));



CREATE POLICY "Admins can view submissions" ON "public"."contact_form_submissions" FOR SELECT USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "Allow authenticated users to create organizations" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Anyone can create submission attachments" ON "public"."form_submission_attachments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create submissions" ON "public"."contact_form_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can register for events" ON "public"."event_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Everyone can read component control settings" ON "public"."super_admin_component_control" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Everyone can read subscription tiers" ON "public"."subscription_tiers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Everyone can read tier component permissions" ON "public"."tier_component_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Org admins can manage component permissions" ON "public"."component_permissions" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can manage enabled components" ON "public"."enabled_components" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can create domains" ON "public"."domains" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "domains"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization admins can create stripe integrations" ON "public"."stripe_integrations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "stripe_integrations"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization admins can delete site settings" ON "public"."site_settings" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "site_settings"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can insert site settings" ON "public"."site_settings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "site_settings"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can manage announcements" ON "public"."announcements" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can manage categories" ON "public"."event_categories" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can manage registrations" ON "public"."event_registrations" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can manage staff" ON "public"."staff_members" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can manage templates" ON "public"."event_templates" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can update site settings" ON "public"."site_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "site_settings"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Organization admins can update their domains" ON "public"."domains" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "domains"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization admins can update their stripe integrations" ON "public"."stripe_integrations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "stripe_integrations"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization admins can view their domains" ON "public"."domains" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "domains"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization admins can view their stripe integrations" ON "public"."stripe_integrations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "stripe_integrations"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'admin'::"text")))));



CREATE POLICY "Organization members can create pages for their organization" ON "public"."pages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."organization_id" = "pages"."organization_id")))));



CREATE POLICY "Organization members can delete their organization's pages" ON "public"."pages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."organization_id" = "pages"."organization_id")))));



CREATE POLICY "Organization members can update their organization's pages" ON "public"."pages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."organization_id" = "pages"."organization_id")))));



CREATE POLICY "Organization members can view announcements" ON "public"."announcements" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view categories" ON "public"."event_categories" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view registrations" ON "public"."event_registrations" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view staff" ON "public"."staff_members" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view templates" ON "public"."event_templates" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view their pages" ON "public"."pages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."organization_id" = "pages"."organization_id")))));



CREATE POLICY "Super admins can delete organizations" ON "public"."organizations" FOR DELETE TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'is_super_admin'::"text") = 'true'::"text"));



CREATE POLICY "Super admins can insert organizations" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'is_super_admin'::"text") = 'true'::"text"));



CREATE POLICY "Super admins can manage all component permissions" ON "public"."component_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage all enabled components" ON "public"."enabled_components" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage component control" ON "public"."super_admin_component_control" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can manage tier permissions" ON "public"."tier_component_permissions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'super_admin'::"text")))));



CREATE POLICY "Super admins can update organizations" ON "public"."organizations" FOR UPDATE TO "authenticated" WITH CHECK (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'is_super_admin'::"text") = 'true'::"text"));



CREATE POLICY "Super admins can view all organizations" ON "public"."organizations" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'is_super_admin'::"text") = 'true'::"text"));



CREATE POLICY "Super admins can view all security audit logs" ON "public"."security_audit_logs" FOR SELECT USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'is_super_admin'::"text") = 'true'::"text"));



CREATE POLICY "Users can create memberships" ON "public"."organization_members" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can create organization pages" ON "public"."pages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "pages"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text"]))))));



CREATE POLICY "Users can create organizations" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can delete organization pages" ON "public"."pages" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "pages"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text"]))))));



CREATE POLICY "Users can insert their own security audit logs" ON "public"."security_audit_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update organization pages" ON "public"."pages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "pages"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text"]))))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view organization pages" ON "public"."pages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "pages"."organization_id") AND ("om"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view organizations they are members of" ON "public"."organizations" FOR SELECT USING ((("auth"."uid"() IN ( SELECT "organization_members"."user_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."organization_id" = "organizations"."id"))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their memberships" ON "public"."organization_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_super_admin"()));



CREATE POLICY "Users can view their org component permissions" ON "public"."component_permissions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their org contact forms" ON "public"."contact_forms" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "Users can view their org email config" ON "public"."email_configurations" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "Users can view their org email templates" ON "public"."email_templates" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "Users can view their org enabled components" ON "public"."enabled_components" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their org form fields" ON "public"."contact_form_fields" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."contact_forms" "cf"
  WHERE (("cf"."id" = "contact_form_fields"."form_id") AND "public"."is_member_of_org"("cf"."organization_id")))));



CREATE POLICY "Users can view their organization's site settings" ON "public"."site_settings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "site_settings"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own donations" ON "public"."donations" FOR SELECT USING (("donor_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own security audit logs" ON "public"."security_audit_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."church_info" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."component_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_form_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."donations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enabled_components" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submission_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funds" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "member_org_members_select_policy" ON "public"."organization_members" FOR SELECT USING ("public"."is_org_member"("organization_id"));



CREATE POLICY "member_org_select_policy" ON "public"."organizations" FOR SELECT USING ("public"."is_org_member"("id"));



CREATE POLICY "org_admin_all_policy" ON "public"."activities" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."attendance_records" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."donations" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."events" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."funds" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."payment_history" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."subscriptions" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_admin_all_policy" ON "public"."usage_metrics" USING ("public"."is_org_admin"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."activities" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."attendance_records" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."church_info" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."donations" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."events" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."funds" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."payment_history" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."subscriptions" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



CREATE POLICY "org_member_select_policy" ON "public"."usage_metrics" FOR SELECT USING ("public"."is_member_of_org"("organization_id"));



ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."security_audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_policy" ON "public"."activities" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."attendance_records" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."church_info" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."donations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."funds" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."payment_history" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."subscriptions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_policy" ON "public"."usage_metrics" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."super_admin_component_control" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "super_admin_member_policy" ON "public"."organization_members" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_org_policy" ON "public"."organizations" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."activities" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."attendance_records" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."church_info" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."donations" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."events" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."funds" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."payment_history" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."subscriptions" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_policy" ON "public"."usage_metrics" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "super_admin_self_view" ON "public"."super_admins" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "super_admin_users_policy" ON "public"."users" USING ("public"."is_super_admin"());



ALTER TABLE "public"."super_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tier_component_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_organization_creator_as_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_organization_creator_as_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_organization_creator_as_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_organization_enable_component"("org_id" "uuid", "comp_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_organization_enable_component"("org_id" "uuid", "comp_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_organization_enable_component"("org_id" "uuid", "comp_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_if_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_if_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_if_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_if_super_admin"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_if_super_admin"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_if_super_admin"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_subdomain_availability"("subdomain_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_subdomain_availability"("subdomain_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_subdomain_availability"("subdomain_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_super_admin_fixed"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_super_admin_fixed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_super_admin_fixed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_contact_form"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_contact_form"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_contact_form"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."direct_super_admin_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."direct_super_admin_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."direct_super_admin_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."exec_sql"("query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."exec_sql"("query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."exec_sql"("query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_claims"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_claims"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_claims"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_claims"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_organizations"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_organizations"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_organizations"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_roles"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_roles"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_roles"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_organizations_for_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_organizations_for_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_organizations_for_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_auth_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_auth_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_auth_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_components"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_components"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_components"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_enabled_church_components"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_enabled_church_components"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_enabled_church_components"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_admin_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_admin_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_admin_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_organization_available_components"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_organization_available_components"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organization_available_components"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_single_super_admin_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_single_super_admin_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_single_super_admin_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_super_admin_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_super_admin_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_super_admin_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_super_admin_status_fixed"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_super_admin_status_fixed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_super_admin_status_fixed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_claims"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_claims"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_claims"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organizations"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organizations"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_roles"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_roles"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_roles"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of_org"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of_org"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of_org"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_admin"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin_by_id"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin_direct"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin_direct"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin_direct"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rbac_fetch_user_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."rbac_fetch_user_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rbac_fetch_user_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rbac_get_user_claims"() TO "anon";
GRANT ALL ON FUNCTION "public"."rbac_get_user_claims"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rbac_get_user_claims"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rbac_get_user_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."rbac_get_user_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rbac_get_user_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rbac_get_user_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."rbac_get_user_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rbac_get_user_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rbac_is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."rbac_is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rbac_is_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_super_admin_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."safe_super_admin_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_super_admin_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_super_admin_check_for_user"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_new_organization"("org_name" "text", "org_subdomain" "text", "pastor_name" "text", "contact_email" "text", "contact_role" "text", "phone_number" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."setup_new_organization"("org_name" "text", "org_subdomain" "text", "pastor_name" "text", "contact_email" "text", "contact_role" "text", "phone_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_new_organization"("org_name" "text", "org_subdomain" "text", "pastor_name" "text", "contact_email" "text", "contact_role" "text", "phone_number" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."simple_get_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."simple_get_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."simple_get_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."simple_is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."simple_is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."simple_is_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."super_admin_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."super_admin_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."super_admin_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."super_admin_view_all_members"() TO "anon";
GRANT ALL ON FUNCTION "public"."super_admin_view_all_members"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."super_admin_view_all_members"() TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON FUNCTION "public"."super_admin_view_all_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."super_admin_view_all_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."super_admin_view_all_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_records" TO "anon";
GRANT ALL ON TABLE "public"."attendance_records" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_records" TO "service_role";



GRANT ALL ON TABLE "public"."church_info" TO "anon";
GRANT ALL ON TABLE "public"."church_info" TO "authenticated";
GRANT ALL ON TABLE "public"."church_info" TO "service_role";



GRANT ALL ON TABLE "public"."component_permissions" TO "anon";
GRANT ALL ON TABLE "public"."component_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."component_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."contact_form_fields" TO "anon";
GRANT ALL ON TABLE "public"."contact_form_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_form_fields" TO "service_role";



GRANT ALL ON TABLE "public"."contact_form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."contact_form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."contact_forms" TO "anon";
GRANT ALL ON TABLE "public"."contact_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_forms" TO "service_role";



GRANT ALL ON TABLE "public"."domains" TO "anon";
GRANT ALL ON TABLE "public"."domains" TO "authenticated";
GRANT ALL ON TABLE "public"."domains" TO "service_role";



GRANT ALL ON TABLE "public"."donations" TO "anon";
GRANT ALL ON TABLE "public"."donations" TO "authenticated";
GRANT ALL ON TABLE "public"."donations" TO "service_role";



GRANT ALL ON TABLE "public"."email_configurations" TO "anon";
GRANT ALL ON TABLE "public"."email_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."email_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."enabled_components" TO "anon";
GRANT ALL ON TABLE "public"."enabled_components" TO "authenticated";
GRANT ALL ON TABLE "public"."enabled_components" TO "service_role";



GRANT ALL ON TABLE "public"."event_categories" TO "anon";
GRANT ALL ON TABLE "public"."event_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."event_categories" TO "service_role";



GRANT ALL ON TABLE "public"."event_registrations" TO "anon";
GRANT ALL ON TABLE "public"."event_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."event_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."event_templates" TO "anon";
GRANT ALL ON TABLE "public"."event_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."event_templates" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."form_submission_attachments" TO "anon";
GRANT ALL ON TABLE "public"."form_submission_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submission_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."funds" TO "anon";
GRANT ALL ON TABLE "public"."funds" TO "authenticated";
GRANT ALL ON TABLE "public"."funds" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT ALL ON TABLE "public"."pages" TO "service_role";



GRANT ALL ON TABLE "public"."payment_history" TO "anon";
GRANT ALL ON TABLE "public"."payment_history" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_history" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."security_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."security_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."staff_members" TO "anon";
GRANT ALL ON TABLE "public"."staff_members" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_members" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_integrations" TO "anon";
GRANT ALL ON TABLE "public"."stripe_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_items" TO "anon";
GRANT ALL ON TABLE "public"."subscription_items" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_items" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_tiers" TO "anon";
GRANT ALL ON TABLE "public"."subscription_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."super_admin_component_control" TO "anon";
GRANT ALL ON TABLE "public"."super_admin_component_control" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admin_component_control" TO "service_role";



GRANT ALL ON TABLE "public"."super_admins" TO "anon";
GRANT ALL ON TABLE "public"."super_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admins" TO "service_role";



GRANT ALL ON TABLE "public"."tier_component_permissions" TO "anon";
GRANT ALL ON TABLE "public"."tier_component_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."tier_component_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."usage_metrics" TO "anon";
GRANT ALL ON TABLE "public"."usage_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
