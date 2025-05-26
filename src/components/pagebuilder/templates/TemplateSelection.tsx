
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { usePageBuilder } from '../context/PageBuilderContext';
import { PuckData } from '../context/pageBuilderTypes';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  content: PuckData;
}

const TEMPLATES: Template[] = [
  {
    id: 'modern-church',
    name: 'Modern Church',
    description: 'A clean, modern design with sections for services, events, and sermons',
    previewImage: '/placeholder.svg',
    content: {
      content: [
        {
          type: 'Hero',
          props: {
            title: 'Welcome to Our Church',
            subtitle: 'Join us for worship every Sunday at 9:00 AM and 11:00 AM'
          }
        },
        {
          type: 'ServiceTimes',
          props: {
            title: 'Service Times',
            services: [
              { name: 'Sunday Morning', time: '9:00 AM' },
              { name: 'Sunday Evening', time: '11:00 AM' }
            ]
          }
        }
      ],
      root: {
        title: 'Modern Church'
      }
    }
  },
  {
    id: 'traditional',
    name: 'Traditional Church',
    description: 'A classic church website design with focus on history and community',
    previewImage: '/placeholder.svg',
    content: {
      content: [
        {
          type: 'Hero',
          props: {
            title: 'Welcome to Our Parish',
            subtitle: 'Serving the community since 1950'
          }
        },
        {
          type: 'TextBlock',
          props: {
            title: 'Our History',
            text: 'Founded in 1950, our church has been serving the community for generations...'
          }
        }
      ],
      root: {
        title: 'Traditional Church'
      }
    }
  },
  {
    id: 'community',
    name: 'Community Focus',
    description: 'Designed for churches with strong community programs and outreach',
    previewImage: '/placeholder.svg',
    content: {
      content: [
        {
          type: 'Hero',
          props: {
            title: 'Growing Together in Faith',
            subtitle: 'Building community through faith and service'
          }
        },
        {
          type: 'TextBlock',
          props: {
            title: 'Community Programs',
            text: 'We offer a variety of community programs and services to help you grow in your faith journey.'
          }
        }
      ],
      root: {
        title: 'Community Focus'
      }
    }
  }
];

interface TemplateSelectionProps {
  onClose?: () => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { 
    setPageElements, 
    organizationId, 
    savePage, 
    setPageTitle
  } = usePageBuilder();
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }
    
    if (!organizationId) {
      toast.error("Organization ID is missing. Please try again.");
      return;
    }
    
    setIsApplying(true);
    toast.info("Applying template...");
    
    try {
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      
      if (template) {
        // Update page title based on template
        setPageTitle(`${template.name} Page`);
        
        // Apply template content in Puck format
        setPageElements(template.content);
        
        // Save the page with the new template
        const saveResult = await savePage();
        
        if (saveResult) {
          toast.success(`Template applied successfully!`);
          
          if (onClose) {
            onClose();
          }
        } else {
          toast.error("Failed to save page with template. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error applying template:", err);
      toast.error("Could not apply template. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <div className="p-4 bg-white">
      <h2 className="text-2xl font-bold mb-6">Select a Template</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(template => (
          <Card 
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md bg-white",
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
