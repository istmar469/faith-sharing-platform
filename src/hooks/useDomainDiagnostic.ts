
import { useState, useEffect } from 'react';
import { extractSubdomain, isDevelopmentEnvironment, isUuid } from "@/utils/domain";
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  timestamp: string;
  hostname: string;
  fullUrl: string;
  isDev: boolean;
  detectedSubdomain: string | null;
  organizationLookup?: {
    data: any;
    error: any;
  };
  homepageLookup?: {
    data: any;
    error: any;
  };
  domainParts: string[];
  isUuid?: boolean;
  error?: string;
}

export interface DnsConfig {
  status: string | null;
  message: string | null;
}

export function useDomainDiagnostic() {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dnsConfigStatus, setDnsConfigStatus] = useState<string | null>(null);
  const [dnsMessage, setDnsMessage] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    const hostname = window.location.hostname;
    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      hostname: hostname,
      fullUrl: window.location.href,
      isDev: isDevelopmentEnvironment(),
      detectedSubdomain: null,
      domainParts: hostname.split('.'),
    };
    
    try {
      // Check if we can detect a subdomain
      const subdomain = extractSubdomain(hostname);
      result.detectedSubdomain = subdomain;
      result.isUuid = subdomain ? isUuid(subdomain) : false;
      
      // Detect DNS configuration format
      if (hostname.includes('church-os.com')) {
        if (hostname.includes('churches.church-os.com')) {
          const nestedFormat = hostname.split('.').length > 3;
          if (nestedFormat) {
            setDnsConfigStatus('Using subdomain.churches.church-os.com format');
            setDnsMessage('Your DNS is configured with the nested format - CNAME points to churches.church-os.com');
          } else {
            setDnsConfigStatus('Using churches.church-os.com format');
            setDnsMessage('You are directly on the churches.church-os.com domain');
          }
        } else {
          const directFormat = hostname.split('.').length > 2;
          if (directFormat) {
            setDnsConfigStatus('Using subdomain.church-os.com format');
            setDnsMessage('Your DNS is configured with the direct format - CNAME points to church-os.com');
          } else {
            setDnsConfigStatus('Using church-os.com format');
            setDnsMessage('You are directly on the church-os.com domain');
          }
        }
      }
      
      // If subdomain is found, check if it exists in database
      if (subdomain) {
        console.log("Diagnostic: Looking up subdomain in database:", subdomain);
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, subdomain, website_enabled')
          .eq('subdomain', subdomain)
          .maybeSingle();  // Use maybeSingle() instead of single() to avoid errors
          
        result.organizationLookup = { data, error };
        
        if (!error && data) {
          // Check if a homepage exists for this organization
          const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .select('id, title')
            .eq('organization_id', data.id)
            .eq('is_homepage', true)
            .eq('published', true)
            .maybeSingle();  // Use maybeSingle() here too
            
          result.homepageLookup = { data: pageData, error: pageError };
        }
      }
      
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    } finally {
      setDiagnosticResult(result);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run diagnostic automatically on first load
    runDiagnostic();
  }, []);

  return {
    diagnosticResult,
    isRunning,
    dnsConfigStatus,
    dnsMessage,
    runDiagnostic
  };
}
