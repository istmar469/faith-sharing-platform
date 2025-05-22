
-- Create an updated version of the direct_super_admin_check function
-- that looks for either 'super_admin' or 'admin' roles
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
    AND role IN ('super_admin', 'admin') -- Check for either super_admin or admin roles
  );
$function$;

-- For clarity, add a function to check what roles the current user has
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
 RETURNS TABLE(role text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM organization_members
  WHERE user_id = auth.uid();
$function$;
