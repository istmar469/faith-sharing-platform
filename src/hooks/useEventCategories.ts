
import { useState, useEffect } from 'react';
import { EventCategory, getEventCategories } from '@/services/eventService';

interface UseEventCategoriesReturn {
  categories: EventCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEventCategories = (organizationId?: string): UseEventCategoriesReturn => {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!organizationId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedCategories = await getEventCategories(organizationId);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching event categories:', err);
      setError('Failed to load event categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [organizationId]);

  return { categories, loading, error, refetch: fetchCategories };
};
