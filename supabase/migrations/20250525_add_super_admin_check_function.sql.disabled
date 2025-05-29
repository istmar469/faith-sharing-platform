
-- Create a stable RPC function to check super admin status
-- This function is designed to be fast and reliable
CREATE OR REPLACE FUNCTION public.check_super_admin()
 RETURNS TABLE(is_super_admin boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Return a single row with the super admin status
  RETURN QUERY 
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) AS is_super_admin;
END;
$function$;

-- Create a fast, direct check function that returns just a boolean
-- This serves as a backup method
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
