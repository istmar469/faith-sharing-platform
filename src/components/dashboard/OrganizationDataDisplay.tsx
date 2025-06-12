import React from 'react';
import { OrganizationData } from './types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Settings, Globe, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface OrganizationDataDisplayProps {
  loading: boolean;
  error: string | null;
  filteredOrganizations: OrganizationData[];
  onOrgClick: (organization: OrganizationData) => void;
  onRetry: () => void;
  onAuthRetry: () => void;
  isSuperAdmin?: boolean;
  showManagementOptions?: boolean;
}

const OrganizationDataDisplay: React.FC<OrganizationDataDisplayProps> = ({
  loading,
  error,
  filteredOrganizations,
  onOrgClick,
  onRetry,
  onAuthRetry,
  isSuperAdmin = false,
  showManagementOptions = false
}) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Error Loading Organizations</h3>
        <p className="mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onRetry} variant="outline">
            Retry
          </Button>
          <Button onClick={onAuthRetry} variant="default">
            Re-authenticate
          </Button>
        </div>
      </div>
    );
  }

  if (filteredOrganizations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">No Organizations Found</h3>
        <p className="text-gray-500">
          {filteredOrganizations.length === 0
            ? "No organizations match your search"
            : "You don't have access to any organizations"}
        </p>
      </div>
    );
  }

  const getSubdomainUrl = (subdomain: string | null) => {
    if (!subdomain) return null;
    const isLocalhost = window.location.hostname === 'localhost';
    return isLocalhost
      ? `http://localhost:3000` // Use for local development
      : `https://${subdomain}.church-os.com`;
  };


  
  return (
    <div>
      {isSuperAdmin && showManagementOptions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">{org.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {org.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={org.website_enabled ? "default" : "outline"}>
                    {org.website_enabled ? "Site Enabled" : "Site Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {org.subdomain && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{org.subdomain}.church-os.com</span>
                    </div>
                  )}
                  {org.custom_domain && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{org.custom_domain}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex flex-wrap gap-2">
                <Button 
                  onClick={() => onOrgClick(org)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Dashboard
                </Button>
                
                {/* Add direct page builder access for main domain organization */}
                {org.name === 'Church-OS Platform' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                    onClick={() => navigate(`/page-builder?organization_id=${org.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Homepage
                  </Button>
                )}
                
                {org.subdomain && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    asChild
                  >
                    <a 
                      href={getSubdomainUrl(org.subdomain) || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-1" /> View Site
                    </a>
                  </Button>
                )}
                
                {/* Add View Site button for main domain */}
                {org.name === 'Church-OS Platform' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    asChild
                  >
                    <a 
                      href="https://church-os.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-1" /> View Site
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug/Domain
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    <div className="text-sm text-gray-500">{org.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.subdomain && (
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium mr-2">SUBDOMAIN:</span>
                        <span>{org.subdomain}.church-os.com</span>
                      </div>
                    )}
                    {org.slug && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium mr-2">SLUG:</span>
                        <span>{org.slug}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      onClick={() => onOrgClick(org)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Dashboard
                    </Button>
                    {org.subdomain && (
                      <a
                        href={getSubdomainUrl(org.subdomain) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        Visit Site <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganizationDataDisplay;
