-- Unified Super Admin Check System
-- This migration consolidates all super admin checks into one reliable function

-- 1. Drop all the conflicting functions (keeping only the essential ones)
DROP FUNCTION IF EXISTS "public"."check_super_admin"();
DROP FUNCTION IF EXISTS "public"."check_super_admin_fixed"();
DROP FUNCTION IF EXISTS "public"."get_single_super_admin_status"();
DROP FUNCTION IF EXISTS "public"."get_super_admin_status"();
DROP FUNCTION IF EXISTS "public"."get_super_admin_status_fixed"();
DROP FUNCTION IF EXISTS "public"."is_super_admin_by_id"(uuid);
DROP FUNCTION IF EXISTS "public"."is_super_admin_direct"();
DROP FUNCTION IF EXISTS "public"."safe_super_admin_check"();
DROP FUNCTION IF EXISTS "public"."safe_super_admin_check_for_user"(uuid);
DROP FUNCTION IF EXISTS "public"."simple_is_super_admin"();
DROP FUNCTION IF EXISTS "public"."super_admin_status"();

-- 2. Create the ONE TRUE super admin check function
CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Check both tables for maximum compatibility during transition
  SELECT EXISTS (
    -- Primary check: super_admins table (newer, more secure)
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  ) OR EXISTS (
    -- Fallback check: organization_members table (legacy)
    SELECT 1 FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- 3. Create the parameterized version for checking other users
CREATE OR REPLACE FUNCTION "public"."is_super_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Check both tables for maximum compatibility during transition
  SELECT EXISTS (
    -- Primary check: super_admins table (newer, more secure)
    SELECT 1 FROM super_admins WHERE user_id = $1
  ) OR EXISTS (
    -- Fallback check: organization_members table (legacy)
    SELECT 1 FROM organization_members 
    WHERE user_id = $1 AND role = 'super_admin'
  );
$$;

-- 4. Update direct_super_admin_check to use the unified function
CREATE OR REPLACE FUNCTION "public"."direct_super_admin_check"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.is_super_admin();
$$;

-- 5. Update get_my_admin_status to use the unified function
CREATE OR REPLACE FUNCTION "public"."get_my_admin_status"() RETURNS TABLE("is_super_admin" boolean)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.is_super_admin() AS is_super_admin;
$$;

-- 6. Add comments for clarity
COMMENT ON FUNCTION "public"."is_super_admin"() IS 'THE SINGLE SOURCE OF TRUTH for super admin checks. Checks both super_admins table (primary) and organization_members table (fallback).';
COMMENT ON FUNCTION "public"."is_super_admin"("user_id" "uuid") IS 'THE SINGLE SOURCE OF TRUTH for super admin checks with user parameter. Checks both super_admins table (primary) and organization_members table (fallback).';
COMMENT ON FUNCTION "public"."direct_super_admin_check"() IS 'Legacy function maintained for compatibility. Uses is_super_admin() internally.';
COMMENT ON FUNCTION "public"."get_my_admin_status"() IS 'Legacy function maintained for compatibility. Uses is_super_admin() internally.'; 