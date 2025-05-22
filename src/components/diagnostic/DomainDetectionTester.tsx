
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useDomainDiagnostic } from "@/hooks/useDomainDiagnostic";
import BasicInformation from "./BasicInformation";
import SubdomainDetection from "./SubdomainDetection";
import OrganizationLookup from "./OrganizationLookup";
import HomepageLookup from "./HomepageLookup";
import DiagnosticNavHeader from "./DiagnosticNavHeader";

interface DomainDetectionTesterProps {
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  embedded?: boolean;
  titleOverride?: string;
}

/**
 * Component for testing and diagnosing subdomain detection issues
 */
const DomainDetectionTester: React.FC<DomainDetectionTesterProps> = ({ 
  showHeader = true, 
  showFooter = true, 
  showNavigation = false,
  embedded = false,
  titleOverride
}) => {
  const {
    diagnosticResult,
    isRunning,
    dnsConfigStatus,
    dnsMessage,
    runDiagnostic
  } = useDomainDiagnostic();
  
  const [showTips, setShowTips] = useState(false);

  return (
    <>
      {showNavigation && (
        <DiagnosticNavHeader 
          title="Domain Detection Diagnostic"
          description="This tool helps diagnose issues with subdomain detection and verify organization subdomain registration"
        />
      )}

      <Card className={embedded ? "" : "max-w-2xl mx-auto my-8"}>
        {showHeader && (
          <CardHeader>
            <CardTitle>{titleOverride || "Domain Detection Diagnostic"}</CardTitle>
            <CardDescription>
              This tool helps diagnose issues with subdomain detection and verify organization subdomain registration
            </CardDescription>
            
            {showTips && (
              <Alert className="mt-2 bg-blue-50 border-blue-100">
                <AlertDescription className="text-blue-700 text-sm">
                  <p className="font-semibold mb-1">Quick Tips for Troubleshooting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>If using Cloudflare, make sure proxy is disabled (gray cloud) for subdomains</li>
                    <li>Ensure your organization has a unique subdomain registered</li>
                    <li>Verify the website_enabled flag is set to true for your organization</li>
                    <li>Check that you have a published homepage for your organization</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)}>
                {showTips ? 'Hide Tips' : 'Show Tips'}
              </Button>
            </div>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {diagnosticResult ? (
            <div className="space-y-4">
              <BasicInformation 
                diagnosticResult={diagnosticResult}
                dnsConfigStatus={dnsConfigStatus}
                dnsMessage={dnsMessage}
              />
              
              <SubdomainDetection diagnosticResult={diagnosticResult} />
              
              {diagnosticResult.organizationLookup && (
                <OrganizationLookup organizationLookup={diagnosticResult.organizationLookup} />
              )}
              
              {diagnosticResult.homepageLookup && (
                <HomepageLookup homepageLookup={diagnosticResult.homepageLookup} />
              )}
              
              {diagnosticResult.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error during diagnosis: {diagnosticResult.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                Diagnostic run at: {new Date(diagnosticResult.timestamp).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-3 text-gray-400" />
              Running diagnostics...
            </div>
          )}
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
                'Run Diagnostic Again'
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
