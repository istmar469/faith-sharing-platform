
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  savePage, 
  getPage, 
  getPageBySlug, 
  getOrganizationPages, 
  getHomepage, 
  duplicatePage,
  PageServiceError,
  type PageData 
} from '@/services/pageService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        range: vi.fn(),
        order: vi.fn(() => ({
          range: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      neq: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  })),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock cache
vi.mock('@/utils/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}));

describe('PageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPage', () => {
    it('should fetch a page by id', async () => {
      const mockPageData = {
        id: 'test-id',
        title: 'Test Page',
        slug: 'test-page',
        content: { content: [], root: {} },
        organization_id: 'org-id',
        published: true,
        show_in_navigation: true,
        is_homepage: false
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockPageData,
        error: null
      });

      const result = await getPage('test-id');
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('pages');
    });

    it('should return null when page not found', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await getPage('non-existent-id');
      expect(result).toBeNull();
    });

    it('should throw PageServiceError on database error', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(getPage('test-id')).rejects.toThrow(PageServiceError);
    });
  });

  describe('savePage', () => {
    it('should create a new page', async () => {
      const newPageData: PageData = {
        title: 'New Page',
        slug: 'new-page',
        content: { content: [], root: {} },
        organization_id: 'org-id',
        published: false,
        show_in_navigation: true,
        is_homepage: false
      };

      const mockCreatedPage = {
        ...newPageData,
        id: 'new-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock slug uniqueness check
      mockSupabase.from().select().eq().eq.mockResolvedValue({
        data: [],
        error: null
      });

      // Mock page creation
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockCreatedPage,
        error: null
      });

      const result = await savePage(newPageData);
      expect(result).toBeDefined();
      expect(result.id).toBe('new-id');
    });
  });
});
