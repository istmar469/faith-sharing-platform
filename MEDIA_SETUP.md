# Media Management System Setup

## 🎯 Overview
This setup will add:
- **Image Upload & Management** (up to 250 images per organization)
- **Video Upload & Management** (up to 10 minutes total per organization)
- **Unsplash Integration** (free stock photos)
- **Quota Management** (automatic tracking)
- **File Storage** (Supabase Storage bucket)

## 📋 Manual Setup Instructions

### Step 1: Create Database Tables

Go to your **Supabase Dashboard → SQL Editor** and run this SQL:

```sql
-- Create media management tables for images and videos with quota tracking

-- Media files table
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase storage
    file_type TEXT NOT NULL, -- 'image' or 'video'
    file_size BIGINT NOT NULL, -- Size in bytes
    mime_type TEXT NOT NULL,
    width INTEGER, -- For images/videos
    height INTEGER, -- For images/videos
    duration INTEGER, -- For videos (in seconds)
    alt_text TEXT, -- For accessibility
    caption TEXT,
    tags TEXT[], -- Array of tags for searching
    source_type TEXT NOT NULL DEFAULT 'upload', -- 'upload', 'unsplash', 'external'
    source_url TEXT, -- Original source URL for external images
    source_id TEXT, -- External service ID (like Unsplash photo ID)
    thumbnail_path TEXT, -- Thumbnail version for videos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Media usage quotas per organization
CREATE TABLE IF NOT EXISTS public.media_quotas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    image_count INTEGER DEFAULT 0,
    image_limit INTEGER DEFAULT 250,
    video_duration_seconds INTEGER DEFAULT 0, -- Total video duration in seconds
    video_duration_limit_seconds INTEGER DEFAULT 600, -- 10 minutes = 600 seconds
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_organization_id ON public.media_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON public.media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_source_type ON public.media_files(source_type);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON public.media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files(created_at DESC);

-- Enable RLS
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_quotas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for media_files
CREATE POLICY "Users can view media files from their organization" ON public.media_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_files.organization_id 
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert media files to their organization" ON public.media_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_files.organization_id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'editor')
        )
    );

CREATE POLICY "Users can update media files in their organization" ON public.media_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_files.organization_id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'editor')
        )
    );

CREATE POLICY "Users can delete media files from their organization" ON public.media_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_files.organization_id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin', 'editor')
        )
    );

-- Create RLS policies for media_quotas
CREATE POLICY "Users can view quotas for their organization" ON public.media_quotas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_quotas.organization_id 
            AND organization_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update quotas for their organization" ON public.media_quotas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_members.organization_id = media_quotas.organization_id 
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Function to update media quotas when files are added/removed
CREATE OR REPLACE FUNCTION update_media_quotas()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert or update quota record
        INSERT INTO public.media_quotas (organization_id, image_count, video_duration_seconds, storage_used_bytes)
        VALUES (
            NEW.organization_id,
            CASE WHEN NEW.file_type = 'image' THEN 1 ELSE 0 END,
            CASE WHEN NEW.file_type = 'video' THEN COALESCE(NEW.duration, 0) ELSE 0 END,
            NEW.file_size
        )
        ON CONFLICT (organization_id) DO UPDATE SET
            image_count = media_quotas.image_count + CASE WHEN NEW.file_type = 'image' THEN 1 ELSE 0 END,
            video_duration_seconds = media_quotas.video_duration_seconds + CASE WHEN NEW.file_type = 'video' THEN COALESCE(NEW.duration, 0) ELSE 0 END,
            storage_used_bytes = media_quotas.storage_used_bytes + NEW.file_size,
            updated_at = NOW();
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update quota record
        UPDATE public.media_quotas SET
            image_count = GREATEST(0, image_count - CASE WHEN OLD.file_type = 'image' THEN 1 ELSE 0 END),
            video_duration_seconds = GREATEST(0, video_duration_seconds - CASE WHEN OLD.file_type = 'video' THEN COALESCE(OLD.duration, 0) ELSE 0 END),
            storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size),
            updated_at = NOW()
        WHERE organization_id = OLD.organization_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quota updates
DROP TRIGGER IF EXISTS trigger_update_media_quotas ON public.media_files;
CREATE TRIGGER trigger_update_media_quotas
    AFTER INSERT OR DELETE ON public.media_files
    FOR EACH ROW EXECUTE FUNCTION update_media_quotas();

-- Function to check quota before file upload
CREATE OR REPLACE FUNCTION check_media_quota(
    org_id UUID,
    file_type_param TEXT,
    file_size_param BIGINT,
    duration_param INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    current_quota public.media_quotas%ROWTYPE;
BEGIN
    -- Get current quota or create if doesn't exist
    SELECT * INTO current_quota FROM public.media_quotas WHERE organization_id = org_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.media_quotas (organization_id) VALUES (org_id)
        RETURNING * INTO current_quota;
    END IF;
    
    -- Check limits
    IF file_type_param = 'image' AND current_quota.image_count >= current_quota.image_limit THEN
        RETURN FALSE;
    END IF;
    
    IF file_type_param = 'video' AND (current_quota.video_duration_seconds + duration_param) > current_quota.video_duration_limit_seconds THEN
        RETURN FALSE;
    END IF;
    
    IF (current_quota.storage_used_bytes + file_size_param) > current_quota.storage_limit_bytes THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for media_files
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON public.media_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_quotas_updated_at
    BEFORE UPDATE ON public.media_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Create Storage Bucket

Go to **Supabase Dashboard → Storage** and create a new bucket:

1. Click **"Create a new bucket"**
2. **Bucket name**: `media`
3. **Public bucket**: ✅ Enable
4. Click **"Save"**

### Step 3: Set Storage Policies

Go to **Storage → Policies** and add these policies for the `media` bucket:

**Policy 1 - Allow authenticated users to upload:**
```sql
CREATE POLICY "Allow authenticated users to upload media files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media');
```

**Policy 2 - Allow users to view media files:**
```sql
CREATE POLICY "Allow users to view media files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'media');
```

**Policy 3 - Allow users to delete their organization's files:**
```sql
CREATE POLICY "Allow users to delete organization media files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM organization_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'editor')
  )
);
```

### Step 4: Add Unsplash API Key (Optional)

To enable Unsplash integration, add your Unsplash Access Key to your environment variables:

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your **Access Key**
4. Add to your `.env` file:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

### Step 5: Generate TypeScript Types

Run this command to update your Supabase types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## ✅ Verification

After setup, you should be able to:

1. **Upload images and videos** through the page builder
2. **Search Unsplash** for free stock photos
3. **View quota usage** (250 images, 10 minutes of video per organization)
4. **Manage media files** (edit, delete, copy URLs)
5. **Use media in page components** (enhanced Image component)

## 🎛️ Quota Configuration

Default quotas per organization:
- **Images**: 250 files
- **Video**: 10 minutes total duration
- **Storage**: 1GB total

To modify quotas, update the default values in the `media_quotas` table or create an admin interface.

## 🐛 Troubleshooting

**Issue**: Upload fails with "Quota exceeded"
- **Solution**: Check the quota display in the media library

**Issue**: Unsplash search doesn't work
- **Solution**: Verify your `VITE_UNSPLASH_ACCESS_KEY` is set correctly

**Issue**: Can't see uploaded files
- **Solution**: Check that storage policies are correctly applied

**Issue**: TypeScript errors in media service
- **Solution**: Re-run the type generation command after database setup

## 🚀 Next Steps

Once setup is complete, the media management system will be integrated into:
- ✅ Page Builder Image component
- ✅ Media Library modal
- ✅ File upload with progress tracking
- ✅ Unsplash stock photo search
- ✅ Automatic quota management 