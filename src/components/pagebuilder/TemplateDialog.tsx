
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
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Page Templates</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Choose a ready-made template to quickly build your page. You can customize it afterwards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 overflow-y-auto">
          <TemplateSelection onClose={() => setOpen(false)} />
        </div>
        
        <DialogFooter className="sm:justify-start mt-4">
          <DialogDescription className="text-xs md:text-sm">
            Templates provide a great starting point for your page. You can always edit and customize after applying.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
