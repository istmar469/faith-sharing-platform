
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import TemplateDialog from '../TemplateDialog';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "No content found for this page" 
}) => {
  return (
    <div className="h-64 sm:h-96 flex flex-col items-center justify-center text-gray-400 px-4 text-center">
      <LayoutGrid className="h-8 w-8 sm:h-12 sm:w-12 mb-2" />
      <p className="text-sm sm:text-base mb-4">{message}</p>
      <TemplateDialog trigger={
        <Button variant="outline" size="sm">
          <LayoutGrid className="h-4 w-4 mr-2" />
          Start with a Template
        </Button>
      } />
    </div>
  );
};

export default EmptyState;
