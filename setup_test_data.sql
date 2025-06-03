-- Setup test data for local development
-- This script creates a test user, organization, and organization membership

-- Create super admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@example.com',
  '$2a$10$0cKw5y91r7EK.b.n6mANdu5ZKV1QJ7xJ4YuHdkD/tQ7FxGF5Tg0Ya', -- password: 'password123'
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"],"is_super_admin":true}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
  'authenticated',
  'authenticated',
  'test@example.com',
  '$2a$10$0cKw5y91r7EK.b.n6mANdu5ZKV1QJ7xJ4YuHdkD/tQ7FxGF5Tg0Ya', -- password: 'password123'
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Create test organization
INSERT INTO organizations (
  id,
  name,
  slug,
  subdomain,
  custom_domain,
  created_at
) VALUES (
  'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
  'Test Organization',
  'test-org',
  'test',
  NULL,
  NOW()
);

-- Create organization membership
INSERT INTO organization_members (
  id,
  organization_id,
  user_id,
  role,
  created_at
) VALUES (
  gen_random_uuid(),
  'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
  'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
  'owner',
  NOW()
);

-- Create a test page
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  organization_id,
  published,
  show_in_navigation,
  is_homepage,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Home Page Test',
  'home-page-test',
  '{"content":[],"root":{}}',
  'df5b8196-7bc4-44fd-b3cb-e559f67c2f84',
  false,
  true,
  true,
  NOW(),
  NOW()
); 