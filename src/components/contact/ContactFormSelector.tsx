
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTenantContext } from '@/components/context/TenantContext';
import { supabase } from '@/integrations/supabase/client';

interface ContactForm {
  id: string;
  name: string;
  slug: string;
}

interface ContactFormSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
}

const ContactFormSelector: React.FC<ContactFormSelectorProps> = ({ 
  value, 
  onChange, 
  onCreateNew 
}) => {
  const { organizationId } = useTenantContext();
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      loadForms();
    }
  }, [organizationId]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_forms')
        .select('id, name, slug')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading forms:', error);
        return;
      }

      setForms(data || []);
    } catch (error) {
      console.error('Error loading contact forms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading forms...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a contact form" />
        </SelectTrigger>
        <SelectContent>
          {forms.map((form) => (
            <SelectItem key={form.id} value={form.id}>
              {form.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {forms.length === 0 && (
        <p className="text-sm text-gray-500">
          No contact forms found. Create one in your dashboard first.
        </p>
      )}
      
      {onCreateNew && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateNew}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Form
        </Button>
      )}
    </div>
  );
};

export default ContactFormSelector;
