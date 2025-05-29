/**
 * Development utility to test subdomain detection
 * This helps debug subdomain routing issues in development
 */

import { extractSubdomain, isMainDomain, isDevelopmentEnvironment } from '@/utils/domain';

export interface SubdomainTestResult {
  hostname: string;
  parts: string[];
  detectedSubdomain: string | null;
  isMainDomain: boolean;
  isDevelopment: boolean;
  expectedResult: string | null;
  isCorrect: boolean;
}

/**
 * Test subdomain extraction for various hostname formats
 */
export const testSubdomainExtraction = (testHostnames?: string[]): SubdomainTestResult[] => {
  const defaultTestCases = [
    'localhost',
    'test3.localhost',
    'myorg.localhost',
    'church-os.com',
    'test3.church-os.com',
    'myorg.church-os.com',
    'test.lovable.dev',
    'project.lovable.app'
  ];

  const hostnames = testHostnames || defaultTestCases;
  
  return hostnames.map(hostname => {
    const parts = hostname.split('.');
    const detectedSubdomain = extractSubdomain(hostname);
    const isMain = isMainDomain(hostname);
    const isDev = isDevelopmentEnvironment();
    
    // Determine expected result based on hostname pattern
    let expectedResult: string | null = null;
    if (hostname === 'localhost' || hostname === 'church-os.com') {
      expectedResult = null; // Main domains should have no subdomain
    } else if (hostname.includes('.localhost') || hostname.includes('.church-os.com') || hostname.includes('.lovable.')) {
      expectedResult = parts[0]; // First part should be the subdomain
    }
    
    return {
      hostname,
      parts,
      detectedSubdomain,
      isMainDomain: isMain,
      isDevelopment: isDev,
      expectedResult,
      isCorrect: detectedSubdomain === expectedResult
    };
  });
};

/**
 * Test current browser hostname
 */
export const testCurrentHostname = (): SubdomainTestResult => {
  const hostname = window.location.hostname;
  const results = testSubdomainExtraction([hostname]);
  return results[0];
};

/**
 * Format test results for console output
 */
export const formatTestResults = (results: SubdomainTestResult[]): string => {
  const lines = [
    '=== Subdomain Detection Test Results ===',
    '',
  ];
  
  results.forEach(result => {
    const status = result.isCorrect ? '✅' : '❌';
    lines.push(`${status} ${result.hostname}`);
    lines.push(`   Parts: [${result.parts.join(', ')}]`);
    lines.push(`   Detected: ${result.detectedSubdomain || 'null'}`);
    lines.push(`   Expected: ${result.expectedResult || 'null'}`);
    lines.push(`   Is Main Domain: ${result.isMainDomain}`);
    lines.push('');
  });
  
  const passCount = results.filter(r => r.isCorrect).length;
  lines.push(`Results: ${passCount}/${results.length} tests passed`);
  
  return lines.join('\n');
};

/**
 * Run full test suite and log results
 */
export const runSubdomainTests = (): void => {
  console.group('🧪 Subdomain Detection Tests');
  
  const results = testSubdomainExtraction();
  const formatted = formatTestResults(results);
  console.log(formatted);
  
  console.group('Current Browser Test');
  const currentResult = testCurrentHostname();
  console.log(`Current hostname: ${currentResult.hostname}`);
  console.log(`Detected subdomain: ${currentResult.detectedSubdomain || 'null'}`);
  console.log(`Is main domain: ${currentResult.isMainDomain}`);
  console.log(`Is development: ${currentResult.isDevelopment}`);
  console.groupEnd();
  
  console.groupEnd();
};

// Export for browser console testing
(window as any).runSubdomainTests = runSubdomainTests;
(window as any).testSubdomainExtraction = testSubdomainExtraction; 