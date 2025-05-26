
import { Plugin, PluginConfig } from '@/types/plugins';

interface PluginHealthStatus {
  id: string;
  isHealthy: boolean;
  lastCheck: Date;
  errorCount: number;
  performanceMetrics: {
    loadTime: number;
    memoryUsage: number;
  };
}

interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class PluginSafetyManager {
  private healthStatuses = new Map<string, PluginHealthStatus>();
  private errorThreshold = 5;
  private performanceThreshold = 5000; // 5 seconds

  validatePlugin(plugin: Plugin): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required config fields
    if (!plugin.config.id) errors.push('Plugin ID is required');
    if (!plugin.config.name) errors.push('Plugin name is required');
    if (!plugin.config.version) errors.push('Plugin version is required');

    // Validate version format
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (plugin.config.version && !versionRegex.test(plugin.config.version)) {
      warnings.push('Plugin version should follow semantic versioning (x.y.z)');
    }

    // Validate dependencies
    if (plugin.config.dependencies) {
      plugin.config.dependencies.forEach(dep => {
        if (typeof dep !== 'string') {
          errors.push(`Invalid dependency format: ${dep}`);
        }
      });
    }

    // Validate lifecycle methods
    if (plugin.onLoad && typeof plugin.onLoad !== 'function') {
      errors.push('onLoad must be a function');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async checkPluginHealth(pluginId: string): Promise<PluginHealthStatus> {
    const startTime = performance.now();
    let isHealthy = true;
    let errorCount = 0;

    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const existingStatus = this.healthStatuses.get(pluginId);
      if (existingStatus) {
        errorCount = existingStatus.errorCount;
        if (errorCount >= this.errorThreshold) {
          isHealthy = false;
        }
      }
    } catch (error) {
      console.error(`Health check failed for plugin ${pluginId}:`, error);
      isHealthy = false;
      errorCount++;
    }

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    const status: PluginHealthStatus = {
      id: pluginId,
      isHealthy,
      lastCheck: new Date(),
      errorCount,
      performanceMetrics: {
        loadTime,
        memoryUsage: this.getMemoryUsage(),
      },
    };

    this.healthStatuses.set(pluginId, status);
    return status;
  }

  recordPluginError(pluginId: string, error: Error): void {
    console.error(`Plugin ${pluginId} error:`, error);
    
    const status = this.healthStatuses.get(pluginId);
    if (status) {
      status.errorCount++;
      status.isHealthy = status.errorCount < this.errorThreshold;
      this.healthStatuses.set(pluginId, status);
    } else {
      this.healthStatuses.set(pluginId, {
        id: pluginId,
        isHealthy: false,
        lastCheck: new Date(),
        errorCount: 1,
        performanceMetrics: {
          loadTime: 0,
          memoryUsage: this.getMemoryUsage(),
        },
      });
    }

    // Trigger recovery if needed
    if (status && status.errorCount >= this.errorThreshold) {
      this.attemptPluginRecovery(pluginId);
    }
  }

  private async attemptPluginRecovery(pluginId: string): Promise<void> {
    console.log(`Attempting recovery for plugin ${pluginId}`);
    
    try {
      // Reset error count
      const status = this.healthStatuses.get(pluginId);
      if (status) {
        status.errorCount = 0;
        status.isHealthy = true;
        this.healthStatuses.set(pluginId, status);
      }
      
      console.log(`Recovery successful for plugin ${pluginId}`);
    } catch (error) {
      console.error(`Recovery failed for plugin ${pluginId}:`, error);
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  getHealthReport(): PluginHealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  isPluginSafe(pluginId: string): boolean {
    const status = this.healthStatuses.get(pluginId);
    return status ? status.isHealthy : true;
  }

  clearPluginErrors(pluginId: string): void {
    const status = this.healthStatuses.get(pluginId);
    if (status) {
      status.errorCount = 0;
      status.isHealthy = true;
      this.healthStatuses.set(pluginId, status);
    }
  }
}

export const pluginSafetyManager = new PluginSafetyManager();
