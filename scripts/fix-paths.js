#!/usr/bin/env node

/**
 * Path Fixer Script
 * Fixes all incorrect import paths in the project
 * 
 * Usage: node scripts/fix-paths.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..', 'src');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║     MrXSteroid Import Path Fixer                         ║
║     Fixing incorrect import paths                        ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

// Path replacements map
const pathReplacements = [
  // Pattern to replace, replacement
  [/from ['"]\.\.\/lib\/supabase['"]/g, "from '../shared/lib/supabase'"],
  [/from ['"]\.\.\/lib\/error-handler['"]/g, "from '../shared/lib/error-handler'"],
  [/from ['"]\.\.\/lib\/logic['"]/g, "from '../shared/lib/logic'"],
  [/from ['"]\.\.\/lib\/mcp\/tools['"]/g, "from '../shared/lib/mcp/tools'"],
  [/from ['"]\.\.\/lib\/auth-service['"]/g, "from '../shared/lib/auth-service'"],
  [/from ['"]\.\.\/lib\/security-enhancements['"]/g, "from '../shared/lib/security-enhancements'"],
  [/from ['"]\.\.\/lib\/RealtimeSyncService['"]/g, "from '../shared/lib/RealtimeSyncService'"],
  
  [/from ['"]\.\/lib\/supabase['"]/g, "from './shared/lib/supabase'"],
  [/from ['"]\.\/lib\/error-handler['"]/g, "from './shared/lib/error-handler'"],
  [/from ['"]\.\/lib\/logic['"]/g, "from './shared/lib/logic'"],
  [/from ['"]\.\/lib\/mcp\/tools['"]/g, "from './shared/lib/mcp/tools'"],
  
  [/from ['"]\.\.\/types['"]/g, "from '../types'"], // Already fixed via index.ts
  [/from ['"]\.\/types['"]/g, "from './types'"],
  
  [/from ['"]\.\.\/utils\/logic['"]/g, "from '../shared/lib/logic'"],
  [/from ['"]\.\/utils\/logic['"]/g, "from './shared/lib/logic'"],
];

let filesFixed = 0;
let totalReplacements = 0;

/**
 * Fix paths in a single file
 */
function fixPathsInFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return false;
  }
  
  // Skip node_modules and dist
  if (filePath.includes('node_modules') || filePath.includes('dist')) {
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  let replacementsMade = 0;
  
  for (const [pattern, replacement] of pathReplacements) {
    const matches = newContent.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      replacementsMade += matches.length;
    }
  }
  
  if (replacementsMade > 0) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`${colors.green}✓${colors.reset} Fixed ${replacementsMade} import(s) in ${path.relative(SRC_DIR, filePath)}`);
    filesFixed++;
    totalReplacements += replacementsMade;
    return true;
  }
  
  return false;
}

/**
 * Recursively process all files in a directory
 */
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      processDirectory(itemPath);
    } else {
      fixPathsInFile(itemPath);
    }
  }
}

// Process all files in src directory
console.log(`\n${colors.cyan}🔧 Scanning and fixing import paths...${colors.reset}\n`);
processDirectory(SRC_DIR);

// Summary
console.log(`\n${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║                    Path Fix Summary                      ║
╠══════════════════════════════════════════════════════════╣
║  ${colors.green}✓ Files fixed:${colors.reset} ${String(filesFixed).padEnd(44)}║
║  ${colors.green}✓ Total replacements:${colors.reset} ${String(totalReplacements).padEnd(35)}║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

if (filesFixed > 0) {
  console.log(`${colors.green}✨ Path fixing completed! Run 'npm run build' to verify.${colors.reset}\n`);
} else {
  console.log(`${colors.yellow}⚠ No path fixes needed.${colors.reset}\n`);
}

process.exit(0);
