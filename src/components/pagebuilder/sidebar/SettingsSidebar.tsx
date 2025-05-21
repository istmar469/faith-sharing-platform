
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsSidebar: React.FC = () => {
  return (
    <div className="p-4 mt-0">
      <div className="space-y-4">
        <div>
          <Label htmlFor="page-url">Page URL</Label>
          <Input id="page-url" defaultValue="/new-page" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input id="meta-title" defaultValue="New Page | First Baptist Church" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="meta-desc">Meta Description</Label>
          <Textarea id="meta-desc" className="mt-1" rows={3} defaultValue="Welcome to our new page at First Baptist Church. Learn more about our community and services." />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="page-visibility">Published</Label>
          <Switch id="page-visibility" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="page-index">Show in Navigation</Label>
          <Switch id="page-index" defaultChecked />
        </div>
        <div>
          <Label htmlFor="page-parent">Parent Page</Label>
          <Select defaultValue="none">
            <SelectTrigger id="page-parent">
              <SelectValue placeholder="Select parent page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="about">About</SelectItem>
              <SelectItem value="ministries">Ministries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
