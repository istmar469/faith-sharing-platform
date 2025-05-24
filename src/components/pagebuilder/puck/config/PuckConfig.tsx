
import { Config } from '@measured/puck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Hero Section Component
const Hero = ({ title, subtitle, backgroundImage, ctaText, ctaLink }: {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}) => (
  <section 
    className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4"
    style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
  >
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
      <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
      {ctaText && (
        <Button size="lg" variant="secondary">
          {ctaText}
        </Button>
      )}
    </div>
  </section>
);

// Text Block Component
const TextBlock = ({ content, alignment = 'left' }: {
  content: string;
  alignment: 'left' | 'center' | 'right';
}) => (
  <div className={`prose max-w-none py-8 px-4 text-${alignment}`}>
    <div dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

// Feature Card Component
const FeatureCard = ({ title, description, icon, imageUrl }: {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}) => (
  <Card className="h-full">
    {imageUrl && (
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    )}
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon && <span className="text-2xl">{icon}</span>}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

// Feature Grid Component
const FeatureGrid = ({ features }: {
  features: Array<{ title: string; description: string; icon?: string; imageUrl?: string }>;
}) => (
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  </section>
);

// Call to Action Component
const CallToAction = ({ title, description, buttonText, buttonLink, backgroundColor = 'bg-blue-600' }: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  backgroundColor?: string;
}) => (
  <section className={`${backgroundColor} text-white py-16 px-4`}>
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
      <p className="text-xl mb-8 opacity-90">{description}</p>
      <Button size="lg" variant="secondary">
        {buttonText}
      </Button>
    </div>
  </section>
);

// Spacer Component
const Spacer = ({ height = 'medium' }: {
  height: 'small' | 'medium' | 'large';
}) => {
  const heightMap = {
    small: 'h-8',
    medium: 'h-16',
    large: 'h-32'
  };
  
  return <div className={heightMap[height]} />;
};

// Puck Configuration
export const puckConfig: Config = {
  components: {
    Hero: {
      render: Hero,
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'textarea', label: 'Subtitle' },
        backgroundImage: { type: 'text', label: 'Background Image URL' },
        ctaText: { type: 'text', label: 'Button Text' },
        ctaLink: { type: 'text', label: 'Button Link' }
      },
      defaultProps: {
        title: 'Welcome to Our Website',
        subtitle: 'Create amazing experiences with our platform'
      }
    },
    TextBlock: {
      render: TextBlock,
      fields: {
        content: { type: 'textarea', label: 'Content' },
        alignment: {
          type: 'select',
          label: 'Text Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' }
          ]
        }
      },
      defaultProps: {
        content: '<p>Add your content here...</p>',
        alignment: 'left'
      }
    },
    FeatureGrid: {
      render: FeatureGrid,
      fields: {
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
            icon: { type: 'text', label: 'Icon (emoji or text)' },
            imageUrl: { type: 'text', label: 'Image URL' }
          }
        }
      },
      defaultProps: {
        features: [
          {
            title: 'Feature 1',
            description: 'Description of your first feature',
            icon: '🚀'
          },
          {
            title: 'Feature 2',
            description: 'Description of your second feature',
            icon: '⭐'
          },
          {
            title: 'Feature 3',
            description: 'Description of your third feature',
            icon: '💡'
          }
        ]
      }
    },
    CallToAction: {
      render: CallToAction,
      fields: {
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' },
        buttonText: { type: 'text', label: 'Button Text' },
        buttonLink: { type: 'text', label: 'Button Link' },
        backgroundColor: {
          type: 'select',
          label: 'Background Color',
          options: [
            { value: 'bg-blue-600', label: 'Blue' },
            { value: 'bg-green-600', label: 'Green' },
            { value: 'bg-purple-600', label: 'Purple' },
            { value: 'bg-red-600', label: 'Red' },
            { value: 'bg-gray-800', label: 'Dark Gray' }
          ]
        }
      },
      defaultProps: {
        title: 'Ready to Get Started?',
        description: 'Join thousands of satisfied customers today',
        buttonText: 'Get Started',
        backgroundColor: 'bg-blue-600'
      }
    },
    Spacer: {
      render: Spacer,
      fields: {
        height: {
          type: 'select',
          label: 'Height',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ]
        }
      },
      defaultProps: {
        height: 'medium'
      }
    }
  }
};

export default puckConfig;
