import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { 
  Loader2, FileText, PlusCircle, Edit, Trash2, 
  Eye, Home, Globe, MoreHorizontal 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getPages, Page, deletePage } from '@/services/pages';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useTenantContext } from '@/components/context/TenantContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const PagesListPage = () => {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [pages, setPages] = useState<Page[]>([]);
  const { organizationId: tenantOrgId, organizationName } = useTenantContext();
  
  // Use the organization ID from the URL params or fall back to the tenant context
  const effectiveOrgId = organizationId || tenantOrgId;
  
  console.log("PagesListPage: Rendering with DashboardSidebar, effectiveOrgId:", effectiveOrgId);
  
  useEffect(() => {
    const fetchPages = async () => {
      if (!effectiveOrgId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Use getPages() function which already handles type mapping correctly
        const fetchedPages = await getPages(effectiveOrgId);
        setPages(fetchedPages);
      } catch (error) {
        console.error('Error fetching pages:', error);
        uiToast({
          title: "Error",
          description: "Failed to load pages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPages();
  }, [effectiveOrgId, uiToast]);
  
  const handleCreatePage = () => {
    if (effectiveOrgId) {
      navigate(`/tenant-dashboard/${effectiveOrgId}/page-builder`);
    }
  };
  
  const handleEditPage = (pageId: string) => {
    if (effectiveOrgId) {
      navigate(`/tenant-dashboard/${effectiveOrgId}/page-builder/${pageId}`);
    }
  };
  
  const handleViewPage = (pageId: string) => {
    if (effectiveOrgId) {
      navigate(`/preview-domain/${effectiveOrgId}?page=${pageId}`);
    }
  };
  
  const handlePreviewWebsite = () => {
    if (effectiveOrgId) {
      navigate(`/preview-domain/${effectiveOrgId}`);
    }
  };
  
  const togglePagePublished = async (page: Page) => {
    if (!effectiveOrgId) return;
    
    try {
      const { error } = await supabase
        .from('pages')
        .update({ published: !page.published })
        .eq('id', page.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setPages(currentPages => 
        currentPages.map(p => 
          p.id === page.id ? { ...p, published: !page.published } : p
        )
      );
      
      toast.success(
        page.published 
          ? "Page unpublished successfully" 
          : "Page published successfully"
      );
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error("Failed to update page status");
    }
  };
  
  const toggleShowInNavigation = async (page: Page) => {
    if (!effectiveOrgId) return;
    
    try {
      const { error } = await supabase
        .from('pages')
        .update({ show_in_navigation: !page.show_in_navigation })
        .eq('id', page.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setPages(currentPages => 
        currentPages.map(p => 
          p.id === page.id ? { ...p, show_in_navigation: !page.show_in_navigation } : p
        )
      );
      
      toast.success(
        page.show_in_navigation 
          ? "Page removed from navigation" 
          : "Page added to navigation"
      );
    } catch (error) {
      console.error('Error updating navigation setting:', error);
      toast.error("Failed to update navigation setting");
    }
  };
  
  const setAsHomepage = async (page: Page) => {
    if (!effectiveOrgId || page.is_homepage) return;
    
    try {
      // First, unset any existing homepage
      await supabase
        .from('pages')
        .update({ is_homepage: false })
        .eq('organization_id', effectiveOrgId)
        .eq('is_homepage', true);
      
      // Then set the new homepage
      const { error } = await supabase
        .from('pages')
        .update({ is_homepage: true })
        .eq('id', page.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setPages(currentPages => 
        currentPages.map(p => 
          p.id === page.id 
            ? { ...p, is_homepage: true } 
            : { ...p, is_homepage: false }
        )
      );
      
      toast.success("Homepage updated successfully");
    } catch (error) {
      console.error('Error updating homepage:', error);
      toast.error("Failed to update homepage");
    }
  };
  
  const handleDeletePage = async (page: Page) => {
    if (!effectiveOrgId) return;
    
    // Don't allow deleting the homepage
    if (page.is_homepage) {
      toast.error("Cannot delete homepage. Set another page as homepage first.");
      return;
    }
    
    try {
      // Use the deletePage function from services
      await deletePage(page.id);
      
      // Update local state
      setPages(currentPages => currentPages.filter(p => p.id !== page.id));
      
      toast.success("Page deleted successfully");
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error("Failed to delete page");
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white w-full">
        <DashboardSidebar isSuperAdmin={true} organizationId={effectiveOrgId} />
        
        <SidebarInset className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                    {organizationName && (
                      <p className="text-sm text-muted-foreground">{organizationName}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePreviewWebsite}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Preview Website
                  </Button>
                  
                  <Button onClick={handleCreatePage}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Page
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <div className="bg-white rounded-md shadow">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No pages yet</h3>
                  <p className="mt-1 text-gray-500">Get started by creating your first page</p>
                  <Button onClick={handleCreatePage} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Page
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Navigation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{page.title}</span>
                          {page.is_homepage && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                              <Home className="h-3 w-3 mr-1" /> 
                              Homepage
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={page.published} 
                            onCheckedChange={() => togglePagePublished(page)}
                          />
                          <span className="ml-2 text-xs">
                            {page.published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {page.updated_at 
                            ? format(new Date(page.updated_at), 'MMM dd, yyyy')
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={page.show_in_navigation} 
                            onCheckedChange={() => toggleShowInNavigation(page)}
                          />
                          <span className="ml-2 text-xs">
                            {page.show_in_navigation ? 'Visible' : 'Hidden'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPage(page.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewPage(page.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              {!page.is_homepage && (
                                <DropdownMenuItem onClick={() => setAsHomepage(page)}>
                                  <Home className="mr-2 h-4 w-4" />
                                  <span>Set as Homepage</span>
                                </DropdownMenuItem>
                              )}
                              {!page.is_homepage && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeletePage(page)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PagesListPage;
