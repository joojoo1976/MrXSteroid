#!/usr/bin/env node
/**
 * Regenerate the Tool 041 138-row cross-tabulation from the current ledger.
 *
 * This is a thin, reproducible wrapper around the acceptance calculator.
 * It writes only the three cross-tab artifacts and never changes the ledger.
 *
 * Run:
 *   node "docs/MRX Genius Cloud Unified R6.1/tool-041-ledger-crosstab.mjs"
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_LEDGER,
  computeSummary,
  ledgerFingerprint,
  loadLedger,
  writeCrossTabFiles,
} from './tool-041-acceptance-calc.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const { rows, header } = loadLedger(DEFAULT_LEDGER);
const fingerprint = ledgerFingerprint(DEFAULT_LEDGER);
const summary = computeSummary(rows, { ...fingerprint, header });

writeCrossTabFiles(rows, summary, fingerprint, HERE);

console.log('TOOL 041 - 138-row cross-tabulation');
console.log(`ledger_sha256=${fingerprint.sha256}`);
console.log(`rows=${summary.totals.rows} applicable=${summary.totals.applicable} not_applicable=${summary.totals.not_applicable}`);
console.log(`completion=${summary.completion.display}`);
console.log(`integrity=${summary.integrity.ok ? 'OK' : 'FAILED'}`);

if (!summary.integrity.ok) process.exitCode = 1;
