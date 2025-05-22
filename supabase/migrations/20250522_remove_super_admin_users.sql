
-- First, verify data has been migrated from super_admin_users to super_admins
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  -- Check if all users in super_admin_users are also in super_admins
  SELECT COUNT(*) INTO missing_count
  FROM super_admin_users sau
  LEFT JOIN super_admins sa ON sa.user_id = sau.user_id
  WHERE sa.user_id IS NULL;
  
  -- If there are missing users, raise an exception
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Data migration incomplete: % users in super_admin_users are not in super_admins', missing_count;
  END IF;
END $$;

-- Check for any remaining dependencies on super_admin_users
DO $$
DECLARE
  dep_count INTEGER;
  dep_objects TEXT;
BEGIN
  -- Check for foreign key constraints
  SELECT COUNT(*) INTO dep_count
  FROM information_schema.table_constraints AS tc 
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'super_admin_users'
    AND ccu.table_schema = 'public';
    
  -- Check for functions that reference super_admin_users
  SELECT string_agg(proname, ', ') INTO dep_objects
  FROM pg_proc 
  WHERE prosrc LIKE '%super_admin_users%'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
  -- If there are dependencies, raise an exception
  IF dep_count > 0 OR dep_objects IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot drop super_admin_users - dependencies exist: Foreign keys: %, Functions: %', dep_count, dep_objects;
  END IF;
END $$;

-- If we got here, it's safe to drop the table
DROP TABLE IF EXISTS public.super_admin_users;

-- Add a comment to confirm the cleanup
COMMENT ON TABLE public.super_admins IS 'Sole source of super admin status (super_admin_users table removed)';
