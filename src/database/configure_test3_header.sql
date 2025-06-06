-- Configure Test3 Organization Header
-- This will update the existing header system with proper navigation and settings

UPDATE site_settings 
SET 
  site_title = 'Test3 Organization',
  header_config = jsonb_build_object(
    'show_header', true,
    'show_navigation', true,
    'show_search', false,
    'background_color', '#ffffff',
    'text_color', '#1f2937',
    'navigation', jsonb_build_array(
      jsonb_build_object(
        'id', '1',
        'label', 'Home',
        'url', '/',
        'target', '_self',
        'order', 1
      ),
      jsonb_build_object(
        'id', '2',
        'label', 'About',
        'url', '/about',
        'target', '_self',
        'order', 2
      ),
      jsonb_build_object(
        'id', '3',
        'label', 'Services',
        'url', '/services',
        'target', '_self',
        'order', 3
      ),
      jsonb_build_object(
        'id', '4',
        'label', 'Events',
        'url', '/events',
        'target', '_self',
        'order', 4
      ),
      jsonb_build_object(
        'id', '5',
        'label', 'Contact',
        'url', '/contact',
        'target', '_self',
        'order', 5
      )
    )
  ),
  footer_config = jsonb_build_object(
    'show_footer', true,
    'background_color', '#f8f9fa',
    'text_color', '#6b7280',
    'text', 'Join us for worship, fellowship, and growing in faith together.',
    'copyright_text', '© 2024 Test3 Organization. All rights reserved.',
    'links', jsonb_build_array(
      jsonb_build_object(
        'id', '1',
        'label', 'Privacy Policy',
        'url', '/privacy'
      ),
      jsonb_build_object(
        'id', '2',
        'label', 'Terms of Service',
        'url', '/terms'
      )
    ),
    'social_media', jsonb_build_object(
      'facebook', 'https://facebook.com/test3organization',
      'instagram', 'https://instagram.com/test3org',
      'youtube', 'https://youtube.com/@test3org',
      'email', 'contact@test3.church-os.com'
    )
  )
WHERE organization_id = (
  SELECT id FROM organizations WHERE subdomain = 'test3' LIMIT 1
);

-- If no site_settings record exists, create one
INSERT INTO site_settings (organization_id, site_title, header_config, footer_config)
SELECT 
  o.id,
  'Test3 Organization',
  jsonb_build_object(
    'show_header', true,
    'show_navigation', true,
    'show_search', false,
    'background_color', '#ffffff',
    'text_color', '#1f2937',
    'navigation', jsonb_build_array(
      jsonb_build_object('id', '1', 'label', 'Home', 'url', '/', 'target', '_self', 'order', 1),
      jsonb_build_object('id', '2', 'label', 'About', 'url', '/about', 'target', '_self', 'order', 2),
      jsonb_build_object('id', '3', 'label', 'Services', 'url', '/services', 'target', '_self', 'order', 3),
      jsonb_build_object('id', '4', 'label', 'Events', 'url', '/events', 'target', '_self', 'order', 4),
      jsonb_build_object('id', '5', 'label', 'Contact', 'url', '/contact', 'target', '_self', 'order', 5)
    )
  ),
  jsonb_build_object(
    'show_footer', true,
    'background_color', '#f8f9fa',
    'text_color', '#6b7280',
    'text', 'Join us for worship, fellowship, and growing in faith together.',
    'copyright_text', '© 2024 Test3 Organization. All rights reserved.',
    'social_media', jsonb_build_object(
      'facebook', 'https://facebook.com/test3organization',
      'instagram', 'https://instagram.com/test3org',
      'youtube', 'https://youtube.com/@test3org',
      'email', 'contact@test3.church-os.com'
    )
  )
FROM organizations o
WHERE o.subdomain = 'test3'
AND NOT EXISTS (
  SELECT 1 FROM site_settings WHERE organization_id = o.id
);

-- Verify the configuration
SELECT 
  o.name as organization_name,
  o.subdomain,
  ss.site_title,
  ss.header_config,
  ss.footer_config
FROM organizations o
LEFT JOIN site_settings ss ON o.id = ss.organization_id
WHERE o.subdomain = 'test3'; 