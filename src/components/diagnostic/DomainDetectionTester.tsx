
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeDomain } from '../context/utils/domainDetection';
import DiagnosticNavHeader from "./DiagnosticNavHeader";

interface DomainDetectionTesterProps {
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  embedded?: boolean;
  titleOverride?: string;
}

interface DiagnosticResult {
  timestamp: string;
  hostname: string;
  domainAnalysis: any;
  organizationLookup: {
    queryExecuted: boolean;
    allOrganizations: any[];
    enabledOrganizations: any[];
    disabledOrganizations: any[];
    selectedOrganization: any | null;
    error: any | null;
  } | null;
  error?: string;
}

/**
 * ENHANCED: Component for testing and diagnosing subdomain detection issues
 */
const DomainDetectionTester: React.FC<DomainDetectionTesterProps> = ({ 
  showHeader = true, 
  showFooter = true, 
  showNavigation = false,
  embedded = false,
  titleOverride
}) => {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResult(null);

    try {
      const hostname = window.location.hostname;
      const domainAnalysis = analyzeDomain();
      
      console.log("🔍 Diagnostic: Starting comprehensive analysis", { hostname, domainAnalysis });

      let organizationLookup = null;
      
      // If we detected a subdomain, test the organization lookup
      if (domainAnalysis.detectedSubdomain && !domainAnalysis.lovableOrgId && !domainAnalysis.isMainDomain) {
        const pureSubdomain = domainAnalysis.detectedSubdomain.split('.')[0];
        
        console.log("📊 Diagnostic: Testing organization lookup for subdomain:", pureSubdomain);
        
        const { data: allOrgs, error } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain, created_at')
          .eq('subdomain', pureSubdomain)
          .order('website_enabled', { ascending: false })
          .order('created_at', { ascending: false });

        const enabledOrganizations = allOrgs?.filter(org => org.website_enabled === true) || [];
        const disabledOrganizations = allOrgs?.filter(org => org.website_enabled === false) || [];
        const selectedOrganization = enabledOrganizations[0] || null;

        organizationLookup = {
          queryExecuted: true,
          allOrganizations: allOrgs || [],
          enabledOrganizations,
          disabledOrganizations,
          selectedOrganization,
          error
        };
        
        console.log("📋 Diagnostic: Organization lookup result:", organizationLookup);
      }

      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        hostname,
        domainAnalysis,
        organizationLookup
      };

      setDiagnosticResult(result);
      
    } catch (error) {
      console.error("💥 Diagnostic: Error during analysis:", error);
      setDiagnosticResult({
        timestamp: new Date().toISOString(),
        hostname: window.location.hostname,
        domainAnalysis: null,
        organizationLookup: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? "text-green-600" : "text-red-600";
  };

  return (
    <>
      {showNavigation && (
        <DiagnosticNavHeader 
          title="Enhanced Domain Detection Diagnostic"
          description="Advanced diagnostic tool to analyze subdomain detection and organization lookup issues"
        />
      )}

      <Card className={embedded ? "" : "max-w-4xl mx-auto my-8"}>
        {showHeader && (
          <CardHeader>
            <CardTitle>{titleOverride || "Enhanced Domain Detection Diagnostic"}</CardTitle>
            <CardDescription>
              Advanced diagnostic tool to analyze subdomain detection and organization lookup issues
            </CardDescription>
            
            {showTips && (
              <Alert className="mt-2 bg-blue-50 border-blue-100">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-blue-700 text-sm">
                  <p className="font-semibold mb-1">Enhanced Troubleshooting Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check if multiple organizations exist with the same subdomain</li>
                    <li>Verify the website_enabled flag is set to true for the correct organization</li>
                    <li>Ensure domain detection logic correctly identifies your subdomain format</li>
                    <li>Review the organization lookup priority (enabled organizations first)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)}>
                {showTips ? 'Hide Tips' : 'Show Enhanced Tips'}
              </Button>
            </div>
          </CardHeader>
        )}
        
        <CardContent className="space-y-6">
          {isRunning ? (
            <div className="py-8 text-center text-gray-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-400" />
              <p>Running enhanced diagnostics...</p>
            </div>
          ) : diagnosticResult ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-600">Current Hostname:</span>
                  <span className="font-mono">{diagnosticResult.hostname}</span>
                  
                  <span className="text-gray-600">Timestamp:</span>
                  <span>{new Date(diagnosticResult.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Domain Analysis */}
              {diagnosticResult.domainAnalysis && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Domain Analysis</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <span className="text-gray-600">Is Main Domain:</span>
                    <span className={`flex items-center gap-1 ${getStatusColor(diagnosticResult.domainAnalysis.isMainDomain)}`}>
                      {getStatusIcon(diagnosticResult.domainAnalysis.isMainDomain)}
                      {diagnosticResult.domainAnalysis.isMainDomain ? 'Yes' : 'No'}
                    </span>
                    
                    <span className="text-gray-600">Detected Subdomain:</span>
                    <span className={`flex items-center gap-1 ${getStatusColor(!!diagnosticResult.domainAnalysis.detectedSubdomain)}`}>
                      {getStatusIcon(!!diagnosticResult.domainAnalysis.detectedSubdomain)}
                      {diagnosticResult.domainAnalysis.detectedSubdomain || 'None'}
                    </span>
                    
                    <span className="text-gray-600">Lovable Org ID:</span>
                    <span className={`flex items-center gap-1 ${getStatusColor(!!diagnosticResult.domainAnalysis.lovableOrgId)}`}>
                      {getStatusIcon(!!diagnosticResult.domainAnalysis.lovableOrgId)}
                      {diagnosticResult.domainAnalysis.lovableOrgId || 'None'}
                    </span>
                    
                    <span className="text-gray-600">Extraction Method:</span>
                    <span>{diagnosticResult.domainAnalysis.debugInfo?.extractionMethod || 'None'}</span>
                    
                    <span className="text-gray-600">Is Church-OS Domain:</span>
                    <span className={getStatusColor(diagnosticResult.domainAnalysis.debugInfo?.isChurchOSDomain)}>
                      {diagnosticResult.domainAnalysis.debugInfo?.isChurchOSDomain ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}

              {/* Organization Lookup */}
              {diagnosticResult.organizationLookup && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Organization Lookup Results</h3>
                  
                  {diagnosticResult.organizationLookup.error ? (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Database Error: {diagnosticResult.organizationLookup.error.message}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <span className="text-gray-600">Total Organizations Found:</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(diagnosticResult.organizationLookup.allOrganizations.length > 0)}`}>
                          {getStatusIcon(diagnosticResult.organizationLookup.allOrganizations.length > 0)}
                          {diagnosticResult.organizationLookup.allOrganizations.length}
                        </span>
                        
                        <span className="text-gray-600">Enabled Organizations:</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(diagnosticResult.organizationLookup.enabledOrganizations.length > 0)}`}>
                          {getStatusIcon(diagnosticResult.organizationLookup.enabledOrganizations.length > 0)}
                          {diagnosticResult.organizationLookup.enabledOrganizations.length}
                        </span>
                        
                        <span className="text-gray-600">Disabled Organizations:</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(diagnosticResult.organizationLookup.disabledOrganizations.length === 0)}`}>
                          {diagnosticResult.organizationLookup.disabledOrganizations.length === 0 ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> : 
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          }
                          {diagnosticResult.organizationLookup.disabledOrganizations.length}
                        </span>
                        
                        <span className="text-gray-600">Selected Organization:</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(!!diagnosticResult.organizationLookup.selectedOrganization)}`}>
                          {getStatusIcon(!!diagnosticResult.organizationLookup.selectedOrganization)}
                          {diagnosticResult.organizationLookup.selectedOrganization?.name || 'None'}
                        </span>
                      </div>

                      {/* Organization Details */}
                      {diagnosticResult.organizationLookup.allOrganizations.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">All Organizations with this Subdomain:</h4>
                          <div className="space-y-2">
                            {diagnosticResult.organizationLookup.allOrganizations.map((org: any, index: number) => (
                              <div key={org.id} className={`p-3 rounded border ${org.website_enabled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{org.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({org.id})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${org.website_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {org.website_enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    {index === 0 && diagnosticResult.organizationLookup.selectedOrganization?.id === org.id && (
                                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">Selected</span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Created: {new Date(org.created_at).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Error Information */}
              {diagnosticResult.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Diagnostic Error: {diagnosticResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : null}
        </CardContent>
        
        {showFooter && (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={runDiagnostic}
              disabled={isRunning}
              className="flex items-center"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Enhanced Diagnostic Again'
              )}
            </Button>
            <div className="flex gap-2">
              <Link to="/settings/domains">
                <Button variant="secondary">
                  Domain Settings
                </Button>
              </Link>
              <Button 
                variant="default" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
};

export default DomainDetectionTester;
