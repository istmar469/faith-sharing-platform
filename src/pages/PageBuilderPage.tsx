
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import { usePageData } from '@/components/pagebuilder/hooks/usePageData';
import { usePageSave } from '@/hooks/usePageSave';
import MinimalEditor from '@/components/pagebuilder/MinimalEditor';
import { ArrowLeft, Save, Eye, Settings, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { PageData } from '@/services/pageService';
import OrgAwareLink from '@/components/routing/OrgAwareLink';

const PageBuilderPage: React.FC = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, isSubdomainAccess } = useTenantContext();
  const { pageData, setPageData, loading, error } = usePageData(pageId);
  const { handleSave, isSaving } = usePageSave();

  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [isHomepage, setIsHomepage] = useState(false);
  const [content, setContent] = useState<any>(null);

  // Update local state when pageData loads
  React.useEffect(() => {
    if (pageData) {
      setTitle(pageData.title);
      setPublished(pageData.published);
      setIsHomepage(pageData.is_homepage);
      setContent(pageData.content);
    }
  }, [pageData]);

  const handleSavePage = async () => {
    if (!organizationId || !title.trim()) return;

    const pageDataToSave: PageData = {
      id: pageData?.id,
      title,
      slug: pageData?.slug || title.toLowerCase().replace(/\s+/g, '-'),
      content: content || { blocks: [] },
      organization_id: organizationId,
      published,
      show_in_navigation: true,
      is_homepage: isHomepage
    };

    const savedPage = await handleSave(pageDataToSave);
    if (savedPage) {
      setPageData(savedPage);
      // Navigate to the saved page if it's new
      if (!pageId && savedPage.id) {
        window.location.href = `/page-builder/${savedPage.id}`;
      }
    }
  };

  const handlePreview = () => {
    if (pageData?.id) {
      window.open(`/preview/${pageData.id}?preview=true`, '_blank');
    } else {
      // Save first, then preview
      handleSavePage().then(() => {
        if (pageData?.id) {
          window.open(`/preview/${pageData.id}?preview=true`, '_blank');
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading page builder...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <OrgAwareLink to="/dashboard">
            <Button>Back to Dashboard</Button>
          </OrgAwareLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrgAwareLink to="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </OrgAwareLink>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Page Builder</h1>
                <p className="text-sm text-gray-500">Create and edit your website content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {organizationId && (
                <Badge variant="outline" className="text-xs">
                  {isSubdomainAccess ? 'Subdomain' : 'Organization'}: {organizationId.slice(0, 8)}...
                </Badge>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePreview}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSavePage}
                  disabled={isSaving || !title.trim()}
                  className="flex items-center gap-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Page Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="published">Published</Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="homepage">Homepage</Label>
              <Switch
                id="homepage"
                checked={isHomepage}
                onCheckedChange={setIsHomepage}
              />
            </div>

            {pageData?.id && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Page ID: {pageData.id}
                </p>
                {pageData.updated_at && (
                  <p className="text-xs text-gray-500">
                    Last saved: {new Date(pageData.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <MinimalEditor
                initialData={content}
                onSave={(data) => setContent(data)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBuilderPage;
