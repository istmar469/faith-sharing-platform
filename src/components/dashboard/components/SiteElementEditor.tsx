import React, { useState, useEffect, useCallback } from 'react';
import { Puck } from '@measured/puck';
import type { Data } from '@measured/puck';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import { Button } from '@/components/ui/button';

interface SiteElementEditorProps {
  type: 'header' | 'footer';
}

const SiteElementEditor: React.FC<SiteElementEditorProps> = ({ type }) => {
  const { organizationId } = useTenantContext();
  const { toast } = useToast();
  const [element, setElement] = useState<any>(null);
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchElement = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_elements')
      .select('id, content, published')
      .eq('organization_id', organizationId)
      .eq('type', type)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({ title: `Error fetching ${type}`, description: error.message, variant: 'destructive' });
    } else if (data) {
      setElement(data);
      setInitialData(data.content as Data || { content: [], root: {} });
    } else {
      setInitialData({ content: [], root: {} });
      setElement(null);
    }
    setIsLoading(false);
  }, [organizationId, type, toast]);

  useEffect(() => {
    fetchElement();
  }, [fetchElement]);

  const handleSave = async (data: Data) => {
    if (!organizationId) return;

    const elementData = {
      organization_id: organizationId,
      type: type,
      content: data,
      updated_at: new Date().toISOString(),
    };

    let response;
    if (element?.id) {
      response = await supabase.from('site_elements').update(elementData as any).eq('id', element.id);
    } else {
      response = await supabase.from('site_elements').insert({ ...elementData, created_at: new Date().toISOString() } as any);
    }

    if (response.error) {
      toast({ title: `Error saving ${type}`, description: response.error.message, variant: 'destructive' });
    } else {
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} saved` });
      fetchElement();
    }
  };

  const handlePublish = async () => {
    if (!element?.id) {
      toast({ title: 'Cannot publish', description: 'Please save the content first.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('site_elements')
      .update({ published: !element.published })
      .eq('id', element.id);

    if (error) {
      toast({ title: `Error updating publish status`, description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Successfully ${element.published ? 'unpublished' : 'published'} the ${type}` });
      fetchElement();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!initialData) {
    return <div>Could not load editor.</div>;
  }

  return (
    <div>
      <Puck
        config={puckConfig}
        data={initialData}
        onSave={handleSave}
        headerActions={
          <>
            <Button onClick={handlePublish} variant={element?.published ? 'destructive' : 'default'}>
              {element?.published ? 'Unpublish' : 'Publish'}
            </Button>
          </>
        }
      />
    </div>
  );
};

export default SiteElementEditor; 