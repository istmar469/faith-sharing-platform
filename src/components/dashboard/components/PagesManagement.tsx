import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Filter,
  MoreHorizontal,
  Settings,
  FileText,
  Calendar
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface PagesManagementProps {
  organizationId: string;
}

const PagesManagement: React.FC<PagesManagementProps> = ({ organizationId }) => {
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

  useEffect(() => {
    loadPages();
  }, [organizationId]);

  const loadPages = async () => {
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
    if (!newPageData.title.trim()) {
      toast.error('Page title is required');
      return;
    }

    try {
      let slug = newPageData.slug || 
        newPageData.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      
      // Remove leading and trailing dashes
      slug = slug.replace(/^-+|-+$/g, '');

      const { error } = await supabase
        .from('pages')
        .insert({
          title: newPageData.title,
          slug,
          meta_title: newPageData.meta_title,
          meta_description: newPageData.meta_description,
          show_in_navigation: newPageData.show_in_navigation,
          published: newPageData.published,
          organization_id: organizationId,
          content: { content: [], root: {} },
          is_homepage: false
        });

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <p className="text-red-800 mb-4">{error}</p>
          <Button onClick={loadPages} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              Pages Management
            </h2>
            <p className="text-gray-600 mt-1">Manage your website pages and navigation menu</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-500" />
                  Create New Page
                </DialogTitle>
                <DialogDescription>Add a new page to your website with customizable settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Page Title *</Label>
                    <Input
                      id="title"
                      value={newPageData.title}
                      onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
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
                      placeholder="Auto-generated from title"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">yoursite.com/{newPageData.slug || 'page-url'}</p>
                  </div>
                </div>

                <Separator />

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

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label htmlFor="show_in_navigation" className="font-medium text-sm">Add to Navigation Menu</Label>
                      <p className="text-xs text-gray-600 mt-1">Show this page in your website navigation</p>
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
                      <p className="text-xs text-gray-600 mt-1">Make this page live right away</p>
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

        {/* Search and Filter Bar */}
        {pages.length > 0 && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="filter" className="text-sm font-medium whitespace-nowrap">Filter:</Label>
                  <select
                    id="filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Pages</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredPages.length === 0 && pages.length > 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : pages.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages yet</h3>
                <p className="text-gray-500 mb-4">Create your first page to get started building your website</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Enhanced Navigation Menu Preview */}
            <Card className="shadow-sm border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Menu className="h-5 w-5" />
                  Navigation Menu Preview
                </CardTitle>
                <p className="text-sm text-blue-700">How your navigation will appear to visitors</p>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {filteredPages
                      .filter(page => page.show_in_navigation)
                      .map((page) => (
                        <Badge 
                          key={page.id} 
                          variant="outline" 
                          className={`flex items-center gap-1 ${
                            page.is_homepage ? 'bg-amber-50 border-amber-300 text-amber-800' : ''
                          }`}
                        >
                          {page.is_homepage && <Home className="h-3 w-3" />}
                          {page.title}
                          {!page.published && (
                            <Tooltip>
                              <TooltipTrigger>
                                <EyeOff className="h-3 w-3 text-orange-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Not published yet</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </Badge>
                      ))}
                    {filteredPages.filter(page => page.show_in_navigation).length === 0 && (
                      <p className="text-gray-500 text-sm italic">No pages in navigation menu</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Pages List */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    All Pages ({filteredPages.length})
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {filteredPages.filter(p => p.published).length} published, {filteredPages.filter(p => !p.published).length} drafts
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pages">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
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
                                    : 'hover:shadow-md border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="p-4">
                                  <div className="flex items-center gap-4">
                                    {/* Drag Handle */}
                                    <div 
                                      {...provided.dragHandleProps} 
                                      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0"
                                    >
                                      <GripVertical className="h-5 w-5" />
                                    </div>
                                    
                                    {/* Page Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900 truncate">{page.title}</h3>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          {page.is_homepage && (
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <Badge variant="default" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                                                  <Home className="h-3 w-3 mr-1" />
                                                  Homepage
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>This is your homepage</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                          {page.published ? (
                                            <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                                              <Globe className="h-3 w-3 mr-1" />
                                              Live
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
                                              <EyeOff className="h-3 w-3 mr-1" />
                                              Draft
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <ExternalLink className="h-3 w-3" />
                                          /{page.slug}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {formatDate(page.updated_at)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      {/* Navigation Toggle */}
                                      <div className="hidden sm:flex items-center gap-2">
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Label htmlFor={`nav-${page.id}`} className="text-xs text-gray-500 cursor-pointer">
                                              Menu
                                            </Label>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Show in navigation menu</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Switch
                                          id={`nav-${page.id}`}
                                          checked={page.show_in_navigation}
                                          onCheckedChange={() => toggleNavigation(page.id, page.show_in_navigation)}
                                        />
                                      </div>

                                      {/* Published Toggle */}
                                      <div className="hidden sm:flex items-center gap-2">
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Label htmlFor={`pub-${page.id}`} className="text-xs text-gray-500 cursor-pointer">
                                              Live
                                            </Label>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Publish/unpublish page</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Switch
                                          id={`pub-${page.id}`}
                                          checked={page.published}
                                          onCheckedChange={() => togglePublished(page.id, page.published)}
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => editPage(page.id)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Edit className="h-4 w-4" />
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
                                                className="h-8 w-8 p-0"
                                              >
                                                <ExternalLink className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>View live page</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}

                                        {/* Mobile Menu */}
                                        <div className="sm:hidden">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={() => toggleNavigation(page.id, page.show_in_navigation)}
                                              >
                                                {page.show_in_navigation ? 'Remove from menu' : 'Add to menu'}
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => togglePublished(page.id, page.published)}
                                              >
                                                {page.published ? 'Unpublish' : 'Publish'}
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="flex items-center gap-2">
                                                <Trash2 className="h-5 w-5 text-red-500" />
                                                Delete Page
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to delete "<strong>{page.title}</strong>"? This action cannot be undone and will permanently remove the page and all its content.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => deletePage(page.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Delete Page
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PagesManagement; 