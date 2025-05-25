
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, Settings, Users } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { OrganizationData } from './types';

type OrganizationsTableProps = {
  organizations: OrganizationData[];
  onOrgClick: (id: string) => void;
  isSuperAdmin?: boolean;
};

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({
  organizations,
  onOrgClick,
  isSuperAdmin = false
}) => {
  const navigate = useNavigate();
  
  if (organizations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No organizations found</p>
      </div>
    );
  }

  const handleViewOrganization = (e: React.MouseEvent, orgId: string) => {
    e.stopPropagation();
    // Direct super admins to dashboard for the organization
    navigate(`/dashboard?org=${orgId}`);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Organization Name</TableHead>
            <TableHead>Slug/Domain</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow 
              key={org.id} 
              onClick={() => onOrgClick(org.id)}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="cursor-pointer hover:text-primary transition-colors">
                    {org.name}
                  </div>
                  {org.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {org.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <div className="text-xs font-medium">
                    <Badge variant="outline" className="mr-1">SLUG</Badge>
                    {org.slug}
                  </div>
                  
                  {org.subdomain && (
                    <div className="text-xs">
                      <Badge variant="outline" className="mr-1">SUBDOMAIN</Badge>
                      {org.subdomain}.church-os.com
                    </div>
                  )}
                  
                  {org.custom_domain && (
                    <div className="text-xs">
                      <Badge variant="outline" className="mr-1">DOMAIN</Badge>
                      {org.custom_domain}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {org.website_enabled ? (
                  <span className="inline-flex items-center text-xs font-medium text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium text-red-600">
                    <XCircle className="h-3 w-3 mr-1" /> Disabled
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  org.role === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                  org.role === 'Premium' ? 'bg-blue-100 text-blue-800' :
                  org.role === 'Standard' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {org.role || 'Standard'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOrgClick(org.id);
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage Members</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard?org=${org.id}`);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Organization Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-8"
                    onClick={(e) => handleViewOrganization(e, org.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrganizationsTable;
