
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePageBuilder } from '../context/PageBuilderContext';
import TemplateDialog from '../TemplateDialog';

const TemplatePromptBar: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = usePageBuilder();
  
  const goToTemplates = () => {
    if (organizationId) {
      navigate(`/tenant-dashboard/${organizationId}/templates`);
    } else {
      navigate('/templates');
    }
  };
  
  return (
    <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium text-blue-800">Start with a Template</h3>
        <p className="text-blue-600 text-sm">
          Choose a ready-made template to quickly create your page
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={goToTemplates}
        >
          <Layout className="h-4 w-4" />
          Browse Templates
        </Button>
        <TemplateDialog />
      </div>
    </div>
  );
};

export default TemplatePromptBar;
