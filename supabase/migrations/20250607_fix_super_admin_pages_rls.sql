-- Fix super admin RLS policies for pages table
-- Issue: Current policies don't allow super admins to create pages

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Super admins can view all pages" ON "public"."pages";
DROP POLICY IF EXISTS "Super admins can create pages for any organization" ON "public"."pages";
DROP POLICY IF EXISTS "Super admins can update any pages" ON "public"."pages";
DROP POLICY IF EXISTS "Super admins can delete any pages" ON "public"."pages";

-- Create new policies that properly check the super_admins table
CREATE POLICY "Super admins can view all pages" ON "public"."pages"
FOR SELECT TO "authenticated" 
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

CREATE POLICY "Super admins can create pages for any organization" ON "public"."pages"
FOR INSERT TO "authenticated"
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

CREATE POLICY "Super admins can update any pages" ON "public"."pages"
FOR UPDATE TO "authenticated"
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

CREATE POLICY "Super admins can delete any pages" ON "public"."pages"
FOR DELETE TO "authenticated"
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

-- Fix the display_order column issue by making it have a default value
-- This prevents the NOT NULL constraint error when creating pages
ALTER TABLE "public"."pages" 
ALTER COLUMN "display_order" 
SET DEFAULT 1;

-- Add a comment explaining the policies
COMMENT ON POLICY "Super admins can create pages for any organization" ON "public"."pages" 
IS 'Allows users in super_admins table to create pages for any organization'; 