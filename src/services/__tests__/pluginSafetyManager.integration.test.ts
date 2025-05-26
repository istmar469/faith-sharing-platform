
import { describe, it, expect, beforeEach } from 'vitest';
import { pluginSafetyManager } from '../pluginSafetyManager';
import { Plugin } from '@/types/plugins';

describe('PluginSafetyManager Integration', () => {
  const createMockPlugin = (overrides = {}): Plugin => ({
    config: {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin for integration testing',
      author: 'Test Author',
      ...overrides,
    },
  });

  beforeEach(() => {
    // Clear any existing health statuses before each test
    pluginSafetyManager.clearPluginErrors('test-plugin');
  });

  describe('plugin lifecycle', () => {
    it('validates and monitors a healthy plugin', async () => {
      const plugin = createMockPlugin();
      
      // Validate the plugin
      const validationResult = pluginSafetyManager.validatePlugin(plugin);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      
      // Check initial health
      const healthStatus = await pluginSafetyManager.checkPluginHealth(plugin.config.id);
      expect(healthStatus.isHealthy).toBe(true);
      expect(healthStatus.errorCount).toBe(0);
      
      // Verify plugin is safe to use
      expect(pluginSafetyManager.isPluginSafe(plugin.config.id)).toBe(true);
    });

    it('handles plugin errors and recovery', () => {
      const pluginId = 'error-prone-plugin';
      const error = new Error('Test error');
      
      // Record multiple errors
      for (let i = 0; i < 3; i++) {
        pluginSafetyManager.recordPluginError(pluginId, error);
      }
      
      // Plugin should still be safe (below threshold)
      expect(pluginSafetyManager.isPluginSafe(pluginId)).toBe(true);
      
      // Clear errors and verify recovery
      pluginSafetyManager.clearPluginErrors(pluginId);
      expect(pluginSafetyManager.isPluginSafe(pluginId)).toBe(true);
    });

    it('generates comprehensive health reports', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1' }),
        createMockPlugin({ id: 'plugin-2' }),
      ];
      
      // Check health for multiple plugins
      for (const plugin of plugins) {
        await pluginSafetyManager.checkPluginHealth(plugin.config.id);
      }
      
      const healthReport = pluginSafetyManager.getHealthReport();
      expect(healthReport).toHaveLength(2);
      
      healthReport.forEach(status => {
        expect(status.id).toMatch(/plugin-[12]/);
        expect(status.isHealthy).toBe(true);
        expect(status.performanceMetrics).toBeDefined();
        expect(status.lastCheck).toBeInstanceOf(Date);
      });
    });
  });

  describe('plugin validation edge cases', () => {
    it('catches missing required fields', () => {
      const invalidPlugin = createMockPlugin({
        id: '',
        name: '',
        version: '',
      });
      
      const result = pluginSafetyManager.validatePlugin(invalidPlugin);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Plugin ID is required');
      expect(result.errors).toContain('Plugin name is required');
      expect(result.errors).toContain('Plugin version is required');
    });

    it('warns about invalid version formats', () => {
      const pluginWithBadVersion = createMockPlugin({
        version: 'not-semver',
      });
      
      const result = pluginSafetyManager.validatePlugin(pluginWithBadVersion);
      expect(result.warnings).toContain('Plugin version should follow semantic versioning (x.y.z)');
    });
  });
});
