import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Page, savePage, PageElement } from '@/services/pages';
import { useParams, useSearchParams } from 'react-router-dom';

// Define the context state and handlers
interface PageBuilderContextType {
  pageId: string | null;
  setPageId: (id: string | null) => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageSlug: string;
  setPageSlug: (slug: string) => void;
  metaTitle: string;
  setMetaTitle: (metaTitle: string) => void;
  metaDescription: string;
  setMetaDescription: (metaDescription: string) => void;
  parentId: string | null;
  setParentId: (id: string | null) => void;
  showInNavigation: boolean;
  setShowInNavigation: (show: boolean) => void;
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
  isHomepage: boolean;
  setIsHomepage: (isHomepage: boolean) => void;
  pageElements: PageElement[];
  setPageElements: (elements: PageElement[]) => void;
  addElement: (element: Omit<PageElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<PageElement>) => void;
  removeElement: (id: string) => void;
  reorderElements: (startIndex: number, endIndex: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  savePage: () => Promise<void>;
  isSaving: boolean;
}

// Create the context with an undefined default value
const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

// Custom hook to use the page builder context
export const usePageBuilder = () => {
  const context = useContext(PageBuilderContext);
  if (context === undefined) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
};

interface PageBuilderProviderProps {
  children: ReactNode;
}

export const PageBuilderProvider: React.FC<PageBuilderProviderProps> = ({ children }) => {
  // State for page metadata
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  const [pageSlug, setPageSlug] = useState<string>("");
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [showInNavigation, setShowInNavigation] = useState<boolean>(true);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isHomepage, setIsHomepage] = useState<boolean>(false);
  
  // State for page elements
  const [pageElements, setPageElements] = useState<PageElement[]>([]);
  
  // State for UI
  const [activeTab, setActiveTab] = useState<string>("elements");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Get URL search params (for organization_id if provided)
  const [searchParams] = useSearchParams();
  const orgIdFromUrl = searchParams.get('organization_id');

  // Get the user's organization ID
  useEffect(() => {
    const getOrganizationId = async () => {
      // First check if organization_id was provided in URL
      if (orgIdFromUrl) {
        console.log("Using organization ID from URL:", orgIdFromUrl);
        setOrganizationId(orgIdFromUrl);
        return;
      }
      
      // Otherwise fetch from user's membership
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          console.log("Found organization ID:", data.organization_id);
          setOrganizationId(data.organization_id);
        } else {
          console.error("Error getting organization ID:", error);
          toast({
            title: "Error",
            description: "Could not determine your organization. Please try again or contact support.",
            variant: "destructive"
          });
        }
      } else {
        console.error("No authenticated user found");
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to use the page builder.",
          variant: "destructive"
        });
      }
    };
    
    getOrganizationId();
  }, [orgIdFromUrl, toast]);

  // Add a new element to the page
  const addElement = (element: Omit<PageElement, 'id'>) => {
    const newElement = {
      ...element,
      id: Date.now().toString(), // Simple ID generation
    };
    setPageElements([...pageElements, newElement]);
  };

  // Update an existing element
  const updateElement = (id: string, updates: Partial<PageElement>) => {
    setPageElements(
      pageElements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  // Remove an element and all its children recursively
  const removeElement = (id: string) => {
    // Find all children of this element
    const childrenIds = getChildrenIds(id);
    
    // Remove the element and all its children
    setPageElements(pageElements.filter((element) => 
      element.id !== id && !childrenIds.includes(element.id)
    ));
    
    if (selectedElementId === id || childrenIds.includes(selectedElementId || '')) {
      setSelectedElementId(null);
    }
  };

  // Helper function to get all children IDs recursively
  const getChildrenIds = (parentId: string): string[] => {
    const directChildren = pageElements
      .filter(element => element.parentId === parentId)
      .map(element => element.id);
      
    const nestedChildren = directChildren.flatMap(childId => getChildrenIds(childId));
    
    return [...directChildren, ...nestedChildren];
  };

  // Reorder elements (for drag and drop functionality)
  const reorderElements = (startIndex: number, endIndex: number) => {
    const result = Array.from(pageElements);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setPageElements(result);
  };

  // Save the current page to the database
  const handleSavePage = async () => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization ID is missing. Please log in again or refresh the page.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Generate slug if empty
      const slug = pageSlug || pageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // If setting this as homepage, unset any existing homepage
      if (isHomepage) {
        // Find the current homepage
        const { data: currentHomepage } = await supabase
          .from('pages')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('is_homepage', true)
          .neq('id', pageId || 'none'); // Exclude current page
          
        // Unset existing homepage if one exists
        if (currentHomepage && currentHomepage.length > 0) {
          await supabase
            .from('pages')
            .update({ is_homepage: false })
            .eq('id', currentHomepage[0].id);
        }
      }
      
      // Create page object - ensure all properties match the Page interface
      const page: Page = {
        id: pageId || undefined,
        title: pageTitle,
        slug: slug,
        content: pageElements,
        published: isPublished,
        show_in_navigation: showInNavigation,
        is_homepage: isHomepage,
        meta_title: metaTitle || pageTitle,
        meta_description: metaDescription,
        parent_id: parentId,
        organization_id: organizationId
      };

      console.log("Saving page with organizationId:", organizationId);
      
      // Save to database
      const savedPage = await savePage(page);
      
      // Update local state with saved data
      setPageId(savedPage.id);
      setPageSlug(savedPage.slug);
      
      toast({
        title: "Page Saved",
        description: "Your page has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving your page. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const value: PageBuilderContextType = {
    pageId,
    setPageId,
    pageTitle,
    setPageTitle,
    pageSlug,
    setPageSlug,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    parentId,
    setParentId,
    showInNavigation,
    setShowInNavigation,
    isPublished,
    setIsPublished,
    isHomepage,
    setIsHomepage,
    pageElements,
    setPageElements,
    addElement,
    updateElement,
    removeElement,
    reorderElements,
    activeTab,
    setActiveTab,
    selectedElementId,
    setSelectedElementId,
    organizationId,
    setOrganizationId,
    savePage: handleSavePage,
    isSaving
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
};
