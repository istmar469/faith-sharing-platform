
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

export type OrganizationTableItem = {
  id: string;
  name: string;
  slug: string;
  subdomain: string | null;
  customDomain: string | null;
  website_enabled: boolean;
  description: string | null;
  createdAt?: string;
  plan?: string;
  members?: number;
};

type OrganizationsTableProps = {
  organizations: OrganizationTableItem[];
  isLoading: boolean;
  onSelectOrganization: (id: string) => void;
  selectedOrganizationId: string | null;
};

const OrganizationsTable: React.FC<OrganizationsTableProps> = ({
  organizations,
  isLoading,
  onSelectOrganization,
  selectedOrganizationId
}) => {
  const navigate = useNavigate();
  
  if (organizations.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No organizations found</p>
      </div>
    );
  }

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
              className={selectedOrganizationId === org.id ? "bg-muted/50" : undefined}
              onClick={() => onSelectOrganization(org.id)}
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
                  
                  {org.customDomain && (
                    <div className="text-xs">
                      <Badge variant="outline" className="mr-1">DOMAIN</Badge>
                      {org.customDomain}
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
                  org.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                  org.plan === 'Premium' ? 'bg-blue-100 text-blue-800' :
                  org.plan === 'Standard' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {org.plan || 'Standard'}
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
                            onSelectOrganization(org.id);
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
                            navigate(`/tenant-dashboard/${org.id}`);
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tenant-dashboard/${org.id}`);
                    }}
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
