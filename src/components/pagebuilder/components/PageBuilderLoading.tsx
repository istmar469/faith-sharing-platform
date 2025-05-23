
import React from 'react';
import { Loader2 } from 'lucide-react';

const PageBuilderLoading: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading page builder...</p>
      </div>
    </div>
  );
};

export default PageBuilderLoading;
