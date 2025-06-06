-- Consolidate duplicate test3 organizations
-- This script will merge duplicates into the oldest/most active organization

-- First, let's identify which organization to keep (usually the one with the most data)
WITH test3_orgs AS (
  SELECT 
    o.id,
    o.name,
    o.created_at,
    o.website_enabled,
    COALESCE((SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id), 0) as member_count,
    COALESCE((SELECT COUNT(*) FROM pages WHERE organization_id = o.id), 0) as page_count,
    COALESCE((SELECT COUNT(*) FROM site_settings WHERE organization_id = o.id), 0) as settings_count,
    -- Calculate priority score (more data = higher priority)
    (COALESCE((SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id), 0) * 10 +
     COALESCE((SELECT COUNT(*) FROM pages WHERE organization_id = o.id), 0) * 5 +
     COALESCE((SELECT COUNT(*) FROM site_settings WHERE organization_id = o.id), 0) * 3) as priority_score
  FROM organizations o
  WHERE subdomain = 'test3'
),
keep_org AS (
  SELECT id as keep_id
  FROM test3_orgs
  ORDER BY priority_score DESC, created_at ASC
  LIMIT 1
),
remove_orgs AS (
  SELECT id as remove_id
  FROM test3_orgs
  WHERE id NOT IN (SELECT keep_id FROM keep_org)
)

-- Show what we're planning to do
SELECT 
  'KEEP' as action,
  o.id,
  o.name,
  o.created_at,
  t.member_count,
  t.page_count,
  t.settings_count,
  t.priority_score
FROM test3_orgs t
JOIN organizations o ON t.id = o.id
WHERE t.id IN (SELECT keep_id FROM keep_org)

UNION ALL

SELECT 
  'REMOVE' as action,
  o.id,
  o.name,
  o.created_at,
  t.member_count,
  t.page_count,
  t.settings_count,
  t.priority_score
FROM test3_orgs t
JOIN organizations o ON t.id = o.id
WHERE t.id IN (SELECT remove_id FROM remove_orgs)
ORDER BY action DESC, priority_score DESC;

-- Now let's do the actual consolidation
-- WARNING: Run the SELECT above first to verify which org will be kept!

-- Step 1: Identify the organizations to keep and remove
DO $$
DECLARE
    keep_org_id UUID;
    remove_org_id UUID;
    org_cursor CURSOR FOR 
        WITH test3_orgs AS (
          SELECT 
            o.id,
            (COALESCE((SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id), 0) * 10 +
             COALESCE((SELECT COUNT(*) FROM pages WHERE organization_id = o.id), 0) * 5 +
             COALESCE((SELECT COUNT(*) FROM site_settings WHERE organization_id = o.id), 0) * 3) as priority_score
          FROM organizations o
          WHERE subdomain = 'test3'
        )
        SELECT id, priority_score
        FROM test3_orgs
        ORDER BY priority_score DESC, id;
    org_count INTEGER := 0;
BEGIN
    -- Get the organization to keep (highest priority)
    OPEN org_cursor;
    FETCH org_cursor INTO keep_org_id;
    org_count := 1;
    
    RAISE NOTICE 'Keeping organization: %', keep_org_id;
    
    -- Process remaining organizations (to be removed/merged)
    LOOP
        FETCH org_cursor INTO remove_org_id;
        EXIT WHEN NOT FOUND;
        
        org_count := org_count + 1;
        RAISE NOTICE 'Processing duplicate organization: %', remove_org_id;
        
        -- Move organization members to the keep organization
        UPDATE organization_members 
        SET organization_id = keep_org_id 
        WHERE organization_id = remove_org_id
        AND NOT EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = keep_org_id 
            AND user_id = organization_members.user_id
        );
        
        -- Delete duplicate members (if user is already in keep org)
        DELETE FROM organization_members 
        WHERE organization_id = remove_org_id;
        
        -- Move pages to the keep organization
        UPDATE pages 
        SET organization_id = keep_org_id 
        WHERE organization_id = remove_org_id;
        
        -- Move site settings to the keep organization (if keep org doesn't have settings)
        UPDATE site_settings 
        SET organization_id = keep_org_id 
        WHERE organization_id = remove_org_id
        AND NOT EXISTS (
            SELECT 1 FROM site_settings 
            WHERE organization_id = keep_org_id
        );
        
        -- Delete duplicate site settings
        DELETE FROM site_settings 
        WHERE organization_id = remove_org_id;
        
        -- Move any other related data
        -- Add more UPDATE statements here for other tables as needed
        
        -- Finally, delete the duplicate organization
        DELETE FROM organizations WHERE id = remove_org_id;
        
        RAISE NOTICE 'Removed duplicate organization: %', remove_org_id;
    END LOOP;
    
    CLOSE org_cursor;
    
    RAISE NOTICE 'Consolidation complete. Processed % organizations, kept 1.', org_count;
END $$;

-- Verify the consolidation worked
SELECT 
  'AFTER CONSOLIDATION' as status,
  COUNT(*) as test3_org_count
FROM organizations 
WHERE subdomain = 'test3';

-- Show the final organization details
SELECT 
  o.id,
  o.name,
  o.subdomain,
  o.website_enabled,
  o.created_at,
  (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
  (SELECT COUNT(*) FROM pages WHERE organization_id = o.id) as page_count,
  (SELECT COUNT(*) FROM site_settings WHERE organization_id = o.id) as settings_count
FROM organizations o
WHERE subdomain = 'test3'; 