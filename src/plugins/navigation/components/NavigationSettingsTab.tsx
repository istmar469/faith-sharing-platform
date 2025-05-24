
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NavigationSettings } from '../NavigationPlugin';

interface NavigationSettingsTabProps {
  settings: NavigationSettings;
  onUpdateSettings: (settings: NavigationSettings) => void;
}

const NavigationSettingsTab: React.FC<NavigationSettingsTabProps> = ({
  settings,
  onUpdateSettings
}) => {
  const updateSetting = (key: keyof NavigationSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-logo">Show Logo</Label>
        <Switch
          id="show-logo"
          checked={settings.showLogo}
          onCheckedChange={(checked) => updateSetting('showLogo', checked)}
        />
      </div>
      
      {settings.showLogo && (
        <div className="space-y-2">
          <Label htmlFor="logo-text">Logo Text</Label>
          <Input
            id="logo-text"
            value={settings.logoText || ''}
            onChange={(e) => updateSetting('logoText', e.target.value)}
            placeholder="Enter logo text"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Navigation Style</Label>
        <div className="flex gap-2">
          <Button
            variant={settings.style === 'horizontal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSetting('style', 'horizontal')}
          >
            Horizontal
          </Button>
          <Button
            variant={settings.style === 'vertical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSetting('style', 'vertical')}
          >
            Vertical
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="mobile-breakpoint">Mobile Breakpoint (px)</Label>
        <Input
          id="mobile-breakpoint"
          type="number"
          value={settings.mobileBreakpoint}
          onChange={(e) => updateSetting('mobileBreakpoint', parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};

export default NavigationSettingsTab;
