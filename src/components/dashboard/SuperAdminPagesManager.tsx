
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface PageInfo {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  is_homepage: boolean;
  organization_id: string;
  organization_name: string;
  updated_at: string;
}

interface SuperAdminPagesManagerProps {
  onNavigateToOrg: (orgId: string) => void;
}

const SuperAdminPagesManager: React.FC<SuperAdminPagesManagerProps> = ({ onNavigateToOrg }) => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all organizations first
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name, subdomain')
          .order('name');

        if (orgsError) throw orgsError;
        setOrganizations(orgsData || []);

        // Fetch all pages and manually join with organizations
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select(`
            id,
            title,
            slug,
            published,
            is_homepage,
            organization_id,
            updated_at
          `)
          .order('updated_at', { ascending: false });

        if (pagesError) throw pagesError;

        // Manually join pages with organizations
        const formattedPages = pagesData?.map(page => ({
          ...page,
          organization_name: orgsData?.find(org => org.id === page.organization_id)?.name || 'Unknown Organization'
        })) || [];

        setPages(formattedPages);
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.organization_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgId === 'all' || page.organization_id === selectedOrgId;
    return matchesSearch && matchesOrg;
  });

  const handleEditPage = (page: PageInfo) => {
    // Navigate to page builder with organization context
    navigate(`/page-builder/${page.id}?org=${page.organization_id}`);
  };

  const handlePreviewPage = (page: PageInfo) => {
    // Open preview in new tab
    const org = organizations.find(o => o.id === page.organization_id);
    if (org?.subdomain) {
      window.open(`https://${org.subdomain}.${window.location.host}/${page.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Organization Pages</h2>
          <p className="text-gray-600">Manage pages across all organizations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pages or organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pages List */}
      <div className="grid gap-4">
        {filteredPages.map(page => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>{page.organization_name}</span>
                    <span>•</span>
                    <span>/{page.slug}</span>
                    {page.is_homepage && (
                      <Badge variant="secondary" className="ml-2">Homepage</Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={page.published ? 'default' : 'secondary'}>
                    {page.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewPage(page)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleEditPage(page)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToOrg(page.organization_id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Organization Dashboard →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No pages found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPagesManager;
