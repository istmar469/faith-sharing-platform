import React, { useState } from 'react';
import { Bug, ChevronDown, ChevronUp, RefreshCw, Database } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { extractSubdomain, isMainDomain, isDevelopmentEnvironment } from '@/utils/domain';
import { supabase } from '@/integrations/supabase/client';

const ContextDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isTestingOrgs, setIsTestingOrgs] = useState(false);
  const [orgTestResult, setOrgTestResult] = useState<any>(null);
  
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

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('count')
        .limit(1);
      
      if (error) {
        setTestResult({ 
          success: false, 
          error: error.message,
          details: 'Database connection failed'
        });
      } else {
        setTestResult({ 
          success: true, 
          message: 'Database connection successful',
          details: `Organizations table accessible`
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Exception during connection test'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testOrganizations = async () => {
    setIsTestingOrgs(true);
    try {
      // First, get all organizations
      const { data: allOrgs, error: allError } = await supabase
        .from('organizations')
        .select('id, name, subdomain, website_enabled')
        .limit(10);

      if (allError) {
        setOrgTestResult({
          success: false,
          error: allError.message,
          details: 'Failed to fetch organizations'
        });
        return;
      }

      // Then test the specific subdomain query
      let subdomainResult = null;
      if (detectedSubdomain) {
        const { data: subOrg, error: subError } = await supabase
          .from('organizations')
          .select('id, name, subdomain, website_enabled')
          .eq('subdomain', detectedSubdomain)
          .maybeSingle();

        subdomainResult = { data: subOrg, error: subError };
      }

      setOrgTestResult({
        success: true,
        allOrganizations: allOrgs,
        subdomainQuery: detectedSubdomain,
        subdomainResult,
        message: `Found ${allOrgs?.length || 0} organizations total`
      });

    } catch (error) {
      setOrgTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Exception during organization test'
      });
    } finally {
      setIsTestingOrgs(false);
    }
  };

  const debugInfo = {
    'Current URL': window.location.href,
    'Hostname': hostname,
    'Port': window.location.port,
    'Protocol': window.location.protocol,
    'Is Development': isDev,
    'Is Main Domain': isMainDomainAccess,
    'Detected Subdomain': detectedSubdomain || 'None',
    'Context Ready': isContextReady,
    'Context Error': contextError || 'None',
    'Organization ID': organizationId || 'None',
    'Organization Name': organizationName || 'None',
    'Is Subdomain Access': isSubdomainAccess,
    'Subdomain from Context': subdomain || 'None'
  };

  if (!isDev) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg border border-yellow-500">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-gray-800 rounded-lg"
        >
          <Bug className="h-5 w-5 text-yellow-400" />
          <span className="text-yellow-200">Debug Context</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {isOpen && (
          <div className="p-4 border-t border-gray-700 max-w-lg max-h-[500px] overflow-auto">
            <div className="space-y-2 text-xs">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium text-gray-300">{key}:</span>
                  <span className="text-gray-100 ml-2 break-all">{String(value)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test DB Connection'
                )}
              </button>

              <button
                onClick={testOrganizations}
                disabled={isTestingOrgs}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
              >
                {isTestingOrgs ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="h-3 w-3" />
                    Test Organizations
                  </>
                )}
              </button>
              
              <button
                onClick={retryContext}
                className="w-full bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded text-xs"
              >
                Retry Context
              </button>
            </div>
            
            {testResult && (
              <div className={`mt-3 p-3 rounded text-xs ${
                testResult.success ? 'bg-green-900' : 'bg-red-900'
              }`}>
                <div className="font-medium">
                  {testResult.success ? 'Success' : 'Error'}
                </div>
                <div>{testResult.message || testResult.error}</div>
                {testResult.details && (
                  <div className="text-gray-300 mt-1">{testResult.details}</div>
                )}
              </div>
            )}

            {orgTestResult && (
              <div className={`mt-3 p-3 rounded text-xs ${
                orgTestResult.success ? 'bg-green-900' : 'bg-red-900'
              }`}>
                <div className="font-medium">Organization Test</div>
                {orgTestResult.success ? (
                  <div>
                    <div className="text-green-300">{orgTestResult.message}</div>
                    {orgTestResult.allOrganizations && (
                      <div className="mt-2">
                        <div className="font-medium">All Organizations:</div>
                        {orgTestResult.allOrganizations.length === 0 ? (
                          <div className="text-yellow-300 ml-2">⚠️ No organizations found!</div>
                        ) : (
                          orgTestResult.allOrganizations.map((org: any) => (
                            <div key={org.id} className="text-gray-300 ml-2">
                              • {org.name} (subdomain: {org.subdomain || 'none'})
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {orgTestResult.subdomainQuery && (
                      <div className="mt-2">
                        <div className="font-medium">
                          Query for "{orgTestResult.subdomainQuery}":
                        </div>
                        <div className="text-gray-300 ml-2">
                          {orgTestResult.subdomainResult?.data 
                            ? `✅ Found: ${orgTestResult.subdomainResult.data.name}`
                            : orgTestResult.subdomainResult?.error
                              ? `❌ Error: ${orgTestResult.subdomainResult.error.message}`
                              : '❌ No organization found'
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-300">
                    {orgTestResult.error}
                    {orgTestResult.details && (
                      <div className="mt-1">{orgTestResult.details}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Development Helper */}
            <div className="mt-4 p-3 bg-yellow-900 rounded text-xs">
              <div className="font-medium mb-2">Quick Fix:</div>
              <div className="text-yellow-200 mb-2">
                If no organizations found, run this SQL:
              </div>
              <div className="bg-black p-2 rounded font-mono text-xs text-green-300 overflow-x-auto">
                INSERT INTO organizations (id, name, subdomain, website_enabled)<br/>
                VALUES ('test-org-1', 'Test Organization', 'test3', true);
              </div>
              <div className="mt-2 text-yellow-300 text-xs">
                Then click "Retry Context" above
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextDebugPanel;
