
export type OrganizationData = {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  website_enabled: boolean;
  slug: string;
  custom_domain: string | null;
  role?: string;
};
