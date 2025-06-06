import React, { useState, useEffect } from 'react';
import { Render } from '@measured/puck';
import { puckConfig } from '@/components/pagebuilder/puck/config/PuckConfig';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/components/context/TenantContext';
import '@measured/puck/puck.css';

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

interface SiteElement {
  id: string;
  type: 'header' | 'footer';
  content: any;
  published: boolean;
  organization_id: string;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ children }) => {
  const { organizationId } = useTenantContext();
  const [header, setHeader] = useState<SiteElement | null>(null);
  const [footer, setFooter] = useState<SiteElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSiteElements = async () => {
      console.log('🎨 PublicPageLayout: Loading site elements for organization:', organizationId);
      
      if (!organizationId) {
        console.log('❌ PublicPageLayout: No organization ID available');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 PublicPageLayout: Querying site_elements table...');
        // Use any type to bypass TypeScript issues with the new table
        const { data, error } = await (supabase as any)
          .from('site_elements')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('published', true)
          .in('type', ['header', 'footer']);

        console.log('📊 PublicPageLayout: Query result:', { data, error });

        if (error) {
          console.error('❌ PublicPageLayout: Error loading site elements:', error);
        } else if (data) {
          console.log('📝 PublicPageLayout: Found', data.length, 'site elements');
          
          const headerElement = data.find((el: any) => el.type === 'header');
          const footerElement = data.find((el: any) => el.type === 'footer');
          
          console.log('🔝 PublicPageLayout: Header element:', headerElement ? 'Found' : 'Not found');
          console.log('🔻 PublicPageLayout: Footer element:', footerElement ? 'Found' : 'Not found');
          
          setHeader(headerElement || null);
          setFooter(footerElement || null);
        } else {
          console.log('📭 PublicPageLayout: No site elements found');
        }
      } catch (err) {
        console.error('💥 PublicPageLayout: Exception loading site elements:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSiteElements();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  console.log('🎯 PublicPageLayout: Rendering with header:', !!header, 'footer:', !!footer);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      {header && header.content && (
        <header className="w-full">
          <Render config={puckConfig} data={header.content} />
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      {footer && footer.content && (
        <footer className="w-full">
          <Render config={puckConfig} data={footer.content} />
        </footer>
      )}
    </div>
  );
};

export default PublicPageLayout; 