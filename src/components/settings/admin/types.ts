
import { z } from "zod";

export type OrgMember = {
  id: string;
  email: string;
  role: string;
  user_id: string;
};

export const roleSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "editor", "member"], {
    required_error: "Please select a role",
  }),
  password: z.string().optional(),
  temporaryPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export interface AdminComponentProps {
  organizationId?: string;
  onSuccess?: () => void;
}
