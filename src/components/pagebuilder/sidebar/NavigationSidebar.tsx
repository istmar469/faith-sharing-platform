import React, { useState, useEffect } from 'react';
import { useTenantContext } from '@/components/context/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Navigation, Plus, GripVertical, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getOrganizationPages } from '@/services/pageService';

interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  is_homepage: boolean;
  published: boolean;
  show_in_navigation: boolean;
  order?: number;
}

const NavigationSidebar: React.FC = () => {
  const { organizationId } = useTenantContext();
  const [pages, setPages] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, [organizationId]);

  const loadPages = async () => {
    if (!organizationId) {
      setError('Organization context is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getOrganizationPages(organizationId);
      
      if (result.data) {
        const navigationPages = result.data
          .filter(page => page.show_in_navigation && page.id && page.title && page.slug)
          .map(page => ({
            id: page.id!,
            title: page.title!,
            slug: page.slug!,
            is_homepage: page.is_homepage || false,
            published: page.published || false,
            show_in_navigation: page.show_in_navigation || false,
            order: (page as any).order || 0
          }))
          .sort((a, b) => a.order - b.order);
        setPages(navigationPages);
      } else {
        setError('Failed to load pages');
      }
    } catch (err) {
      console.error('NavigationSidebar: Error loading pages:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Navigation Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No navigation items</p>
                <p className="text-xs mt-1">Enable "Show in Navigation" in the Pages tab to add items here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {page.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        /{page.slug}
                      </div>
                    </div>
                    {page.is_homepage && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Home
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        // Navigate to edit page - this will be handled by parent component
                        console.log('Edit page:', page.id);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => {
                // Navigate to pages tab
                console.log('Switch to pages tab');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Pages
            </Button>
            
            <div className="text-xs text-gray-500">
              Switch to the "Pages" tab to create new pages, reorder navigation items, and control visibility.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationSidebar;
