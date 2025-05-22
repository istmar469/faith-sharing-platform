
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { useDomainDiagnostic } from "@/hooks/useDomainDiagnostic";
import BasicInformation from "./BasicInformation";
import SubdomainDetection from "./SubdomainDetection";
import OrganizationLookup from "./OrganizationLookup";
import HomepageLookup from "./HomepageLookup";

/**
 * Component for testing and diagnosing subdomain detection issues
 */
const DomainDetectionTester: React.FC = () => {
  const {
    diagnosticResult,
    isRunning,
    dnsConfigStatus,
    dnsMessage,
    runDiagnostic
  } = useDomainDiagnostic();

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Domain Detection Diagnostic</CardTitle>
        <CardDescription>
          This tool helps diagnose issues with subdomain detection and routing
        </CardDescription>
      </CardHeader>
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
            Running diagnostics...
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={runDiagnostic}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Diagnostic Again'}
        </Button>
        <Link to="/settings/domains">
          <Button variant="secondary">
            Go to Domain Settings
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DomainDetectionTester;
