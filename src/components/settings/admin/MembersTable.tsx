
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrgMember } from "./types";
import { Badge } from "@/components/ui/badge";

interface MembersTableProps {
  members: OrgMember[];
  isLoading: boolean;
  organizationId?: string;
  onMemberRemoved: () => void;
}

const MembersTable: React.FC<MembersTableProps> = ({ 
  members, 
  isLoading, 
  organizationId,
  onMemberRemoved 
}) => {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleRemoveMember = async (id: string) => {
    if (!organizationId) return;
    
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onMemberRemoved();
      toast({
        title: "Member Removed",
        description: "The member has been removed from your organization",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
        <CardDescription>
          Manage current members and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No members found in this organization.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left font-medium">Email</th>
                  <th className="py-2 px-4 text-left font-medium">Role</th>
                  <th className="py-2 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">{member.email}</td>
                    <td className="py-2 px-4">
                      <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                        {member.role}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isDeleting === member.id}
                      >
                        {isDeleting === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Remove</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembersTable;
