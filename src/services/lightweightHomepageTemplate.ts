
export const getLightweightHomepageContent = (organizationName: string = 'Our Church') => {
  return {
    time: Date.now(),
    blocks: [
      {
        id: "welcome-header",
        type: "header",
        data: {
          text: `Welcome to ${organizationName}`,
          level: 1
        }
      },
      {
        id: "welcome-message",
        type: "paragraph",
        data: {
          text: "We're glad you're here. This is your homepage where you can share your church's story, service times, and connect with your community."
        }
      },
      {
        id: "getting-started",
        type: "header",
        data: {
          text: "Getting Started",
          level: 2
        }
      },
      {
        id: "next-steps",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "Click anywhere to start editing this page",
            "Add your service times and contact information",
            "Upload photos and customize your content",
            "Publish when you're ready to go live"
          ]
        }
      }
    ],
    version: "2.30.8"
  };
};

export const createLightweightHomepage = async (organizationId: string, organizationName: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  console.log('Creating lightweight homepage for:', organizationName);
  
  const pageData = {
    title: `Welcome to ${organizationName}`,
    slug: 'home',
    content: getLightweightHomepageContent(organizationName),
    published: true,
    show_in_navigation: false,
    is_homepage: true,
    meta_title: `${organizationName} - Welcome`,
    meta_description: `Welcome to ${organizationName}. Join us for worship, fellowship, and spiritual growth.`,
    organization_id: organizationId
  };

  const { data, error } = await supabase
    .from('pages')
    .insert(pageData)
    .select()
    .single();

  if (error) {
    console.error('Error creating lightweight homepage:', error);
    throw error;
  }

  console.log('Lightweight homepage created successfully:', data);
  return data;
};
