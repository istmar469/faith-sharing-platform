-- Page versioning system migration
-- This adds version tracking and history to pages for better content management

-- Create page_versions table
CREATE TABLE IF NOT EXISTS "public"."page_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "content" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "meta_title" "text",
    "meta_description" "text",
    "created_by" "uuid", -- User who created this version
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "change_description" "text", -- Optional description of what changed
    "is_major_version" boolean DEFAULT false, -- Track major vs minor versions
    "published_at" timestamp with time zone, -- When this version was published (if ever)
    PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_page_versions_page_id" ON "public"."page_versions"("page_id");
CREATE INDEX IF NOT EXISTS "idx_page_versions_version_number" ON "public"."page_versions"("page_id", "version_number" DESC);
CREATE INDEX IF NOT EXISTS "idx_page_versions_created_at" ON "public"."page_versions"("created_at" DESC);

-- Add unique constraint for version numbers per page
ALTER TABLE "public"."page_versions" 
ADD CONSTRAINT "unique_page_version" UNIQUE ("page_id", "version_number");

-- Add foreign key constraints
ALTER TABLE "public"."page_versions"
ADD CONSTRAINT "page_versions_page_id_fkey" 
FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE CASCADE;

ALTER TABLE "public"."page_versions"
ADD CONSTRAINT "page_versions_created_by_fkey" 
FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

-- Add version tracking fields to pages table
ALTER TABLE "public"."pages" 
ADD COLUMN IF NOT EXISTS "current_version" integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS "published_version" integer,
ADD COLUMN IF NOT EXISTS "draft_version" integer;

-- Function to create a new page version
CREATE OR REPLACE FUNCTION "public"."create_page_version"(
    "target_page_id" "uuid",
    "new_title" "text",
    "new_content" "jsonb",
    "new_meta_title" "text" DEFAULT NULL,
    "new_meta_description" "text" DEFAULT NULL,
    "change_desc" "text" DEFAULT NULL,
    "is_major" boolean DEFAULT false
) RETURNS integer AS $$
DECLARE
    next_version integer;
    user_id uuid;
BEGIN
    -- Get the current user
    user_id := auth.uid();
    
    -- Get the next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version
    FROM page_versions 
    WHERE page_id = target_page_id;
    
    -- Insert the new version
    INSERT INTO page_versions (
        page_id,
        version_number,
        title,
        content,
        meta_title,
        meta_description,
        created_by,
        change_description,
        is_major_version
    ) VALUES (
        target_page_id,
        next_version,
        new_title,
        new_content,
        new_meta_title,
        new_meta_description,
        user_id,
        change_desc,
        is_major
    );
    
    -- Update the current version in pages table
    UPDATE pages 
    SET 
        current_version = next_version,
        draft_version = next_version,
        updated_at = now()
    WHERE id = target_page_id;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revert to a specific version
CREATE OR REPLACE FUNCTION "public"."revert_to_page_version"(
    "target_page_id" "uuid",
    "target_version" integer
) RETURNS boolean AS $$
DECLARE
    version_data record;
    new_version_number integer;
BEGIN
    -- Get the version data
    SELECT * INTO version_data
    FROM page_versions 
    WHERE page_id = target_page_id AND version_number = target_version;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Create a new version based on the target version
    SELECT create_page_version(
        target_page_id,
        version_data.title,
        version_data.content,
        version_data.meta_title,
        version_data.meta_description,
        'Reverted to version ' || target_version,
        true
    ) INTO new_version_number;
    
    -- Update the main page record
    UPDATE pages 
    SET 
        title = version_data.title,
        content = version_data.content,
        meta_title = version_data.meta_title,
        meta_description = version_data.meta_description,
        current_version = new_version_number,
        draft_version = new_version_number,
        updated_at = now()
    WHERE id = target_page_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish a specific version
