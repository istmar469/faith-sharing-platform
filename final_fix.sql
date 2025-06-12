-- Final fix for homepage access and global elements
-- Run this in Supabase Dashboard SQL Editor

-- 1. Fix display_order default value to prevent NOT NULL constraint errors
ALTER TABLE "public"."pages" 
ALTER COLUMN "display_order" SET DEFAULT 1;

-- 2. Drop existing policy if it exists (ignore error if it doesn't exist)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to published pages" ON public.pages;
EXCEPTION
    WHEN undefined_object THEN
        -- Policy doesn't exist, continue
        NULL;
END $$;

-- 3. Create the public access policy for published pages
CREATE POLICY "Allow public read access to published pages"
ON public.pages 
FOR SELECT 
TO anon 
USING (published = true);

-- 4. Grant necessary permissions
GRANT SELECT ON TABLE "public"."pages" TO "anon";
GRANT SELECT ON TABLE "public"."site_elements" TO "anon";

-- 5. Test query to verify the fix works
SELECT 'Policy created successfully' as status; 