
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTenantContext } from '@/components/context/TenantContext';
import MinimalEditor from '@/components/pagebuilder/MinimalEditor';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PageBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId?: string }>();
  const { organizationId, isSubdomainAccess } = useTenantContext();

  const handleSave = (data: any) => {
    console.log('Saving page data:', data);
    // TODO: Implement actual save functionality
  };

  const handleBackToDashboard = () => {
    if (isSubdomainAccess) {
      navigate('/');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToDashboard}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Page Builder</h1>
          </div>
          
          {organizationId && (
            <div className="text-sm text-muted-foreground">
              Organization: {organizationId}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <MinimalEditor
          initialData={null}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default PageBuilderPage;
