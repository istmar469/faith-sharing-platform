
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { usePageBuilder } from '../context/PageBuilderContext';
import { PageElement } from '@/services/pages';

interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  elements: PageElement[];
}

const TEMPLATES: Template[] = [
  {
    id: 'modern-church',
    name: 'Modern Church',
    description: 'A clean, modern design with sections for services, events, and sermons',
    previewImage: '/placeholder.svg',
    elements: [
      {
        id: 'header-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'lg',
          backgroundColor: 'bg-blue-50' 
        }
      },
      {
        id: 'hero-heading',
        type: 'text',
        component: 'Heading',
        parentId: 'header-section',
        props: { 
          text: 'Welcome to Our Church', 
          size: 'xl'
        }
      },
      {
        id: 'hero-paragraph',
        type: 'text',
        component: 'Paragraph',
        parentId: 'header-section',
        props: { 
          text: 'Join us for worship every Sunday at 9:00 AM and 11:00 AM'
        }
      },
      {
        id: 'content-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'md',
          backgroundColor: 'bg-white' 
        }
      },
      {
        id: 'events-calendar',
        type: 'component',
        component: 'EventsCalendar',
        parentId: 'content-section',
        props: { 
          showUpcoming: 3
        }
      }
    ]
  },
  {
    id: 'traditional',
    name: 'Traditional Church',
    description: 'A classic church website design with focus on history and community',
    previewImage: '/placeholder.svg',
    elements: [
      {
        id: 'header-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'lg',
          backgroundColor: 'bg-slate-100' 
        }
      },
      {
        id: 'hero-heading',
        type: 'text',
        component: 'Heading',
        parentId: 'header-section',
        props: { 
          text: 'Welcome to Our Parish', 
          size: 'xl'
        }
      },
      {
        id: 'content-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'md',
          backgroundColor: 'bg-white' 
        }
      },
      {
        id: 'about-heading',
        type: 'text',
        component: 'Heading',
        parentId: 'content-section',
        props: { 
          text: 'Our History',
          size: 'lg' 
        }
      },
      {
        id: 'about-text',
        type: 'text',
        component: 'Paragraph',
        parentId: 'content-section',
        props: {
          text: 'Founded in 1950, our church has been serving the community for generations...'
        }
      }
    ]
  },
  {
    id: 'community',
    name: 'Community Focus',
    description: 'Designed for churches with strong community programs and outreach',
    previewImage: '/placeholder.svg',
    elements: [
      {
        id: 'header-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'lg',
          backgroundColor: 'bg-green-50' 
        }
      },
      {
        id: 'hero-heading',
        type: 'text',
        component: 'Heading',
        parentId: 'header-section',
        props: { 
          text: 'Growing Together in Faith', 
          size: 'xl'
        }
      },
      {
        id: 'services-section',
        type: 'container',
        component: 'Section',
        props: { 
          padding: 'md',
          backgroundColor: 'bg-white' 
        }
      },
      {
        id: 'services-grid',
        type: 'container',
        component: 'Grid',
        parentId: 'services-section',
        props: { 
          columns: 2,
          gap: 4
        }
      },
      {
        id: 'donation-component',
        type: 'component',
        component: 'DonationForm',
        parentId: 'services-grid',
        props: {
          title: 'Support Our Ministry'
        }
      },
      {
        id: 'sermon-component',
        type: 'component',
        component: 'SermonPlayer',
        parentId: 'services-grid',
        props: {
          title: 'Latest Sermon'
        }
      }
    ]
  }
];

interface TemplateSelectionProps {
  onClose?: () => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setPageElements, savePage } = usePageBuilder();
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    
    setIsApplying(true);
    
    try {
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      
      if (template) {
        // Clear existing elements and apply template elements
        setPageElements(template.elements);
        
        // Save the page with the new template
        await savePage();
        
        toast({
          title: "Template Applied",
          description: `Your page is now using the ${template.name} template`,
        });
        
        if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      console.error("Error applying template:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not apply template. Please try again.",
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Select a Template</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(template => (
          <Card 
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedTemplate === template.id ? "ring-2 ring-primary" : ""
            )}
            onClick={() => handleSelectTemplate(template.id)}
          >
            <CardHeader className="relative pb-2">
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-200 rounded-md overflow-hidden">
                <img 
                  src={template.previewImage} 
                  alt={`${template.name} preview`} 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTemplate(template.id);
                }}
              >
                Preview <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        
        <Button 
          onClick={handleApplyTemplate} 
          disabled={!selectedTemplate || isApplying}
          className="gap-2"
        >
          {isApplying ? (
            <>Applying Template...</>
          ) : (
            <>
              <Layout className="h-4 w-4" />
              Apply Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelection;
