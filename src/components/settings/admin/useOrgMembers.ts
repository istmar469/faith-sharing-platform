
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
            .maybeSingle(); // Use maybeSingle instead of single to handle no results case
          
          // Get email from auth.user if user data not found in users table
          if (!userData) {
            console.log(`User not found in users table, trying to get from auth.user metadata for ID ${member.user_id}`);
            const { data: authUser } = await supabase.auth.admin.getUserById(member.user_id);
            
            return {
              id: member.id,
              email: authUser?.user?.email || 'Unknown email',
              role: member.role,
              user_id: member.user_id,
            };
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
