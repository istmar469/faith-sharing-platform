-- Fix subdomain resolution by adding public access policy
-- This allows SubdomainMiddleware to resolve subdomains before authentication

-- Add policy to allow public subdomain resolution
CREATE POLICY "Public subdomain resolution" ON "public"."organizations" 
  FOR SELECT TO "anon", "authenticated" 
  USING (true);

-- Create a secure function for subdomain resolution
CREATE OR REPLACE FUNCTION "public"."resolve_subdomain_public"("subdomain_name" "text") 
RETURNS TABLE("id" "uuid", "name" "text", "website_enabled" boolean)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  -- Only return basic info needed for subdomain resolution
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.website_enabled
  FROM organizations o
  WHERE o.subdomain = subdomain_name
  AND o.website_enabled = true;
END;
$$;

COMMENT ON FUNCTION "public"."resolve_subdomain_public"("subdomain_name" "text") IS 'Safely resolves subdomain for public access'; 