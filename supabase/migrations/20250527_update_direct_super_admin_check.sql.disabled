
-- Update the direct_super_admin_check function to use the organization_members table
-- instead of super_admins table for checking super admin privileges
CREATE OR REPLACE FUNCTION public.direct_super_admin_check()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$function$;

-- Add a comment to the function
COMMENT ON FUNCTION public.direct_super_admin_check() IS 'Checks if current user has super_admin role in organization_members table';
