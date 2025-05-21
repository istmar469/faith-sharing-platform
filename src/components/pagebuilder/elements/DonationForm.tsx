
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DonationFormProps {
  title?: string;
}

const DonationForm: React.FC<DonationFormProps> = ({ title = 'Support Our Church' }) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="mb-4">Support our ministry with your generous donation.</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button variant="outline">$25</Button>
        <Button variant="outline">$50</Button>
        <Button variant="outline">$100</Button>
        <Button variant="outline">Other</Button>
      </div>
      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Donate Now
      </Button>
    </div>
  );
};

export default DonationForm;
