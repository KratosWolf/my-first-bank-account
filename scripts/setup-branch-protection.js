#!/usr/bin/env node

/**
 * Script to set up branch protection rules using GitHub CLI
 * Run with: node scripts/setup-branch-protection.js
 * Requires: gh CLI tool to be installed and authenticated
 */

const { execSync } = require('child_process');

const REPO = process.env.GITHUB_REPOSITORY || 'yourusername/myfirstba2';

const branchProtectionRules = {
  main: {
    required_status_checks: ['CI Pipeline / test', 'Security / security'],
    required_reviews: 2,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: true,
    enforce_admins: true,
    linear_history: true,
    allow_force_pushes: false,
    allow_deletions: false
  },
  develop: {
    required_status_checks: ['CI Pipeline / test', 'Security / security'],
    required_reviews: 1,
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    enforce_admins: false,
    linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false
  }
};

function setupBranchProtection(branch, rules) {
  console.log(`Setting up branch protection for ${branch}...`);
  
  try {
    const command = [
      'gh', 'api',
      `repos/${REPO}/branches/${branch}/protection`,
      '--method', 'PUT',
      '--field', `required_status_checks[strict]=true`,
      '--field', `required_status_checks[contexts][]=${rules.required_status_checks.join(',')}`,
      '--field', `required_pull_request_reviews[required_approving_review_count]=${rules.required_reviews}`,
      '--field', `required_pull_request_reviews[dismiss_stale_reviews]=${rules.dismiss_stale_reviews}`,
      '--field', `required_pull_request_reviews[require_code_owner_reviews]=${rules.require_code_owner_reviews}`,
      '--field', `enforce_admins=${rules.enforce_admins}`,
      '--field', `required_linear_history=${rules.linear_history}`,
      '--field', `allow_force_pushes=${rules.allow_force_pushes}`,
      '--field', `allow_deletions=${rules.allow_deletions}`,
      '--field', 'restrictions=null'
    ];

    execSync(command.join(' '), { stdio: 'inherit' });
    console.log(`✅ Branch protection set up successfully for ${branch}`);
  } catch (error) {
    console.error(`❌ Failed to set up branch protection for ${branch}:`, error.message);
  }
}

function main() {
  console.log('Setting up branch protection rules...');
  
  // Check if gh CLI is available
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ GitHub CLI (gh) is not installed or not in PATH');
    console.error('Please install it from: https://cli.github.com/');
    process.exit(1);
  }

  // Check if authenticated
  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Not authenticated with GitHub CLI');
    console.error('Please run: gh auth login');
    process.exit(1);
  }

  // Set up branch protection for each branch
  Object.entries(branchProtectionRules).forEach(([branch, rules]) => {
    setupBranchProtection(branch, rules);
  });

  console.log('\n🎉 Branch protection setup completed!');
  console.log('You can verify the settings at: https://github.com/' + REPO + '/settings/branches');
}

if (require.main === module) {
  main();
}