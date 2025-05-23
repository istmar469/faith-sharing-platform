import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Home, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { usePageBuilder } from '../context/PageBuilderContext';
import { getPages, deletePage, type Page } from '@/services/pages';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PagesSidebar: React.FC = () => {
  const { 
    organizationId, 
    pageId, 
    setPageId,
    setPageTitle,
    setPageSlug,
    setMetaTitle,
    setMetaDescription,
    setParentId,
    setShowInNavigation,
    setIsPublished,
    setIsHomepage,
    setPageElements,
    savePage
  } = usePageBuilder();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load pages when component mounts or organization changes
  useEffect(() => {
    if (organizationId) {
      loadPages();
    }
  }, [organizationId]);

  const loadPages = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      const pagesData = await getPages(organizationId);
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPage = () => {
    // Clear current page data and create new page
    setPageId(null);
    setPageTitle('New Page');
    setPageSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setParentId(null);
    setShowInNavigation(true);
    setIsPublished(false);
    setIsHomepage(false);
    setPageElements({ blocks: [] }); // Use proper EditorJSData format
    
    toast.success('New page created');
  };

  const handleSwitchToPage = async (page: Page) => {
    // Save current page before switching if there are changes
    try {
      if (pageId) {
        await savePage();
      }
      
      // Load the selected page
      setPageId(page.id || null);
      setPageTitle(page.title);
      setPageSlug(page.slug);
      setMetaTitle(page.meta_title || '');
      setMetaDescription(page.meta_description || '');
      setParentId(page.parent_id || null);
      setShowInNavigation(page.show_in_navigation);
      setIsPublished(page.published);
      setIsHomepage(page.is_homepage);
      
      // Convert content to EditorJSData format
      let editorData = { blocks: [] };
      if (page.content) {
        if (typeof page.content === 'object' && 'blocks' in page.content) {
          editorData = page.content;
        }
      }
      setPageElements(editorData);
      
      toast.success(`Switched to editing: ${page.title}`);
    } catch (error) {
      console.error('Error switching pages:', error);
      toast.error('Failed to switch pages');
    }
  };

  const handleDeletePage = async (page: Page) => {
    if (!page.id) return;
    
    try {
      await deletePage(page.id);
      await loadPages(); // Refresh the list
      
      // If we deleted the currently edited page, create a new one
      if (pageId === page.id) {
        handleCreateNewPage();
      }
      
      toast.success('Page deleted successfully');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Pages</h3>
          <Button size="sm" onClick={handleCreateNewPage}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredPages.map((page) => (
            <Card 
              key={page.id} 
              className={`cursor-pointer transition-colors ${pageId === page.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0" onClick={() => handleSwitchToPage(page)}>
                    <CardTitle className="text-sm font-medium truncate">
                      {page.title}
                      {page.is_homepage && (
                        <Home className="inline h-3 w-3 ml-1 text-orange-500" />
                      )}
                    </CardTitle>
                    <p className="text-xs text-gray-500 truncate">/{page.slug}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {page.published ? (
                      <Eye className="h-3 w-3 text-green-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Page</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{page.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePage(page)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0" onClick={() => handleSwitchToPage(page)}>
                <div className="flex gap-1 flex-wrap">
                  {page.is_homepage && (
                    <Badge variant="secondary" className="text-xs">Homepage</Badge>
                  )}
                  {page.published ? (
                    <Badge variant="default" className="text-xs">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Draft</Badge>
                  )}
                  {!page.show_in_navigation && (
                    <Badge variant="outline" className="text-xs">Hidden</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredPages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? 'No pages found' : 'No pages yet'}
              <p className="text-sm mt-1">Create your first page to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PagesSidebar;
