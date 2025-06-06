-- Step 1: Identify duplicate test3 organizations
SELECT 
  id,
  name,
  subdomain,
  website_enabled,
  created_at,
  updated_at,
  -- Check if they have any associated data
  (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count,
  (SELECT COUNT(*) FROM pages WHERE organization_id = o.id) as page_count,
  (SELECT COUNT(*) FROM site_settings WHERE organization_id = o.id) as settings_count
FROM organizations o
WHERE subdomain = 'test3'
ORDER BY created_at ASC;

-- Step 2: Check for any site_settings conflicts
SELECT 
  ss.id as settings_id,
  ss.organization_id,
  o.name as org_name,
  o.subdomain,
  ss.site_title,
  ss.created_at as settings_created
FROM site_settings ss
JOIN organizations o ON ss.organization_id = o.id
WHERE o.subdomain = 'test3'
ORDER BY ss.created_at ASC;

-- Step 3: Check for organization members
SELECT 
  om.id as member_id,
  om.organization_id,
  o.name as org_name,
  om.role,
  u.email as user_email,
  om.created_at as member_since
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
JOIN auth.users u ON om.user_id = u.id
WHERE o.subdomain = 'test3'
ORDER BY om.created_at ASC;

-- Step 4: Check for pages
SELECT 
  p.id as page_id,
  p.organization_id,
  o.name as org_name,
  p.title,
  p.slug,
  p.is_homepage,
  p.published,
  p.created_at as page_created
FROM pages p
JOIN organizations o ON p.organization_id = o.id
WHERE o.subdomain = 'test3'
ORDER BY p.created_at ASC; 