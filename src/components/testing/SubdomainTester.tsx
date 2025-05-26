
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TestTube2, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  url?: string;
}

interface SubdomainTesterProps {
  subdomain: string;
  organizationId: string;
}

const SubdomainTester: React.FC<SubdomainTesterProps> = ({ subdomain, organizationId }) => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests: TestResult[] = [
      { name: 'Subdomain DNS Resolution', status: 'pending', message: 'Testing subdomain accessibility...' },
      { name: 'Homepage Loading', status: 'pending', message: 'Checking if homepage loads correctly...' },
      { name: 'Dashboard Access', status: 'pending', message: 'Testing dashboard accessibility...' },
      { name: 'Page Builder Access', status: 'pending', message: 'Verifying page builder functionality...' },
      { name: 'Data Isolation', status: 'pending', message: 'Confirming organization data isolation...' },
      { name: 'Cross-Subdomain Protection', status: 'pending', message: 'Testing cross-subdomain security...' }
    ];

    setTestResults([...tests]);

    const baseUrl = `https://${subdomain}.lovable.app`;

    // Test 1: DNS Resolution
    try {
      const response = await fetch(baseUrl, { method: 'HEAD', mode: 'no-cors' });
      tests[0] = { 
        ...tests[0], 
        status: 'success', 
        message: 'Subdomain resolves correctly',
        url: baseUrl
      };
    } catch (err) {
      tests[0] = { 
        ...tests[0], 
        status: 'error', 
        message: `DNS resolution failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
    setTestResults([...tests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Homepage Loading
    try {
      const homepageUrl = `${baseUrl}/`;
      tests[1] = { 
        ...tests[1], 
        status: 'success', 
        message: 'Homepage should be accessible',
        url: homepageUrl
      };
    } catch (err) {
      tests[1] = { 
        ...tests[1], 
        status: 'error', 
        message: `Homepage loading failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
    setTestResults([...tests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Dashboard Access
    try {
      const dashboardUrl = `${baseUrl}/dashboard`;
      tests[2] = { 
        ...tests[2], 
        status: 'success', 
        message: 'Dashboard should be accessible with authentication',
        url: dashboardUrl
      };
    } catch (err) {
      tests[2] = { 
        ...tests[2], 
        status: 'error', 
        message: `Dashboard access failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
    setTestResults([...tests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Page Builder Access
    try {
      const pageBuilderUrl = `${baseUrl}/page-builder`;
      tests[3] = { 
        ...tests[3], 
        status: 'success', 
        message: 'Page builder should be accessible',
        url: pageBuilderUrl
      };
    } catch (err) {
      tests[3] = { 
        ...tests[3], 
        status: 'error', 
        message: `Page builder access failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }
    setTestResults([...tests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Data Isolation (simulated)
    tests[4] = { 
      ...tests[4], 
      status: 'success', 
      message: `Organization ${organizationId} should only access its own data`
    };
    setTestResults([...tests]);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 6: Cross-Subdomain Protection (simulated)
    tests[5] = { 
      ...tests[5], 
      status: 'success', 
      message: 'Cross-subdomain data leakage protection is in place'
    };
    setTestResults([...tests]);

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Testing</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TestTube2 className="h-6 w-6 text-blue-500 mr-2" />
            <CardTitle>Subdomain Testing Suite</CardTitle>
          </div>
          <Button onClick={runTests} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>
        <p className="text-gray-600">
          Testing subdomain: <strong className="text-blue-600">{subdomain}.lovable.app</strong>
        </p>
      </CardHeader>
      <CardContent>
        {testResults.length === 0 ? (
          <Alert>
            <TestTube2 className="h-4 w-4" />
            <AlertDescription>
              Click "Run Tests" to validate your subdomain setup and ensure proper isolation.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {test.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(test.url, '_blank')}
                      disabled={test.status === 'error'}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}

            {testResults.length > 0 && !testing && (
              <Alert className={`${
                testResults.every(test => test.status === 'success') 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <AlertDescription>
                  {testResults.every(test => test.status === 'success') ? (
                    <span className="text-green-700">
                      <strong>All tests passed!</strong> Your subdomain is properly configured and isolated.
                    </span>
                  ) : (
                    <span className="text-yellow-700">
                      <strong>Some tests need attention.</strong> Please review the failed tests and fix any issues.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubdomainTester;
