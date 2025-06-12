-- Add super admin override policies for pages table
-- This fixes the 403 Forbidden errors when super admins try to create/edit pages

DROP POLICY IF EXISTS "super_admins_can_insert_pages" ON pages;
DROP POLICY IF EXISTS "super_admins_can_update_pages" ON pages;

-- Policy for INSERT operations with super admin override
CREATE POLICY "super_admins_can_insert_pages" ON pages
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (removed status field as it doesn't exist)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
);

-- Policy for UPDATE operations with super admin override
CREATE POLICY "super_admins_can_update_pages" ON pages
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (removed status field as it doesn't exist)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Regular organization member check (removed status field as it doesn't exist)
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid() 
      AND om.organization_id = organization_id
    )
    OR
    -- Super admin override check
    EXISTS (
      SELECT 1 FROM super_admins sa
      WHERE sa.user_id = auth.uid()
    )
  )
); 