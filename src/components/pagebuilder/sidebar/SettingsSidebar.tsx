
import React, { useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageBuilder } from '../context/PageBuilderContext';
import { supabase } from "@/integrations/supabase/client";

const SettingsSidebar: React.FC = () => {
  const { 
    pageTitle, 
    pageSlug, 
    setPageSlug, 
    metaTitle, 
    setMetaTitle, 
    metaDescription, 
    setMetaDescription,
    isPublished,
    setIsPublished,
    showInNavigation,
    setShowInNavigation,
    parentId,
    setParentId
  } = usePageBuilder();
  
  const [parentPages, setParentPages] = React.useState<{id: string, title: string}[]>([]);
  
  // Set default meta title based on page title
  useEffect(() => {
    if (!metaTitle) {
      setMetaTitle(pageTitle ? `${pageTitle} | First Baptist Church` : '');
    }
  }, [pageTitle, metaTitle, setMetaTitle]);
  
  // Generate slug from title if not set manually
  useEffect(() => {
    if (!pageSlug && pageTitle) {
      setPageSlug(pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [pageTitle, pageSlug, setPageSlug]);
  
  // Fetch possible parent pages
  useEffect(() => {
    const fetchParentPages = async () => {
      const { data } = await supabase
        .from('pages')
        .select('id, title')
        .order('title');
      
      if (data) {
        setParentPages(data);
      }
    };
    
    fetchParentPages();
  }, []);
  
  return (
    <div className="p-4 mt-0">
      <div className="space-y-4">
        <div>
          <Label htmlFor="page-url">Page URL</Label>
          <Input 
            id="page-url" 
            value={pageSlug} 
            onChange={(e) => setPageSlug(e.target.value)}
            placeholder="page-url-slug"
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input 
            id="meta-title" 
            value={metaTitle} 
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Page Title | First Baptist Church"
            className="mt-1" 
          />
        </div>
        <div>
          <Label htmlFor="meta-desc">Meta Description</Label>
          <Textarea 
            id="meta-desc" 
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief description of this page for search engines"
            className="mt-1" 
            rows={3} 
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="page-visibility">Published</Label>
          <Switch 
            id="page-visibility"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="page-index">Show in Navigation</Label>
          <Switch 
            id="page-index" 
            checked={showInNavigation}
            onCheckedChange={setShowInNavigation}
          />
        </div>
        <div>
          <Label htmlFor="page-parent">Parent Page</Label>
          <Select 
            value={parentId || "none"}
            onValueChange={(value) => setParentId(value === "none" ? null : value)}
          >
            <SelectTrigger id="page-parent">
              <SelectValue placeholder="Select parent page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {parentPages.map(page => (
                <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
