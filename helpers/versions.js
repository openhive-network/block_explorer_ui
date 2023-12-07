const { execSync } = require('child_process');
const fs = require('fs');

try {
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  fs.writeFileSync('.env.local', `NEXT_PUBLIC_COMMIT_HASH=${commitHash}`);
  console.log(`Commit Hash written to .env.local: ${commitHash}`);
} catch (error) {
  console.error('Error getting commit hash:', error);
}