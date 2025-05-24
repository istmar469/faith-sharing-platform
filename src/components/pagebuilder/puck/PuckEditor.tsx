
import React from 'react';
import { Puck } from '@measured/puck';
import { puckConfig } from './config/PuckConfig';
import '@measured/puck/puck.css';

interface PuckEditorProps {
  initialData?: any;
  onChange?: (data: any) => void;
  onSave?: (data: any) => void;
}

const PuckEditor: React.FC<PuckEditorProps> = ({
  initialData,
  onChange,
  onSave
}) => {
  const handleChange = (data: any) => {
    console.log('Puck data changed:', data);
    onChange?.(data);
  };

  const handleSave = (data: any) => {
    console.log('Puck data saved:', data);
    onSave?.(data);
  };

  return (
    <div className="puck-editor-container">
      <Puck
        config={puckConfig}
        data={initialData || { content: [], root: {} }}
        onChange={handleChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default PuckEditor;
