
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layout } from 'lucide-react';
import TemplateSelection from './templates/TemplateSelection';

interface TemplateDialogProps {
  trigger?: React.ReactNode;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({ trigger }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Choose Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Page Templates</DialogTitle>
          <DialogDescription>
            Choose a ready-made template to quickly build your page. You can customize it afterwards.
          </DialogDescription>
        </DialogHeader>
        
        <TemplateSelection onClose={() => setOpen(false)} />
        
        <DialogFooter className="sm:justify-start">
          <DialogDescription>
            Templates provide a great starting point for your page. You can always edit and customize after applying.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
