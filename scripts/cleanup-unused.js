#!/usr/bin/env node

/**
 * Performance Cleanup Script
 * Removes unused files and empty directories to reduce bundle size
 * 
 * Usage: node scripts/cleanup-unused.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║     MrXSteroid Performance Cleanup Script                ║
║     Removing unused files and empty directories          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

// Files that are NOT imported anywhere (safe to delete)
const UNUSED_FILES = [
  // Shared lib - unused utilities
  'src/shared/lib/backend-notification-service.ts',
  'src/shared/lib/calculators.ts',
  'src/shared/lib/database-optimization.ts',
  'src/shared/lib/i18n-utils.ts',
  'src/shared/lib/i18n.ts',
  'src/shared/lib/sample-tests.ts',
  'src/shared/lib/schemas.test.ts',
  'src/shared/lib/schemas.ts',
  'src/shared/lib/testing-framework.ts',
  
  // Utils - unused optimization files
  'src/utils/bundle-optimization.ts',
  'src/utils/database-optimization.ts',
  'src/utils/memory-optimization.ts',
  
  // Security - unused (duplicates of shared/lib versions)
  'src/security/security-enhancements.ts',
  'src/security/session-management.ts',
  'src/security/two-factor-auth.ts',
  
  // Shared UI - unused components
  'src/shared/ui/Settings.tsx',
  
  // Shared hooks - unused
  'src/shared/hooks/useCurrency.ts',
  'src/shared/hooks/useReducedMotion.ts',
  
  // Features - unused
  'src/features/auth/ProtectedLayout.tsx',
  'src/features/rewards-social/rewards-social-manager.ts',
];

// Empty directories to remove
const EMPTY_DIRECTORIES = [
  'src/components/auth',
  'src/components/checkout',
  'src/components/layout',
  'src/components/marketing',
  'src/components/modals',
  'src/components/shared',
  'src/components/tools',
  'src/entities/order',
  'src/entities/payment',
  'src/entities/product',
  'src/entities/user',
  'src/processes',
  'src/services/core',
  'src/widgets',
];

let deletedFilesCount = 0;
let deletedDirsCount = 0;
let errorsCount = 0;

/**
 * Delete a file if it exists
 */
function deleteFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    try {
      const stats = fs.statSync(fullPath);
      fs.unlinkSync(fullPath);
      console.log(`${colors.green}✓${colors.reset} Deleted: ${filePath} (${Math.round(stats.size / 1024)}KB)`);
      deletedFilesCount++;
      return true;
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} Error deleting: ${filePath}`);
      errorsCount++;
      return false;
    }
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Not found: ${filePath}`);
    return false;
  }
}

/**
 * Delete a directory if it's empty
 */
function deleteEmptyDirectory(dirPath) {
  const fullPath = path.join(ROOT_DIR, dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    const files = fs.readdirSync(fullPath);
    if (files.length === 0) {
      try {
        fs.rmdirSync(fullPath);
        console.log(`${colors.green}✓${colors.reset} Deleted empty dir: ${dirPath}`);
        deletedDirsCount++;
        return true;
      } catch (error) {
        console.log(`${colors.red}✗${colors.reset} Error deleting dir: ${dirPath}`);
        errorsCount++;
        return false;
      }
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} Directory not empty: ${dirPath} (${files.length} files)`);
      return false;
    }
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Directory not found: ${dirPath}`);
    return false;
  }
}

// Main execution
console.log(`\n${colors.blue}📁 Scanning for unused files...${colors.reset}\n`);

// Delete unused files
UNUSED_FILES.forEach(deleteFile);

// Delete empty directories
console.log(`\n${colors.blue}📂 Scanning for empty directories...${colors.reset}\n`);

// First pass: delete known empty directories
EMPTY_DIRECTORIES.forEach(deleteEmptyDirectory);

// Second pass: find and delete any other empty directories in src/
function findAndDeleteEmptyDirs(dir, depth = 0) {
  if (depth > 5) return; // Prevent infinite recursion
  
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        findAndDeleteEmptyDirs(itemPath, depth + 1);
        
        // Check if directory is now empty after recursive deletion
        const remainingFiles = fs.readdirSync(itemPath);
        if (remainingFiles.length === 0) {
          const relativePath = path.relative(ROOT_DIR, itemPath);
          if (!relativePath.startsWith('..') && !relativePath.includes('node_modules')) {
            try {
              fs.rmdirSync(itemPath);
              console.log(`${colors.green}✓${colors.reset} Deleted empty dir: ${relativePath}`);
              deletedDirsCount++;
            } catch (e) {
              // Ignore errors
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

console.log(`${colors.blue}🔍 Deep scanning for additional empty directories...${colors.reset}\n`);
findAndDeleteEmptyDirs(SRC_DIR);

// Summary
console.log(`\n${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║                    Cleanup Summary                       ║
╠══════════════════════════════════════════════════════════╣
║  ${colors.green}✓ Files deleted:${colors.reset} ${String(deletedFilesCount).padEnd(42)}║
║  ${colors.green}✓ Directories deleted:${colors.reset} ${String(deletedDirsCount).padEnd(35)}║
║  ${colors.red}✗ Errors:${colors.reset} ${String(errorsCount).padEnd(51)}║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

if (deletedFilesCount > 0 || deletedDirsCount > 0) {
  console.log(`${colors.green}✨ Cleanup completed! Run 'npm run build' to see the improved bundle size.${colors.reset}\n`);
} else {
  console.log(`${colors.yellow}⚠ No cleanup needed. All files appear to be in use.${colors.reset}\n`);
}

process.exit(0);
