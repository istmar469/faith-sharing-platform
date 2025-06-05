
import React, { useEffect } from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
import { createPuckOverrides } from './config/PuckOverrides';
import { useTenantContext } from '@/components/context/TenantContext';
import '@measured/puck/puck.css';
import './styles/puck-overrides.css';
// Import collision detection patch FIRST to prevent drag errors
import './config/CollisionDetectionPatch';

interface MobilePuckEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onSave?: (data: any) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const MobilePuckEditor: React.FC<MobilePuckEditorProps> = ({
  initialData,
  onChange,
  onSave,
  organizationId,
  mode = 'edit'
}) => {
  const { organizationName, subdomain } = useTenantContext();
  
  console.log('MobilePuckEditor: Rendering', {
    hasInitialData: !!initialData,
    organizationId,
    organizationName,
    subdomain,
    mode,
    contentLength: initialData?.content?.length || 0
  });

  const handleChange = (data: any) => {
    console.log('MobilePuckEditor: Data changed', {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root
    });
    onChange?.(data);
  };

  const handlePublish = (data: any) => {
    console.log('MobilePuckEditor: Publishing data', data);
    onSave?.(data);
  };

  // Ensure we have valid data structure
  const editorData = initialData || { 
    content: [], 
    root: { 
      props: { 
        title: '' 
      } 
    } 
  };

  // Create overrides with organization context
  const puckOverrides = createPuckOverrides({
    organizationName: organizationName || 'Your Church',
    organizationId,
    subdomain: subdomain || undefined,
    onPreview: () => {
      if (subdomain) {
        window.open(`https://${subdomain}.church-os.com`, '_blank');
      }
    },
    onBackToDashboard: () => {
      window.location.href = `/dashboard/${organizationId}`;
    }
  });

  useEffect(() => {
    console.log('MobilePuckEditor: Mounted with data', editorData);
  }, []);

  return (
    <div className="puck-editor-wrapper h-full">
      <Puck
        config={puckConfig}
        data={editorData}
        onChange={handleChange}
        onPublish={handlePublish}
        overrides={puckOverrides}
        permissions={{
          drag: true,
          edit: true,
          insert: true,
          delete: true,
        }}
        viewports={[
          { width: 375, height: 812, label: 'Mobile' }
        ]}
      />
    </div>
  );
};

export default MobilePuckEditor;
