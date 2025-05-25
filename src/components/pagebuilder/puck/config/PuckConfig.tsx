import { Config } from '@measured/puck';
import { Hero } from './components/Hero';
import { TextBlock } from './components/TextBlock';
import { Image } from './components/Image';
import { VideoEmbed } from './components/VideoEmbed';
import { Testimonial } from './components/Testimonial';
import { Stats } from './components/Stats';
import { ContactForm } from './components/ContactForm';
import { ImageGallery } from './components/ImageGallery';
import Header from './components/Header';
import Footer from './components/Footer';

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
    Header: {
      render: ({ logo, logoText, showNavigation, navigationItems, backgroundColor, textColor }) => (
        <Header
          logo={logo}
          logoText={logoText}
          showNavigation={showNavigation}
          navigationItems={navigationItems}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      ),
      fields: {
        logo: { type: "text", label: "Logo URL" },
        logoText: { type: "text", label: "Logo Text" },
        showNavigation: { type: "radio", options: [
          { label: "Show", value: true },
          { label: "Hide", value: false }
        ]},
        navigationItems: {
          type: "array",
          label: "Navigation Items",
          getItemSummary: (item) => item.label || "Navigation Item",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href: { type: "text", label: "Link" },
          },
        },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
      },
      defaultProps: {
        logoText: "Welcome",
        showNavigation: true,
        navigationItems: [
          { label: "Home", href: "#" },
          { label: "About", href: "#about" },
          { label: "Services", href: "#services" },
          { label: "Contact", href: "#contact" },
        ],
        backgroundColor: "white",
        textColor: "gray-900",
      },
    },
    Footer: {
      render: ({ showFooter, companyName, address, phone, email, links, backgroundColor, textColor }) => (
        <Footer
          showFooter={showFooter}
          companyName={companyName}
          address={address}
          phone={phone}
          email={email}
          links={links}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      ),
      fields: {
        showFooter: { type: "radio", options: [
          { label: "Show", value: true },
          { label: "Hide", value: false }
        ]},
        companyName: { type: "text", label: "Company Name" },
        address: { type: "textarea", label: "Address" },
        phone: { type: "text", label: "Phone" },
        email: { type: "text", label: "Email" },
        links: {
          type: "array",
          label: "Footer Links",
          getItemSummary: (item) => item.label || "Footer Link",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href: { type: "text", label: "Link" },
          },
        },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
      },
      defaultProps: {
        showFooter: true,
        companyName: "Our Church",
        address: "123 Church Street, City, State 12345",
        phone: "(555) 123-4567",
        email: "info@church.com",
        links: [
          { label: "About", href: "#about" },
          { label: "Services", href: "#services" },
          { label: "Contact", href: "#contact" },
        ],
        backgroundColor: "gray-900",
        textColor: "white",
      },
    }
  }
};
