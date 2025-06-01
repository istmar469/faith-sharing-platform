
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

// Create a comprehensive mock for Supabase query builder
const createQueryMock = () => ({
  select: vi.fn(() => createQueryMock()),
  insert: vi.fn(() => createQueryMock()),
  update: vi.fn(() => createQueryMock()),
  eq: vi.fn(() => createQueryMock()),
  neq: vi.fn(() => createQueryMock()),
  single: vi.fn(),
  range: vi.fn(),
  order: vi.fn(() => createQueryMock())
});

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => createQueryMock()),
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

      const queryMock = createQueryMock();
      queryMock.single.mockResolvedValue({
        data: mockPageData,
        error: null
      });
      
      mockSupabase.from.mockReturnValue(queryMock);

      const result = await getPage('test-id');
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('pages');
    });

    it('should return null when page not found', async () => {
      const queryMock = createQueryMock();
      queryMock.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      mockSupabase.from.mockReturnValue(queryMock);

      const result = await getPage('non-existent-id');
      expect(result).toBeNull();
    });

    it('should throw PageServiceError on database error', async () => {
      const queryMock = createQueryMock();
      queryMock.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      mockSupabase.from.mockReturnValue(queryMock);

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
      const slugCheckMock = createQueryMock();
      slugCheckMock.eq.mockResolvedValue({
        data: [],
        error: null
      });

      // Mock page creation
      const insertMock = createQueryMock();
      insertMock.single.mockResolvedValue({
        data: mockCreatedPage,
        error: null
      });

      mockSupabase.from.mockReturnValue(slugCheckMock).mockReturnValueOnce(insertMock);

      const result = await savePage(newPageData);
      expect(result).toBeDefined();
      expect(result.id).toBe('new-id');
    });
  });
});
