
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePageBuilder } from '../context/PageBuilderContext';
import TemplateDialog from '../TemplateDialog';
import { cn } from '@/lib/utils';

const TemplatePromptBar: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = usePageBuilder();
  
  const goToTemplates = () => {
    if (organizationId) {
      navigate(`/dashboard/${organizationId}?tab=templates`);
    } else {
      navigate('/templates');
    }
  };
  
  return (
    <div className={cn(
      "bg-gradient-to-r from-blue-50 to-indigo-50",
      "border-b border-blue-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    )}>
      <div>
        <h3 className="font-medium text-blue-800 text-lg">Start with a Template</h3>
        <p className="text-blue-600 text-sm">
          Choose a ready-made template to quickly build your church website
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
