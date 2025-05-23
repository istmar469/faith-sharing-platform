
import React from 'react';
import TemplateDialog from '../TemplateDialog';

const TemplatePromptBar: React.FC = () => {
  return (
    <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium text-blue-800">Start with a Template</h3>
        <p className="text-blue-600 text-sm">
          Choose a ready-made template to quickly create your page
        </p>
      </div>
      <TemplateDialog />
    </div>
  );
};

export default TemplatePromptBar;
