
export const getDefaultHomepageContent = (organizationName: string = 'Our Church') => {
  return {
    time: Date.now(),
    blocks: [
      {
        id: "hero-section",
        type: "paragraph",
        data: {
          text: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 8px; margin-bottom: 2rem;">
            <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">Welcome to ${organizationName}</h1>
            <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">Join us in worship, fellowship, and growing in faith together</p>
            <div style="background: rgba(255,255,255,0.2); padding: 1rem; border-radius: 6px; display: inline-block;">
              <p style="margin: 0; font-weight: 600;">Sunday Services: 9:00 AM & 11:00 AM</p>
            </div>
          </div>`
        }
      },
      {
        id: "welcome-message",
        type: "header",
        data: {
          text: "Welcome to Our Church Family",
          level: 2
        }
      },
      {
        id: "welcome-text",
        type: "paragraph",
        data: {
          text: "We are a vibrant community of believers dedicated to loving God and serving others. Whether you're seeking spiritual growth, meaningful connections, or ways to make a difference in our community, you'll find a warm welcome here."
        }
      },
      {
        id: "service-times-header",
        type: "header",
        data: {
          text: "Service Times",
          level: 2
        }
      },
      {
        id: "service-times",
        type: "list",
        data: {
          style: "unordered",
          items: [
            "Sunday Morning Worship: 9:00 AM",
            "Sunday Morning Worship: 11:00 AM", 
            "Wednesday Bible Study: 7:00 PM",
            "Children's Ministry available during all services"
          ]
        }
      },
      {
        id: "about-header",
        type: "header",
        data: {
          text: "About Us",
          level: 2
        }
      },
      {
        id: "about-text",
        type: "paragraph",
        data: {
          text: "Our mission is to know Christ and make Him known. We believe in the power of community, the importance of service, and the transformative love of Jesus Christ. Join us as we journey together in faith."
        }
      },
      {
        id: "contact-header",
        type: "header",
        data: {
          text: "Contact Us",
          level: 2
        }
      },
      {
        id: "contact-info",
        type: "paragraph",
        data: {
          text: `<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 6px; border-left: 4px solid #667eea;">
            <p><strong>Address:</strong> 123 Church Street, Your City, State 12345</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> info@${organizationName.toLowerCase().replace(/\s+/g, '')}.org</p>
            <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
          </div>`
        }
      }
    ],
    version: "2.28.2"
  };
};

export const createDefaultHomepage = async (organizationId: string, organizationName: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const pageData = {
    title: `Welcome to ${organizationName}`,
    slug: 'home',
    content: getDefaultHomepageContent(organizationName),
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
    console.error('Error creating default homepage:', error);
    throw error;
  }

  return data;
};
