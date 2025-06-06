
import React, { useState, useEffect } from 'react';
import { usePageBuilder } from './context/PageBuilderContext';
import TierBasedPuckEditor from './TierBasedPuckEditor';
import { safeCastToPuckData } from './utils/puckDataHelpers';
import { toast } from 'sonner';

interface PuckPageBuilderProps {
  onPublish?: () => void;
  onPreview?: () => void;
  onBackToDashboard?: () => void;
}

const PuckPageBuilder: React.FC<PuckPageBuilderProps> = ({
  onPublish,
  onPreview,
  onBackToDashboard
}) => {
  const {
    pageElements,
    setPageElements,
    savePage,
    isSaving,
    pageTitle,
    organizationId
  } = usePageBuilder();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSave = async (newData: any) => {
    try {
      console.log('PuckPageBuilder: Saving data:', newData);
      
      // Ensure data is in correct format
      const safeData = safeCastToPuckData(newData);
      setPageElements(safeData);
      
      const success = await savePage();
      if (success) {
        setHasUnsavedChanges(false);
        toast.success('Page saved successfully!');
        onPublish?.();
      }
    } catch (error) {
      console.error('PuckPageBuilder: Save error:', error);
      toast.error('Failed to save page');
    }
  };

  const handleDataChange = (newData: any) => {
    setPageElements(safeCastToPuckData(newData));
    setHasUnsavedChanges(true);
  };

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
          <p className="text-gray-600">Please select an organization to continue.</p>
        </div>
      </div>
    );
  }

  console.log('PuckPageBuilder: Rendering with data:', pageElements);

  return (
    <TierBasedPuckEditor
      data={pageElements}
      onSave={handleSave}
      headerProps={{
        onPreview,
        onPublish: () => handleSave(pageElements),
        onBackToDashboard
      }}
    />
  );
};

export default PuckPageBuilder;
