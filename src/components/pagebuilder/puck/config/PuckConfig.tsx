
import { Config } from '@measured/puck';
import { Hero } from './components/Hero';
import { TextBlock } from './components/TextBlock';
import { Image } from './components/Image';
import { VideoEmbed } from './components/VideoEmbed';
import { Testimonial } from './components/Testimonial';
import { Stats } from './components/Stats';
import { ContactForm } from './components/ContactForm';
import { ImageGallery } from './components/ImageGallery';

export const puckConfig: Config = {
  components: {
    Hero: {
      component: Hero,
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
      component: TextBlock,
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
      component: Image,
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
      component: VideoEmbed,
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
      component: Testimonial,
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
      component: Stats,
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
      component: ContactForm,
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
      component: ImageGallery,
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
    }
  }
};
