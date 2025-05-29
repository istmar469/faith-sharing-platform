import { useEffect, useState } from 'react';
import { checkOrganization } from '@/utils/checkOrganization';

const TestOrganizationCheck = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testCheck = async () => {
      try {
        setLoading(true);
        console.log('Starting organization check...');
        const data = await checkOrganization('test3');
        setResult(data);
      } catch (err) {
        console.error('Test failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    testCheck();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Testing Organization Check</h2>
        <p>Checking for organization with subdomain "test3"...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Organization Check Results</h2>
      
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Query for subdomain: test3</h3>
        
        {result ? (
          <div className="space-y-4">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
              <p className="font-bold">Organization Found!</p>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p>No organization found with subdomain "test3" or custom domain "test3.localhost"</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="font-semibold mb-2">Check your browser's console for detailed logs</h3>
        <p className="text-sm text-gray-600">
          Open developer tools (F12) and look for logs from the checkOrganization function.
        </p>
      </div>
    </div>
  );
};

export default TestOrganizationCheck;
