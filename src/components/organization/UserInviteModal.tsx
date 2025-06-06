
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserValidation } from '@/hooks/useUserValidation';

interface UserInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  onInviteSent?: () => void;
}

const ROLES = [
  { value: 'viewer', label: 'Viewer', description: 'Can view content but not edit' },
  { value: 'editor', label: 'Editor', description: 'Can edit content and pages' },
  { value: 'admin', label: 'Admin', description: 'Full access to organization settings' }
];

const UserInviteModal: React.FC<UserInviteModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onInviteSent
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userStatus, setUserStatus] = useState<'checking' | 'new' | 'existing' | null>(null);
  const [existingMemberships, setExistingMemberships] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { checkUserExists } = useUserValidation();

  const handleEmailCheck = async (emailValue: string) => {
    setEmail(emailValue);
    setError('');
    setUserStatus(null);
    setExistingMemberships([]);

    if (!emailValue || !emailValue.includes('@')) return;

    setUserStatus('checking');
    const result = await checkUserExists(emailValue);
    
    if (result.exists) {
      setUserStatus('existing');
      setExistingMemberships(result.organizations || []);
      
      // Check if user is already in this organization
      const isAlreadyMember = result.organizations?.some(
        org => org.organization_id === organizationId
      );
      
      if (isAlreadyMember) {
        setError('This user is already a member of your organization.');
      }
    } else {
      setUserStatus('new');
    }
  };

  const handleInvite = async () => {
    if (!email || !role) {
      setError('Please fill in all fields');
      return;
    }

    if (error) return;

    setLoading(true);
    try {
      const { error: inviteError } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          email: email,
          role: role
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Invitation sent!",
        description: `An invitation has been sent to ${email} to join ${organizationName} as ${role}.`
      });

      setEmail('');
      setRole('editor');
      setUserStatus(null);
      setExistingMemberships([]);
      onInviteSent?.();
      onClose();
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('editor');
    setError('');
    setUserStatus(null);
    setExistingMemberships([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite User to {organizationName}
          </DialogTitle>
          <DialogDescription>
            Send an invitation to add a new member to your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => handleEmailCheck(e.target.value)}
              placeholder="user@example.com"
            />
            
            {userStatus === 'checking' && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking user...
              </p>
            )}
            
            {userStatus === 'new' && (
              <p className="text-sm text-blue-600 mt-1">
                ✓ New user - they'll receive an invitation to create an account
              </p>
            )}
            
            {userStatus === 'existing' && !error && (
              <div className="mt-2">
                <p className="text-sm text-green-600">
                  ✓ Existing user found
                </p>
                {existingMemberships.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Current memberships: {existingMemberships.map(m => m.organization_name).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    <div>
                      <div className="font-medium">{roleOption.label}</div>
                      <div className="text-xs text-gray-500">{roleOption.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={loading || !!error || !email || !role}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserInviteModal;
