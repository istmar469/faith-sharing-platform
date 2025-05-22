
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberType } from './types';

export const useMemberManagement = (organizationId: string | undefined) => {
  const [members, setMembers] = useState<MemberType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!organizationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('id, role, user_id')
        .eq('organization_id', organizationId);
        
      if (membersError) throw membersError;
      
      if (membersData && membersData.length > 0) {
        // Then fetch user details for each member
        const memberPromises = membersData.map(async (member: any) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', member.user_id)
            .maybeSingle(); // Use maybeSingle instead of single
          
          if (!userData) {
            // Try to get user email from auth
            try {
              const { data: authUser } = await supabase.auth.getUser(member.user_id);
              return {
                id: member.id,
                email: authUser?.user?.email || 'Unknown email',
                role: member.role,
                user_id: member.user_id,
              };
            } catch (authError) {
              console.warn(`Could not fetch user details for ID ${member.user_id}:`, authError);
              return {
                id: member.id,
                email: 'Unknown user',
                role: member.role,
                user_id: member.user_id,
              };
            }
          }
          
          return {
            id: member.id,
            email: userData?.email || 'Unknown email',
            role: member.role,
            user_id: member.user_id,
          };
        });
        
        const resolvedMembers = await Promise.all(memberPromises);
        
        // Filter out super_admin users to not show them in the interface
        const filteredMembers = resolvedMembers.filter(member => member.role !== 'super_admin');
        setMembers(filteredMembers);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setError(error.message || 'Failed to load organization members');
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

  const handleRetry = () => {
    setError(null);
    fetchMembers();
  };

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    handleRetry
  };
};
