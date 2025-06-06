#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Generate build information
function generateBuildInfo() {
  try {
    // Get git commit hash
    const gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const gitCommitShort = gitCommit.substring(0, 8);
    
    // Get git branch
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    
    // Get build timestamp
    const buildTime = new Date().toISOString();
    
    // Get package version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version || '1.0.0';

    const buildInfo = {
      version,
      gitCommit,
      gitCommitShort,
      gitBranch,
      buildTime,
      buildNumber: process.env.BUILD_NUMBER || 'local'
    };

    // Write to a file that can be imported
    const buildInfoContent = `// Auto-generated build information
export const BUILD_INFO = ${JSON.stringify(buildInfo, null, 2)};

// Console log function
export const logBuildInfo = () => {
  console.log('🚀 Faith Sharing Platform Build Info:');
  console.log(\`📦 Version: \${BUILD_INFO.version}\`);
  console.log(\`⏰ Build Time: \${BUILD_INFO.buildTime}\`);
  console.log(\`🔗 Git Commit: \${BUILD_INFO.gitCommitShort} (\${BUILD_INFO.gitBranch})\`);
  console.log(\`🏗️  Build Number: \${BUILD_INFO.buildNumber}\`);
  console.log('─'.repeat(60));
  return BUILD_INFO;
};
`;

    // Ensure the directory exists
    const outputDir = path.dirname('src/generated/buildInfo.ts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the build info
    fs.writeFileSync('src/generated/buildInfo.ts', buildInfoContent);
    
    console.log('✅ Build info generated successfully');
    console.log(`📦 Version: ${version}`);
    console.log(`🔗 Commit: ${gitCommitShort}`);
    console.log(`⏰ Build Time: ${buildTime}`);
    
    return buildInfo;
  } catch (error) {
    console.error('❌ Error generating build info:', error);
    
    // Fallback build info
    const fallbackInfo = {
      version: '1.0.0',
      gitCommit: 'unknown',
      gitCommitShort: 'unknown',
      gitBranch: 'unknown',
      buildTime: new Date().toISOString(),
      buildNumber: 'fallback'
    };
    
    const fallbackContent = `// Fallback build information
export const BUILD_INFO = ${JSON.stringify(fallbackInfo, null, 2)};

export const logBuildInfo = () => {
  console.log('🚀 Faith Sharing Platform Build Info (Fallback):');
  console.log(\`📦 Version: \${BUILD_INFO.version}\`);
  console.log(\`⏰ Build Time: \${BUILD_INFO.buildTime}\`);
  console.log('─'.repeat(60));
  return BUILD_INFO;
};
`;

    fs.writeFileSync('src/generated/buildInfo.ts', fallbackContent);
    return fallbackInfo;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBuildInfo();
}

export { generateBuildInfo }; 