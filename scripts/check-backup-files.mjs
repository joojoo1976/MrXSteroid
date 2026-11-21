#!/usr/bin/env node
/**
 * CI artifact guard (Phase 9).
 *
 * Fails when a backup/merge artifact is committed or left in the tree:
 *   *.bak, *.orig, *~ (including names like `file.ts.orig`)
 *
 * Generated/vendor directories are skipped; they are not source deliverables.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'coverage', '.vercel']);
const BAD_SUFFIXES = ['.bak', '.orig'];

function isBadName(name) {
    return BAD_SUFFIXES.some((suffix) => name.endsWith(suffix)) || name.endsWith('~');
}

function walk(dir, offenders) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), offenders);
            continue;
        }
        if (isBadName(entry.name)) {
            offenders.push(path.relative(ROOT, path.join(dir, entry.name)).split(path.sep).join('/'));
        }
    }
}

const offenders = [];
walk(ROOT, offenders);

if (offenders.length > 0) {
    console.error('❌ Backup/merge artifacts are not allowed:');
    for (const file of offenders.sort()) console.error(`   ${file}`);
    console.error('\nRemove them before committing or building.');
    process.exit(1);
}

console.log('✅ No backup/merge artifacts found.');
