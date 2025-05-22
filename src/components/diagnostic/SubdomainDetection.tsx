
import React, { useState } from 'react';
import { DiagnosticResult } from '@/hooks/useDomainDiagnostic';
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Check, Database } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubdomainDetectionProps {
  diagnosticResult: DiagnosticResult;
}

interface OrganizationInfo {
  id: string;
  name: string;
  subdomain: string | null;
  website_enabled: boolean;
}

const SubdomainDetection: React.FC<SubdomainDetectionProps> = ({ diagnosticResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAllOrgs, setShowAllOrgs] = useState(false);

  // Function to check all organizations in the system
  const checkAllOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, subdomain, website_enabled')
        .order('name');
        
      if (error) throw error;
      setOrganizations(data || []);
      setShowAllOrgs(true);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-3">
      <h3 className="font-medium mb-2">Subdomain Detection</h3>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="current">Current Domain</TabsTrigger>
          <TabsTrigger value="all">All Organizations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <span className="text-gray-600">Detected Subdomain:</span>
            <span className="font-mono">{diagnosticResult.detectedSubdomain || 'None'}</span>
            {diagnosticResult.detectedSubdomain && (
              <>
                <span className="text-gray-600">Is UUID Format:</span>
                <span>{diagnosticResult.isUuid ? 'Yes' : 'No'}</span>
              </>
            )}
          </div>
          
          {diagnosticResult.organizationLookup && diagnosticResult.organizationLookup.data && (
            <Alert className="mt-2 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                This subdomain is registered to organization: <strong>{diagnosticResult.organizationLookup.data.name}</strong>
              </AlertDescription>
            </Alert>
          )}
          
          {diagnosticResult.detectedSubdomain && diagnosticResult.organizationLookup?.data === null && (
            <Alert className="mt-2 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                This subdomain is <strong>not registered</strong> to any organization.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={checkAllOrganizations}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Check All Organizations"}
          </Button>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="space-y-3">
            {!showAllOrgs ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Database className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-3">View all organizations and their subdomain configuration</p>
                <Button 
                  onClick={checkAllOrganizations} 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? "Loading..." : "Load Organizations"}
                </Button>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error loading organizations: {error}
                </AlertDescription>
              </Alert>
            ) : organizations.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No organizations found in the database.
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Showing all {organizations.length} organizations in the database:
                </div>
                <div className="overflow-auto max-h-[300px] border rounded">
                  <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subdomain</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {organizations.map((org) => (
                        <tr key={org.id}>
                          <td className="px-3 py-2 text-sm">{org.name}</td>
                          <td className="px-3 py-2 text-sm font-mono">
                            {org.subdomain || <span className="text-gray-400">Not set</span>}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {org.subdomain ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                org.website_enabled ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {org.website_enabled ? 'Active' : 'Disabled'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                No Subdomain
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {org.subdomain ? (
                              <a 
                                href={`https://${org.subdomain}.church-os.com`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800"
                              >
                                Visit <ArrowRight className="h-3 w-3 ml-1" />
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-xs text-gray-500">
                  * For a subdomain to work properly, it must be registered in the organizations table and have website_enabled set to true.
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubdomainDetection;
