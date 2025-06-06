-- Fix infinite loop trigger issue
-- The add_organization_creator_as_admin function was causing an infinite loop
-- because it tries to INSERT into organizations table when triggered by INSERT on organizations

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS add_creator_as_admin_trigger ON organizations;

-- Drop the problematic function
DROP FUNCTION IF EXISTS add_organization_creator_as_admin();

-- Create a proper function that doesn't cause infinite loops
-- This function should be used when creating users, not organizations
CREATE OR REPLACE FUNCTION add_user_to_organization_as_admin(user_id uuid, org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Add the user as an org_admin of the organization
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_id, user_id, 'org_admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'org_admin';
END;
$$; 