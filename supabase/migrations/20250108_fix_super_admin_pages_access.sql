-- Add super admin policies for pages table
-- Super admins should be able to create, read, update, delete pages for any organization

-- Super admin can view all pages
CREATE POLICY "Super admins can view all pages" ON "public"."pages"
FOR SELECT TO "authenticated" 
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

-- Super admin can create pages for any organization
CREATE POLICY "Super admins can create pages for any organization" ON "public"."pages"
FOR INSERT TO "authenticated"
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

-- Super admin can update any pages
CREATE POLICY "Super admins can update any pages" ON "public"."pages"
FOR UPDATE TO "authenticated"
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
);

-- Super admin can delete any pages  
CREATE POLICY "Super admins can delete any pages" ON "public"."pages"
FOR DELETE TO "authenticated"
USING (
  EXISTS (
    SELECT 1 FROM "public"."super_admins" 
    WHERE "super_admins"."user_id" = "auth"."uid"()
  )
); 