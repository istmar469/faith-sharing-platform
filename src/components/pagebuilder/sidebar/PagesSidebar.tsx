import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Home, 
  Globe, 
  Menu, 
  GripVertical,
  ExternalLink,
  Search,
  FileText,
  Calendar,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTenantContext } from '@/components/context/TenantContext';

interface PageData {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  show_in_navigation: boolean;
  is_homepage: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

const PagesSidebar: React.FC = () => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    show_in_navigation: true,
    published: false
  });
  
  const navigate = useNavigate();
  const { organizationId } = useTenantContext();

  useEffect(() => {
    if (organizationId) {
      loadPages();
    }
  }, [organizationId]);

  const loadPages = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError('Failed to load pages');
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedPages = Array.from(pages);
    const [removed] = reorderedPages.splice(result.source.index, 1);
    reorderedPages.splice(result.destination.index, 0, removed);
    setPages(reorderedPages);
    toast.success('Page order updated');
  };

  const createPage = async () => {
    if (!organizationId) return;
    
    try {
      const { error } = await supabase
        .from('pages')
        .insert([{
          ...newPageData,
          organization_id: organizationId
        }]);

      if (error) throw error;

      toast.success('Page created successfully');
      setDialogOpen(false);
      setNewPageData({
        title: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        show_in_navigation: true,
        published: false
      });
      loadPages();
    } catch (err) {
      console.error('Error creating page:', err);
      toast.error('Failed to create page');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setNewPageData({
      ...newPageData,
      title,
      slug: generateSlug(title)
    });
  };

  const toggleNavigation = async (pageId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ show_in_navigation: !currentValue })
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.map(page => 
        page.id === pageId 
          ? { ...page, show_in_navigation: !currentValue }
          : page
      ));

      toast.success(`Page ${!currentValue ? 'added to' : 'removed from'} navigation`);
    } catch (err) {
      console.error('Error updating navigation:', err);
      toast.error('Failed to update navigation');
    }
  };

  const togglePublished = async (pageId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: !currentValue })
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.map(page => 
        page.id === pageId 
          ? { ...page, published: !currentValue }
          : page
      ));

      toast.success(`Page ${!currentValue ? 'published' : 'unpublished'}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update page');
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.filter(page => page.id !== pageId));
      toast.success('Page deleted');
    } catch (err) {
      console.error('Error deleting page:', err);
      toast.error('Failed to delete page');
    }
  };

  const editPage = (pageId: string) => {
    navigate(`/page-builder/${pageId}?organization_id=${organizationId}`);
  };

  // Filter pages based on search and status
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && page.published) ||
                         (filterStatus === 'draft' && !page.published);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <Button size="sm" onClick={loadPages}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Pages</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {pages.length}
          </Badge>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center gap-2 h-8 text-xs" size="sm">
              <Plus className="h-3 w-3" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-500" />
                Create New Page
              </DialogTitle>
              <DialogDescription>Add a new page to your website</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Page Title</Label>
                  <Input
                    id="title"
                    value={newPageData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter page title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                  <Input
                    id="slug"
                    value={newPageData.slug}
                    onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                    placeholder="page-url-slug"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">This page will be available at: /{newPageData.slug}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="meta_title" className="text-sm font-medium">SEO Title</Label>
                  <Input
                    id="meta_title"
                    value={newPageData.meta_title}
                    onChange={(e) => setNewPageData({ ...newPageData, meta_title: e.target.value })}
                    placeholder="Optional SEO title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description" className="text-sm font-medium">SEO Description</Label>
                  <Textarea
                    id="meta_description"
                    value={newPageData.meta_description}
                    onChange={(e) => setNewPageData({ ...newPageData, meta_description: e.target.value })}
                    placeholder="Optional SEO description"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <Label htmlFor="show_in_navigation" className="font-medium text-sm">Add to Navigation</Label>
                    <p className="text-xs text-gray-600 mt-1">Show in website navigation</p>
                  </div>
                  <Switch
                    id="show_in_navigation"
                    checked={newPageData.show_in_navigation}
                    onCheckedChange={(checked) => setNewPageData({ ...newPageData, show_in_navigation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div>
                    <Label htmlFor="published" className="font-medium text-sm">Publish Immediately</Label>
                    <p className="text-xs text-gray-600 mt-1">Make this page live</p>
                  </div>
                  <Switch
                    id="published"
                    checked={newPageData.published}
                    onCheckedChange={(checked) => setNewPageData({ ...newPageData, published: checked })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={createPage} className="bg-blue-600 hover:bg-blue-700">Create Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      {pages.length > 0 && (
        <div className="p-3 border-b border-gray-200">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Pages ({pages.length})</option>
              <option value="published">Published ({pages.filter(p => p.published).length})</option>
              <option value="draft">Drafts ({pages.filter(p => !p.published).length})</option>
            </select>
          </div>
        </div>
      )}

      {/* Navigation Preview */}
      {filteredPages.filter(page => page.show_in_navigation).length > 0 && (
        <div className="p-3 border-b border-gray-200 bg-blue-50/30">
          <div className="mb-2">
            <h4 className="text-xs font-medium text-blue-900 flex items-center gap-1">
              <Menu className="h-3 w-3" />
              Navigation Menu
            </h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {filteredPages
              .filter(page => page.show_in_navigation)
              .map((page) => (
                <Badge 
                  key={page.id} 
                  variant="outline" 
                  className={`text-xs flex items-center gap-1 ${
                    page.is_homepage ? 'bg-amber-50 border-amber-300 text-amber-800' : ''
                  }`}
                >
                  {page.is_homepage && <Home className="h-2 w-2" />}
                  {page.title}
                  {!page.published && <EyeOff className="h-2 w-2 text-orange-500" />}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {filteredPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">
                {searchQuery ? 'No pages found' : 'No pages yet'}
              </p>
              {!searchQuery && (
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Create your first page
                </Button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pages">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {filteredPages.map((page, index) => (
                      <Draggable key={page.id} draggableId={page.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white border rounded-lg transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-lg border-blue-300 bg-blue-50' 
                                : 'hover:shadow-sm border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="p-3">
                              <div className="flex items-start gap-2">
                                {/* Drag Handle */}
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
                                >
                                  <GripVertical className="h-3 w-3" />
                                </div>
                                
                                {/* Page Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <h4 className="font-medium text-gray-900 truncate text-sm">{page.title}</h4>
                                    <div className="flex items-center gap-1">
                                      {page.is_homepage && (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge variant="default" className="text-xs bg-amber-100 text-amber-800 border-amber-300 px-1 py-0">
                                              <Home className="h-2 w-2" />
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Homepage</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                      {page.published ? (
                                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs px-1 py-0">
                                          <Globe className="h-2 w-2" />
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs px-1 py-0">
                                          <EyeOff className="h-2 w-2" />
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-xs text-gray-500 mb-2">
                                    /{page.slug}
                                  </div>

                                  {/* Quick Controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="flex items-center gap-1">
                                            <Switch
                                              checked={page.show_in_navigation}
                                              onCheckedChange={() => toggleNavigation(page.id, page.show_in_navigation)}
                                              className="scale-75"
                                            />
                                            <Label className="text-xs text-gray-500 cursor-pointer">Nav</Label>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Show in navigation</p>
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="flex items-center gap-1">
                                            <Switch
                                              checked={page.published}
                                              onCheckedChange={() => togglePublished(page.id, page.published)}
                                              className="scale-75"
                                            />
                                            <Label className="text-xs text-gray-500 cursor-pointer">Live</Label>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Publish page</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => editPage(page.id)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit page</p>
                                        </TooltipContent>
                                      </Tooltip>

                                      {page.published && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                                              className="h-6 w-6 p-0"
                                            >
                                              <ExternalLink className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>View live</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => editPage(page.id)}
                                          >
                                            <Edit className="h-3 w-3 mr-2" />
                                            Edit Page
                                          </DropdownMenuItem>
                                          {page.published && (
                                            <DropdownMenuItem
                                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                                            >
                                              <ExternalLink className="h-3 w-3 mr-2" />
                                              View Live
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem
                                            onClick={() => toggleNavigation(page.id, page.show_in_navigation)}
                                          >
                                            {page.show_in_navigation ? (
                                              <>
                                                <EyeOff className="h-3 w-3 mr-2" />
                                                Remove from Nav
                                              </>
                                            ) : (
                                              <>
                                                <Eye className="h-3 w-3 mr-2" />
                                                Add to Nav
                                              </>
                                            )}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => togglePublished(page.id, page.published)}
                                          >
                                            {page.published ? (
                                              <>
                                                <EyeOff className="h-3 w-3 mr-2" />
                                                Unpublish
                                              </>
                                            ) : (
                                              <>
                                                <Globe className="h-3 w-3 mr-2" />
                                                Publish
                                              </>
                                            )}
                                          </DropdownMenuItem>
                                          <Separator />
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <DropdownMenuItem
                                                onSelect={(e) => e.preventDefault()}
                                                className="text-red-600 focus:text-red-600"
                                              >
                                                <Trash2 className="h-3 w-3 mr-2" />
                                                Delete Page
                                              </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  This action cannot be undone. This will permanently delete the page "{page.title}" and remove all its content.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => deletePage(page.id)}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Delete
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PagesSidebar;