CREATE OR REPLACE FUNCTION "public"."publish_page_version"(
    "target_page_id" "uuid",
    "target_version" integer DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
    version_to_publish integer;
BEGIN
    -- Use current version if no specific version provided
    IF target_version IS NULL THEN
        SELECT current_version INTO version_to_publish
        FROM pages WHERE id = target_page_id;
    ELSE
        version_to_publish := target_version;
    END IF;
    
    -- Verify the version exists
    IF NOT EXISTS (
        SELECT 1 FROM page_versions 
        WHERE page_id = target_page_id AND version_number = version_to_publish
    ) THEN
        RETURN false;
    END IF;
    
    -- Update the published version
    UPDATE pages 
    SET 
        published_version = version_to_publish,
        published = true,
        updated_at = now()
    WHERE id = target_page_id;
    
    -- Mark the version as published
    UPDATE page_versions
    SET published_at = now()
    WHERE page_id = target_page_id AND version_number = version_to_publish;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get page version history
CREATE OR REPLACE FUNCTION "public"."get_page_version_history"(
    "target_page_id" "uuid"
) RETURNS TABLE(
    version_number integer,
    title text,
    created_at timestamp with time zone,
    created_by_email text,
    change_description text,
    is_major_version boolean,
    is_published boolean,
    is_current boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.version_number,
        pv.title,
        pv.created_at,
        COALESCE(p.email, 'Unknown User') as created_by_email,
        pv.change_description,
        pv.is_major_version,
        (pv.published_at IS NOT NULL) as is_published,
        (pv.version_number = (SELECT current_version FROM pages WHERE id = target_page_id)) as is_current
    FROM page_versions pv
    LEFT JOIN auth.users au ON pv.created_by = au.id
    LEFT JOIN profiles p ON au.id = p.id
    WHERE pv.page_id = target_page_id
    ORDER BY pv.version_number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create initial version when page is created
CREATE OR REPLACE FUNCTION "public"."create_initial_page_version"()
RETURNS TRIGGER AS $$
BEGIN
    -- Create initial version
    PERFORM create_page_version(
        NEW.id,
        NEW.title,
        NEW.content,
        NEW.meta_title,
        NEW.meta_description,
        'Initial version',
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new pages
DROP TRIGGER IF EXISTS "trigger_create_initial_page_version" ON "public"."pages";
CREATE TRIGGER "trigger_create_initial_page_version"
    AFTER INSERT ON "public"."pages"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."create_initial_page_version"();

-- Set up RLS policies for page_versions
ALTER TABLE "public"."page_versions" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view versions of pages in their organizations
CREATE POLICY "org_member_select_page_versions" ON "public"."page_versions"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pages p
        WHERE p.id = page_versions.page_id
        AND public.is_member_of_org(p.organization_id)
    )
);

-- Policy: Users can create versions for pages in organizations they're members of
CREATE POLICY "org_member_insert_page_versions" ON "public"."page_versions"
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM pages p
        WHERE p.id = page_versions.page_id
        AND public.is_member_of_org(p.organization_id)
    )
);

-- Policy: Super admins can do everything
CREATE POLICY "super_admin_all_page_versions" ON "public"."page_versions"
TO "authenticated" USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Grant permissions
GRANT ALL ON TABLE "public"."page_versions" TO "anon";
GRANT ALL ON TABLE "public"."page_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_versions" TO "service_role";

-- Create indexes for the new pages columns
CREATE INDEX IF NOT EXISTS "idx_pages_current_version" ON "public"."pages"("current_version");
CREATE INDEX IF NOT EXISTS "idx_pages_published_version" ON "public"."pages"("published_version");
CREATE INDEX IF NOT EXISTS "idx_pages_draft_version" ON "public"."pages"("draft_version");

COMMENT ON TABLE "public"."page_versions" IS 'Stores version history for pages with automatic versioning';
COMMENT ON FUNCTION "public"."create_page_version" IS 'Creates a new version of a page and updates tracking';
COMMENT ON FUNCTION "public"."revert_to_page_version" IS 'Reverts a page to a specific version by creating a new version';
COMMENT ON FUNCTION "public"."publish_page_version" IS 'Publishes a specific version of a page';
COMMENT ON FUNCTION "public"."get_page_version_history" IS 'Returns version history for a page with user details'; 