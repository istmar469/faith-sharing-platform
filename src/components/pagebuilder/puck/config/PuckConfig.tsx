import { Config } from '@measured/puck';
import { Hero } from './components/Hero';
import { TextBlock } from './components/TextBlock';
import { Image } from './components/Image';
import { VideoEmbed } from './components/VideoEmbed';
import { Testimonial } from './components/Testimonial';
import { Stats } from './components/Stats';
import { ContactForm } from './components/ContactForm';
import { ImageGallery } from './components/ImageGallery';
import EnhancedHeader from './components/EnhancedHeader';
import EnhancedFooter from './components/EnhancedFooter';

export const puckConfig: Config = {
  components: {
    Hero: {
      render: (props) => <Hero {...props} />,
      fields: {
        title: { type: 'text' },
        subtitle: { type: 'textarea' },
        buttonText: { type: 'text' },
        buttonLink: { type: 'text' },
        backgroundImage: { type: 'text' },
        size: {
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]
        },
        alignment: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]
        }
      },
      defaultProps: {
        title: 'Welcome to Your Website',
        subtitle: 'Create amazing experiences with our powerful tools',
        buttonText: 'Get Started',
        buttonLink: '#',
        size: 'large',
        alignment: 'center'
      }
    },
    TextBlock: {
      render: (props) => <TextBlock {...props} />,
      fields: {
        content: { type: 'textarea' },
        size: {
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]
        },
        alignment: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]
        }
      },
      defaultProps: {
        content: 'Add your content here...',
        size: 'medium',
        alignment: 'left'
      }
    },
    Image: {
      render: (props) => <Image {...props} />,
      fields: {
        src: { type: 'text' },
        alt: { type: 'text' },
        caption: { type: 'text' },
        width: {
          type: 'select',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Large', value: 'large' },
            { label: 'Medium', value: 'medium' },
            { label: 'Small', value: 'small' }
          ]
        },
        alignment: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' }
          ]
        }
      },
      defaultProps: {
        src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
        alt: 'Image',
        width: 'full',
        alignment: 'center'
      }
    },
    VideoEmbed: {
      render: (props) => <VideoEmbed {...props} />,
      fields: {
        url: { type: 'text' },
        title: { type: 'text' },
        aspectRatio: {
          type: 'select',
          options: [
            { label: '16:9 (Widescreen)', value: '16:9' },
            { label: '4:3 (Standard)', value: '4:3' },
            { label: '1:1 (Square)', value: '1:1' }
          ]
        }
      },
      defaultProps: {
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Video',
        aspectRatio: '16:9'
      }
    },
    Testimonial: {
      render: (props) => <Testimonial {...props} />,
      fields: {
        quote: { type: 'textarea' },
        author: { type: 'text' },
        position: { type: 'text' },
        company: { type: 'text' },
        avatar: { type: 'text' },
        layout: {
          type: 'select',
          options: [
            { label: 'Card', value: 'card' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Featured', value: 'featured' }
          ]
        }
      },
      defaultProps: {
        quote: 'This product has completely transformed our workflow. Highly recommended!',
        author: 'John Doe',
        position: 'CEO',
        company: 'Tech Corp',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        layout: 'card'
      }
    },
    Stats: {
      render: (props) => <Stats {...props} />,
      fields: {
        layout: {
          type: 'select',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Horizontal', value: 'horizontal' },
            { label: 'Minimal', value: 'minimal' }
          ]
        },
        color: {
          type: 'select',
          options: [
            { label: 'Blue', value: 'blue' },
            { label: 'Green', value: 'green' },
            { label: 'Purple', value: 'purple' },
            { label: 'Orange', value: 'orange' }
          ]
        }
      },
      defaultProps: {
        layout: 'grid',
        color: 'blue'
      }
    },
    ContactForm: {
      render: (props) => <ContactForm {...props} />,
      fields: {
        title: { type: 'text' },
        subtitle: { type: 'textarea' },
        buttonText: { type: 'text' },
        layout: {
          type: 'select',
          options: [
            { label: 'Card', value: 'card' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Sidebar', value: 'sidebar' }
          ]
        }
      },
      defaultProps: {
        title: 'Get in Touch',
        subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        buttonText: 'Send Message',
        layout: 'card'
      }
    },
    ImageGallery: {
      render: (props) => <ImageGallery {...props} />,
      fields: {
        layout: {
          type: 'select',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Masonry', value: 'masonry' },
            { label: 'Carousel', value: 'carousel' }
          ]
        },
        columns: {
          type: 'select',
          options: [
            { label: '2 Columns', value: 2 },
            { label: '3 Columns', value: 3 },
            { label: '4 Columns', value: 4 }
          ]
        }
      },
      defaultProps: {
        layout: 'grid',
        columns: 3
      }
    },
    EnhancedHeader: {
      render: (props) => <EnhancedHeader {...props} />,
      fields: {
        logo: { type: "text", label: "Logo URL" },
        logoText: { type: "text", label: "Organization Name" },
        showNavigation: { 
          type: "radio", 
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false }
          ]
        },
        navigationItems: {
          type: "array",
          label: "Navigation Items",
          getItemSummary: (item) => item.label || "Navigation Item",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href: { type: "text", label: "Link" },
            target: {
              type: "select",
              label: "Open in",
              options: [
                { label: "Same window", value: "_self" },
                { label: "New window", value: "_blank" }
              ]
            }
          },
        },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        isSticky: {
          type: "radio",
          label: "Sticky Header",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        showCTA: {
          type: "radio",
          label: "Show CTA Button",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        ctaText: { type: "text", label: "CTA Button Text" },
        ctaLink: { type: "text", label: "CTA Button Link" },
        showSearch: {
          type: "radio",
          label: "Show Search",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        showUserMenu: {
          type: "radio",
          label: "Show User Menu",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Default", value: "default" },
            { label: "Centered", value: "centered" },
            { label: "Minimal", value: "minimal" }
          ]
        }
      },
      defaultProps: {
        logoText: "My Church",
        showNavigation: true,
        navigationItems: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Events", href: "/events" },
          { label: "Contact", href: "/contact" },
        ],
        backgroundColor: "white",
        textColor: "gray-900",
        isSticky: true,
        showCTA: true,
        ctaText: "Visit Us",
        ctaLink: "/visit",
        showSearch: false,
        showUserMenu: false,
        layout: "default"
      },
    },
    EnhancedFooter: {
      render: (props) => <EnhancedFooter {...props} />,
      fields: {
        showFooter: { 
          type: "radio", 
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false }
          ]
        },
        companyName: { type: "text", label: "Organization Name" },
        address: { type: "textarea", label: "Address" },
        phone: { type: "text", label: "Phone" },
        email: { type: "text", label: "Email" },
        sections: {
          type: "array",
          label: "Footer Sections",
          getItemSummary: (item) => item.title || "Footer Section",
          arrayFields: {
            title: { type: "text", label: "Section Title" },
            links: {
              type: "array",
              label: "Links",
              getItemSummary: (link) => link.label || "Link",
              arrayFields: {
                label: { type: "text", label: "Label" },
                href: { type: "text", label: "URL" },
                target: {
                  type: "select",
                  options: [
                    { label: "Same window", value: "_self" },
                    { label: "New window", value: "_blank" }
                  ]
                }
              }
            }
          },
        },
        socialLinks: {
          type: "array",
          label: "Social Media Links",
          getItemSummary: (item) => `${item.platform}: ${item.url}`,
          arrayFields: {
            platform: {
              type: "select",
              label: "Platform",
              options: [
                { label: "Facebook", value: "facebook" },
                { label: "Twitter", value: "twitter" },
                { label: "Instagram", value: "instagram" },
                { label: "YouTube", value: "youtube" },
                { label: "LinkedIn", value: "linkedin" }
              ]
            },
            url: { type: "text", label: "URL" }
          }
        },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "1 Column", value: "1-column" },
            { label: "2 Columns", value: "2-column" },
            { label: "3 Columns", value: "3-column" },
            { label: "4 Columns", value: "4-column" }
          ]
        },
        showNewsletter: {
          type: "radio",
          label: "Show Newsletter Signup",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        newsletterTitle: { type: "text", label: "Newsletter Title" },
        newsletterDescription: { type: "textarea", label: "Newsletter Description" },
        showServiceTimes: {
          type: "radio",
          label: "Show Service Times",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false }
          ]
        },
        serviceTimes: {
          type: "array",
          label: "Service Times",
          getItemSummary: (item) => item || "Service Time",
          arrayFields: {
            time: { type: "text", label: "Service Time" }
          }
        }
      },
      defaultProps: {
        showFooter: true,
        companyName: "Our Church",
        address: "123 Church Street, City, State 12345",
        phone: "(555) 123-4567",
        email: "info@church.com",
        sections: [
          {
            title: "Quick Links",
            links: [
              { label: "About", href: "/about" },
              { label: "Services", href: "/services" },
              { label: "Events", href: "/events" },
              { label: "Contact", href: "/contact" }
            ]
          },
          {
            title: "Ministries",
            links: [
              { label: "Youth Ministry", href: "/youth" },
              { label: "Children's Ministry", href: "/children" },
              { label: "Music Ministry", href: "/music" },
              { label: "Outreach", href: "/outreach" }
            ]
          }
        ],
        socialLinks: [
          { platform: "facebook", url: "https://facebook.com/yourchurch" },
          { platform: "instagram", url: "https://instagram.com/yourchurch" },
          { platform: "youtube", url: "https://youtube.com/yourchurch" }
        ],
        backgroundColor: "gray-900",
        textColor: "white",
        layout: "3-column",
        showNewsletter: true,
        newsletterTitle: "Stay Connected",
        newsletterDescription: "Subscribe to our newsletter for updates and announcements.",
        showServiceTimes: true,
        serviceTimes: [
          { time: "Sunday: 9:00 AM & 11:00 AM" },
          { time: "Wednesday: 7:00 PM" }
        ]
      },
    }
  }
};
