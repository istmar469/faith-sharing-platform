import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, User, Mail, Phone, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  display_order: number;
  is_active: boolean;
  social_links: Record<string, string>;
}

const StaffDirectoryManager: React.FC = () => {
  const { organizationId } = useTenantContext();
  const { toast } = useToast();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    photo_url: '',
    is_active: true,
    social_links: {} as Record<string, string>
  });

  useEffect(() => {
    if (organizationId) {
      fetchStaffMembers();
    }
  }, [organizationId]);

  const fetchStaffMembers = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('organization_id', organizationId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Handle the social_links type conversion
      setStaffMembers((data || []).map(item => ({
        ...item,
        social_links: typeof item.social_links === 'object' && item.social_links !== null
          ? item.social_links as Record<string, string>
          : {}
      })));
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      const staffData = {
        ...formData,
        organization_id: organizationId,
        display_order: staffMembers.length
      };

      if (editingMember) {
        const { error } = await supabase
          .from('staff_members')
          .update(staffData)
          .eq('id', editingMember.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Staff member updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('staff_members')
          .insert([staffData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Staff member added successfully'
        });
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      resetForm();
      fetchStaffMembers();
    } catch (error) {
      console.error('Error saving staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to save staff member',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      phone: member.phone || '',
      photo_url: member.photo_url || '',
      is_active: member.is_active,
      social_links: member.social_links || {}
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Staff member deleted successfully'
      });
      
      fetchStaffMembers();
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      phone: '',
      photo_url: '',
      is_active: true,
      social_links: {}
    });
  };

  const handleOpenDialog = () => {
    setEditingMember(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>Loading staff members...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff Directory</h2>
          <p className="text-gray-600">Manage your church staff and leadership team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Staff Member' : 'Add Staff Member'}
              </DialogTitle>
              <DialogDescription>
                {editingMember ? 'Update staff member information' : 'Add a new staff member to your directory'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position/Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingMember ? 'Update' : 'Add'} Staff Member
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {staffMembers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
              <p className="text-gray-600 mb-4">Add your first staff member to get started</p>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          staffMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                      {member.bio && (
                        <p className="text-gray-600 text-sm mb-3">{member.bio}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {member.email}
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffDirectoryManager;
