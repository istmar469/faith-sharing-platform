
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrgMember } from './types';

export const useOrgMembers = (organizationId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          user_id,
          users!inner(email)
        `)
        .eq('organization_id', organizationId);
        
      if (error) throw error;
      
      const formattedMembers = users.map((member: any) => ({
        id: member.id,
        email: member.users.email,
        role: member.role,
        user_id: member.user_id,
      }));
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  return {
    members,
    isLoading,
    fetchMembers
  };
};
