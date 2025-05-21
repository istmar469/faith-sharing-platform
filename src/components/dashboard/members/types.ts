
export interface MemberType {
  id: string;
  email: string;
  role: string;
  user_id: string;
}

export interface MemberManagementProps {
  organizationId?: string;
  showComingSoonToast?: () => void;
}
