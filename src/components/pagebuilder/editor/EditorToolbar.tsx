
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, Loader2 } from 'lucide-react';

interface EditorToolbarProps {
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  saving,
  onSave,
  onPreview
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <Button 
        onClick={onSave} 
        disabled={saving}
        className="flex items-center gap-2"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? 'Saving...' : 'Save'}
      </Button>
      <Button 
        variant="outline" 
        onClick={onPreview}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
    </div>
  );
};

export default EditorToolbar;
