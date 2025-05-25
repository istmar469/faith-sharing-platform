
import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { extractSubdomain, isMainDomain, isDevelopmentEnvironment } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';

const ContextDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const {
    organizationId,
    organizationName,
    isSubdomainAccess,
    subdomain,
    isContextReady,
    contextError,
    retryContext
  } = useTenantContext();

  const hostname = window.location.hostname;
  const detectedSubdomain = extractSubdomain(hostname);
  const isMainDomainAccess = isMainDomain(hostname);
  const isDev = isDevelopmentEnvironment();

  const testDatabaseConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Test basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from('organizations')
        .select('count')
        .limit(1);

      if (healthError) {
        setTestResult({ type: 'error', message: `Database connection failed: ${healthError.message}` });
        return;
      }

      // Test subdomain lookup if applicable
      if (detectedSubdomain) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, website_enabled, subdomain')
          .eq('subdomain', detectedSubdomain)
          .maybeSingle();

        setTestResult({
          type: orgError ? 'error' : (orgData ? 'success' : 'warning'),
          message: orgError 
            ? `Subdomain lookup failed: ${orgError.message}`
            : orgData 
              ? `Found organization: ${orgData.name} (${orgData.id})`
              : `No organization found for subdomain: ${detectedSubdomain}`,
          data: orgData
        });
      } else {
        setTestResult({ type: 'info', message: 'Database connection successful (no subdomain to test)' });
      }
    } catch (error) {
      setTestResult({ 
        type: 'error', 
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Only show in development or when there's an error
  if (!isDev && !contextError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border rounded-lg shadow-lg transition-all duration-200 ${isOpen ? 'w-96' : 'w-auto'}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-3 w-full text-left hover:bg-gray-50 rounded-lg"
        >
          <Bug className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">Debug Panel</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {isOpen && (
          <div className="p-4 border-t space-y-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Context State</h4>
              <div className="text-xs space-y-1 font-mono bg-gray-50 p-2 rounded">
                <div>Ready: <span className={isContextReady ? 'text-green-600' : 'text-red-600'}>{String(isContextReady)}</span></div>
                <div>Subdomain Access: <span className={isSubdomainAccess ? 'text-green-600' : 'text-gray-600'}>{String(isSubdomainAccess)}</span></div>
                <div>Org ID: <span className="text-blue-600">{organizationId || 'null'}</span></div>
                <div>Org Name: <span className="text-blue-600">{organizationName || 'null'}</span></div>
                <div>Error: <span className="text-red-600">{contextError || 'none'}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Domain Info</h4>
              <div className="text-xs space-y-1 font-mono bg-gray-50 p-2 rounded">
                <div>Hostname: <span className="text-blue-600">{hostname}</span></div>
                <div>Detected Subdomain: <span className="text-blue-600">{detectedSubdomain || 'none'}</span></div>
                <div>Is Main Domain: <span className={isMainDomainAccess ? 'text-green-600' : 'text-gray-600'}>{String(isMainDomainAccess)}</span></div>
                <div>Is Dev: <span className={isDev ? 'text-orange-600' : 'text-gray-600'}>{String(isDev)}</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Actions</h4>
              </div>
              <div className="space-y-2">
                <button
                  onClick={retryContext}
                  className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Context
                </button>
                <button
                  onClick={testDatabaseConnection}
                  disabled={isTestingConnection}
                  className="w-full text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  Test DB Connection
                </button>
              </div>
            </div>

            {testResult && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Test Result</h4>
                <div className={`text-xs p-2 rounded ${
                  testResult.type === 'success' ? 'bg-green-50 text-green-700' :
                  testResult.type === 'error' ? 'bg-red-50 text-red-700' :
                  testResult.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {testResult.message}
                  {testResult.data && (
                    <pre className="mt-1 text-xs">{JSON.stringify(testResult.data, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextDebugPanel;
