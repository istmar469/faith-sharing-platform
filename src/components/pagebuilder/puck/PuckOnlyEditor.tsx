
import React, { useEffect, useMemo, useCallback } from 'react';
import { Puck, Data } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
import { createPuckOverrides } from './config/PuckOverrides';
import { useTenantContext } from '@/components/context/TenantContext';
import '@measured/puck/puck.css';
import './styles/puck-overrides.css';

interface PuckOnlyEditorProps {
  initialData?: Data;
  onChange?: (data: Data) => void;
  onSave?: (data: Data) => void;
  organizationId: string;
  mode?: 'edit' | 'preview';
}

const PuckOnlyEditor: React.FC<PuckOnlyEditorProps> = React.memo(({
  initialData,
  onChange,
  onSave,
  organizationId,
  mode = 'edit'
}) => {
  const { organizationName, subdomain } = useTenantContext();
  
  console.log('PuckOnlyEditor: Rendering', {
    hasInitialData: !!initialData,
    organizationId,
    organizationName,
    subdomain,
    mode,
    contentLength: initialData?.content?.length || 0
  });

  // Memoize editor data to prevent object recreation
  const editorData: Data = useMemo(() => {
    return initialData || { 
      content: [], 
      root: { 
        props: {} 
      } 
    } as Data;
  }, [initialData]);

  // Memoize the change handler to prevent recreation
  const handleChange = useCallback((data: Data) => {
    console.log('PuckOnlyEditor: Data changed', {
      contentCount: data?.content?.length || 0,
      hasRoot: !!data?.root
    });
    onChange?.(data);
  }, [onChange]);

  // Memoize the publish handler to prevent recreation
  const handlePublish = useCallback((data: Data) => {
    console.log('PuckOnlyEditor: Publishing data via Puck interface', data);
    onSave?.(data);
  }, [onSave]);

  // Minimal overrides to prevent conflicts
  const puckOverrides = useMemo(() => {
    return createPuckOverrides({
      organizationName: organizationName || 'Your Church',
      organizationId,
      subdomain: subdomain || undefined,
      onBackToDashboard: () => {
        window.location.href = `/dashboard/${organizationId}`;
      }
    });
  }, [organizationName, organizationId, subdomain]);

  useEffect(() => {
    console.log('PuckOnlyEditor: Mounted with data', editorData);
  }, []);

  return (
    <div className="puck-editor-wrapper">
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
      />
    </div>
  );
});

PuckOnlyEditor.displayName = 'PuckOnlyEditor';

export default PuckOnlyEditor;
