
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Globe, Settings, Users, BarChart3, Plus, FileText, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FullSiteBuilderProps {
  organizationId?: string | null;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  is_homepage: boolean;
  created_at: string;
  updated_at: string;
}

const FullSiteBuilder: React.FC<FullSiteBuilderProps> = ({ organizationId }) => {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageIsHomepage, setNewPageIsHomepage] = useState(false);
  const [creating, setCreating] = useState(false);

  console.log('FullSiteBuilder: Received organizationId:', organizationId);

  // Fetch pages for this organization
  useEffect(() => {
    if (organizationId) {
      fetchPages();
    }
  }, [organizationId]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('id, title, slug, published, is_homepage, created_at, updated_at')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching pages:', error);
        toast({
          title: "Error",
          description: "Failed to load pages",
          variant: "destructive"
        });
      } else {
        setPages(data || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error",
        description: "Failed to load pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPage = async () => {
    if (!newPageTitle.trim() || !organizationId) return;

    try {
      setCreating(true);
      
      // Generate slug from title
      const slug = newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // If making this the homepage, unset any existing homepage
      if (newPageIsHomepage) {
        await supabase
          .from('pages')
          .update({ is_homepage: false })
          .eq('organization_id', organizationId)
          .eq('is_homepage', true);
      }

      const { data, error } = await supabase
        .from('pages')
        .insert({
          title: newPageTitle.trim(),
          slug,
          content: {
            content: [],
            root: {}
          },
          published: false,
          show_in_navigation: true,
          is_homepage: newPageIsHomepage,
          organization_id: organizationId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating page:', error);
        toast({
          title: "Error",
          description: "Failed to create page",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Page created successfully",
        });
        setNewPageTitle('');
        setNewPageIsHomepage(false);
        setShowCreateDialog(false);
        fetchPages();
        
        // Navigate to edit the new page
        editPage(data.id);
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const deletePage = async (pageId: string, pageTitle: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        console.error('Error deleting page:', error);
        toast({
          title: "Error",
          description: "Failed to delete page",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `Page "${pageTitle}" deleted successfully`,
        });
        fetchPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    }
  };

  const togglePagePublished = async (pageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: !currentStatus })
        .eq('id', pageId);

      if (error) {
        console.error('Error updating page:', error);
        toast({
          title: "Error",
          description: "Failed to update page",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `Page ${!currentStatus ? 'published' : 'unpublished'} successfully`,
        });
        fetchPages();
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive"
      });
    }
  };

  const editPage = (pageId: string) => {
    // Navigate to page builder for this specific page
    window.open(`/page-builder/${pageId}`, '_blank');
  };

  const previewPage = () => {
    // Open the homepage for preview
    const baseUrl = window.location.origin;
    window.open(baseUrl, '_blank');
  };

  if (!organizationId) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-semibold">No Organization Selected</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Please select an organization to continue with the site builder.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Builder</h1>
          <p className="text-gray-600">Build and customize your organization's website</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowCreateDialog(true)}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Create Page</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Create a new page for your website</p>
              <Button className="mt-4 w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={previewPage}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Preview Site</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Preview your live website</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Team Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Manage who can edit and publish content</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">View website traffic and performance metrics</p>
              <Button className="mt-4 w-full" variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pages Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Pages</CardTitle>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pages...</p>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No pages created yet</p>
                <p className="text-sm">Get started by creating your first page</p>
                <Button className="mt-4" size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Page
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{page.title}</h3>
                        {page.is_homepage && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Homepage</span>
                        )}
                        {page.published && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Published</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">/{page.slug}</p>
                      <p className="text-xs text-gray-500">
                        Updated {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPage(page.id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant={page.published ? "outline" : "default"}
                        size="sm"
                        onClick={() => togglePagePublished(page.id, page.published)}
                      >
                        {page.published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
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
                            <AlertDialogAction 
                              onClick={() => deletePage(page.id, page.title)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Page Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="Enter page title"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="homepage"
                  checked={newPageIsHomepage}
                  onCheckedChange={setNewPageIsHomepage}
                />
                <Label htmlFor="homepage">Set as homepage</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createPage} 
                  disabled={!newPageTitle.trim() || creating}
                >
                  {creating ? 'Creating...' : 'Create Page'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FullSiteBuilder;
