
import { supabase } from '@/integrations/supabase/client';
import { PageData, PageServiceError } from './types';
import { convertJsonToPuckData } from './utils';
import { savePage } from './crud';

export async function getPageTemplates(organizationId: string): Promise<{ id: string; name: string; description: string | null }[]> {
  // Since page_templates table doesn't exist in the schema, return empty array
  console.warn('Page templates table not found in schema');
  return [];
}

export async function getPageTemplate(templateId: string): Promise<{ content: any } | null> {
  // Since page_templates table doesn't exist in the schema, return null
  console.warn('Page templates table not found in schema');
  return null;
}

export async function createPageFromTemplate(templateId: string, organizationId: string): Promise<PageData> {
  const template = await getPageTemplate(templateId);
  if (!template) {
    throw new PageServiceError('Template not found', 'NOT_FOUND');
  }

  const newPage: PageData = {
    title: 'New Page',
    slug: 'new-page',
    content: convertJsonToPuckData(template.content),
    organization_id: organizationId,
    published: false,
    show_in_navigation: true,
    is_homepage: false,
    template_id: templateId,
  };

  return savePage(newPage);
}
