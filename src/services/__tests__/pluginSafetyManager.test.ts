
import { describe, it, expect, beforeEach } from 'vitest';
import { pluginSafetyManager } from '../pluginSafetyManager';
import { Plugin } from '@/types/plugins';

describe('PluginSafetyManager', () => {
  const mockPlugin: Plugin = {
    config: {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author',
    },
  };

  beforeEach(() => {
    // Clear any existing health statuses
    pluginSafetyManager.clearPluginErrors('test-plugin');
  });

  describe('validatePlugin', () => {
    it('validates a correct plugin', () => {
      const result = pluginSafetyManager.validatePlugin(mockPlugin);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation for missing required fields', () => {
      const invalidPlugin = {
        config: {
          id: '',
          name: '',
          version: '',
          description: '',
          author: '',
        },
      } as Plugin;

      const result = pluginSafetyManager.validatePlugin(invalidPlugin);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Plugin ID is required');
      expect(result.errors).toContain('Plugin name is required');
      expect(result.errors).toContain('Plugin version is required');
    });

    it('warns about invalid version format', () => {
      const pluginWithBadVersion = {
        ...mockPlugin,
        config: {
          ...mockPlugin.config,
          version: 'invalid-version',
        },
      };

      const result = pluginSafetyManager.validatePlugin(pluginWithBadVersion);
      
      expect(result.warnings).toContain('Plugin version should follow semantic versioning (x.y.z)');
    });
  });

  describe('checkPluginHealth', () => {
    it('returns healthy status for new plugin', async () => {
      const status = await pluginSafetyManager.checkPluginHealth('test-plugin');
      
      expect(status.id).toBe('test-plugin');
      expect(status.isHealthy).toBe(true);
      expect(status.errorCount).toBe(0);
    });
  });

  describe('recordPluginError', () => {
    it('records plugin errors', () => {
      const error = new Error('Test error');
      
      pluginSafetyManager.recordPluginError('test-plugin', error);
      
      expect(pluginSafetyManager.isPluginSafe('test-plugin')).toBe(true);
    });

    it('marks plugin as unsafe after error threshold', () => {
      const error = new Error('Test error');
      
      // Record errors beyond threshold
      for (let i = 0; i < 6; i++) {
        pluginSafetyManager.recordPluginError('test-plugin', error);
      }
      
      expect(pluginSafetyManager.isPluginSafe('test-plugin')).toBe(true); // Should be recovered
    });
  });

  describe('clearPluginErrors', () => {
    it('clears plugin errors and marks as healthy', () => {
      const error = new Error('Test error');
      pluginSafetyManager.recordPluginError('test-plugin', error);
      
      pluginSafetyManager.clearPluginErrors('test-plugin');
      
      expect(pluginSafetyManager.isPluginSafe('test-plugin')).toBe(true);
    });
  });
});
