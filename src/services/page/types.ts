
import { z } from 'zod';

// Validation schemas
export const pageContentSchema = z.object({
  content: z.any(),
  root: z.any(),
});

export const pageDataSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  content: pageContentSchema,
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  organization_id: z.string().uuid(),
  published: z.boolean(),
  show_in_navigation: z.boolean(),
  is_homepage: z.boolean(),
  version: z.number().int().positive().optional(),
  scheduled_publish_at: z.string().datetime().nullable().optional(),
  template_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
});

export type PageData = z.infer<typeof pageDataSchema>;

export class PageServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PageServiceError';
  }
}
