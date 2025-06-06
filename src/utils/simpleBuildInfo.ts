// Simple build information that works in all environments
export const BUILD_INFO = {
  version: '1.0.0',
  buildTime: new Date().toISOString(),
  gitCommitShort: 'latest',
  environment: import.meta.env.PROD ? 'production' : 'development'
};

// Console log function
export const logBuildInfo = () => {
  console.log('🚀 Faith Sharing Platform Build Info:');
  console.log(`📦 Version: ${BUILD_INFO.version}`);
  console.log(`⏰ Build Time: ${BUILD_INFO.buildTime}`);
  console.log(`🔗 Commit: ${BUILD_INFO.gitCommitShort}`);
  console.log(`🌍 Environment: ${BUILD_INFO.environment}`);
  console.log('─'.repeat(60));
  return BUILD_INFO;
}; 