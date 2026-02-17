#!/usr/bin/env node

/**
 * Console.log Cleaner Script
 * Removes console.log, console.debug, and console.info statements
 * Keeps console.warn and console.error for production error tracking
 * 
 * Usage: node scripts/remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SRC_DIR = path.join(__dirname, '..', 'src');

// Patterns to remove
const CONSOLE_PATTERNS = [
    /console\.log\s*\([^)]*\)\s*;?/g,
    /console\.debug\s*\([^)]*\)\s*;?/g,
    /console\.info\s*\([^)]*\)\s*;?/g,
];

// Patterns to keep (warn, error)
const KEEP_PATTERNS = [
    /console\.warn/,
    /console\.error/,
];

let filesProcessed = 0;
let totalRemovals = 0;

function shouldSkipFile(filePath) {
    // Skip test files and node_modules
    const skipPatterns = [
        /__tests__/,
        /\.test\./,
        /\.spec\./,
        /node_modules/,
        /testing-framework/,
        /schemas\.test/,
        /sample-tests/,
    ];
    return skipPatterns.some(pattern => pattern.test(filePath));
}

function removeConsoleLogs(content) {
    let removals = 0;
    let newContent = content;

    CONSOLE_PATTERNS.forEach(pattern => {
        const matches = newContent.match(pattern);
        if (matches) {
            removals += matches.length;
            newContent = newContent.replace(pattern, '');
        }
    });

    // Clean up empty lines left behind
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return { content: newContent, removals };
}

function processFile(filePath) {
    if (shouldSkipFile(filePath)) {
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { content: newContent, removals } = removeConsoleLogs(content);

        if (removals > 0) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✓ ${filePath}: Removed ${removals} console statement(s)`);
            totalRemovals += removals;
        }

        filesProcessed++;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            processFile(filePath);
        }
    });
}

console.log('🧹 Starting console.log cleanup...\n');

walkDir(SRC_DIR);

console.log('\n=============================================');
console.log(`✓ Cleanup Complete!`);
console.log(`  Files processed: ${filesProcessed}`);
console.log(`  Console statements removed: ${totalRemovals}`);
console.log('=============================================\n');
