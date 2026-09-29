# Read-Only SEO Gap Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete a comprehensive Read-Only SEO Gap Audit (Sections 1–15) using only repository source code, migrations, and schema definitions. Produce a verification SQL script for Production DB that the user can run in Supabase SQL Editor. No Production DB access, no code changes, no writes.

**Architecture:** Pure static analysis of repository assets — grep/glob/read on source files, migrations, tests, and schema definitions. Cross-reference code references to DB columns/tables against actual migration SQL. Output: audit report + read-only SQL verification script + blocked items list.

**Tech Stack:** TypeScript/Next.js, Supabase/PostgreSQL, Vitest, existing repo tooling.

**Spec:** Master Prompt Sections 1–15 (SEO Gap Audit requirements from conversation checkpoint).

## Global Constraints

- NO Production DB connection, NO credentials, NO writes (INSERT/UPDATE/DELETE/ALTER/DROP/TRUNCATE).
- SQL verification script: SELECT/metadata only.
- Do NOT modify any files in working tree (especially payment/Kashier/Egypt files).
- When Production DB evidence required → mark `STATUS = BLOCKED / REQUIRES PRODUCTION DB EVIDENCE`.
- Production DB state recorded as: `BLOCKED — NO VERIFIED PRODUCTION DB ACCESS`.

## Review Focus

1. **Column existence mismatch** — code references columns that migrations never created.
2. **Type/nullable drift** — code assumes NOT NULL but migration allows NULL (or vice versa).
3. **Missing indexes** — refresh/scheduler queries reference columns without supporting indexes.
4. **Scheduler/provenance gaps** — background jobs reference tables/columns not in migrations.
5. **Test coverage gaps** — integration tests assume Production schema that may not exist.

---

### Task 1: Inventory SEO-relevant source files & migrations

**Files:**
- Read: All files matching SEO/keyword/intelligence/scheduler patterns
- Read: `supabase/migrations/*seo*` and `*keyword*` and `*intelligence*`
- Test: N/A (discovery only)

**Interfaces:**
- Consumes: Repository file tree
- Produces: Manifest of all SEO-related code files + migration files

- [ ] **Step 1.1: Glob SEO-related source files**
```bash
# Patterns: **/*seo*, **/*keyword*, **/*intelligence*, **/*scheduler*, **/*pipeline*, **/*refresh*
```

- [ ] **Step 1.2: List SEO-related migrations**
```bash
ls supabase/migrations/*seo* supabase/migrations/*keyword* supabase/migrations/*intelligence* supabase/migrations/*telemetry* 2>/dev/null
```

- [ ] **Step 1.3: Read each migration file fully**

---

### Task 2: Audit Schema Definitions (Migrations → Tables/Columns)

**Files:**
- Read: Migration SQL for SEO tables
- Produce: Table/column map with types, nullability, defaults, indexes, constraints

**Interfaces:**
- Consumes: Migration files from Task 1
- Produces: Canonical schema map for SEO tables

- [ ] **Step 2.1: Parse each SEO migration for CREATE TABLE, ALTER TABLE, CREATE INDEX, constraints**
- [ ] **Step 2.2: Extract columns: `last_analyzed_at`, `last_scored_at`, `last_observed_at`, `last_seen_at`, `is_pinned` — note table, type, nullable, default**
- [ ] **Step 2.3: Extract all indexes/constraints on these columns**
- [ ] **Step 2.4: Note any other SEO-relevant columns referenced in code but missing from migrations**

---

### Task 3: Audit Code References to SEO Schema

**Files:**
- Read: Source files from Task 1 (persistence, refresh, scheduler, provenance, reports, pipelines)
- Produce: Cross-reference map: code reference → migration definition

**Interfaces:**
- Consumes: Source files, schema map from Task 2
- Produces: Drift report (code vs migrations)

- [ ] **Step 3.1: Search for all references to the 5 target columns in TypeScript/TSX files**
- [ ] **Step 3.2: Search for table names used in SEO code (seo_keywords, seo_intelligence, seo_telemetry, etc.)**
- [ ] **Step 3.3: Search for SQL queries (raw or query builder) referencing SEO tables/columns**
- [ ] **Step 3.4: Search for Supabase client calls (.from(), .select(), .upsert(), .update()) on SEO tables**
- [ ] **Step 3.5: Compare each code reference to migration schema — flag mismatches**

---

### Task 4: Audit Refresh Flow & Scheduler

**Files:**
- Read: Scheduler/cron files, refresh pipeline files, background job definitions
- Produce: Refresh flow map + scheduler config + provenance tracking

**Interfaces:**
- Consumes: Source files from Task 1
- Produces: Refresh/scheduler audit section

- [ ] **Step 4.1: Find scheduler/cron definitions (vercel.json, package.json scripts, Supabase cron, custom schedulers)**
- [ ] **Step 4.2: Trace refresh pipeline: entry point → keyword fetch → scoring → persistence → provenance**
- [ ] **Step 4.3: Identify all DB writes in refresh flow (upsert targets, column assignments)**
- [ ] **Step 4.4: Verify each write target exists in migration schema**
- [ ] **Step 4.5: Check for idempotency keys, deduplication, transaction boundaries**

---

### Task 5: Audit Provenance & Reports

**Files:**
- Read: Provenance tracking code, report generation, admin/dashboard APIs
- Produce: Provenance/report audit section

**Interfaces:**
- Consumes: Source files from Task 1
- Produces: Provenance/report audit section

- [ ] **Step 5.1: Find provenance column writes (source, fetched_at, raw_payload, etc.)**
- [ ] **Step 5.2: Find report/admin API endpoints reading SEO tables**
- [ ] **Step 5.3: Verify report queries match actual schema**

---

### Task 6: Audit Tests for Schema Assumptions

**Files:**
- Read: SEO-related test files (integration/unit)
- Produce: Test assumptions vs migration reality

**Interfaces:**
- Consumes: Test files from Task 1
- Produces: Test audit section

- [ ] **Step 6.1: List all SEO test files**
- [ ] **Step 6.2: Extract schema assumptions from test setup/mocks/fixtures**
- [ ] **Step 6.3: Compare test assumptions to migration schema**

---

### Task 7: Generate Read-Only SQL Verification Script

**Files:**
- Create: `docs/superpowers/sql/2026-09-28-seo-production-verification.sql`
- Produce: SELECT-only script for Supabase SQL Editor

**Interfaces:**
- Consumes: Schema map from Task 2, code references from Task 3
- Produces: Verification SQL file

- [ ] **Step 7.1: Write SELECT queries for information_schema.columns on target tables**
- [ ] **Step 7.2: Write SELECT queries for pg_indexes on target tables/columns**
- [ ] **Step 7.3: Write SELECT queries for pg_constraint on target tables**
- [ ] **Step 7.4: Write SELECT to check migration version applied (supabase_migrations.schema_migrations)**
- [ ] **Step 7.5: Write SELECT to sample row data for the 5 columns (verify nullable/default behavior)**
- [ ] **Step 7.6: Ensure ZERO write statements (no INSERT/UPDATE/DELETE/ALTER/DROP/TRUNCATE)**

---

### Task 8: Compile Final Audit Report

**Files:**
- Create: `docs/superpowers/reports/2026-09-28-seo-gap-audit.md`
- Produce: Complete Sections 1–15 + blocked items list

**Interfaces:**
- Consumes: All previous task outputs
- Produces: Final deliverable

- [ ] **Step 8.1: Write Section 1 — Executive Summary**
- [ ] **Step 8.2: Write Section 2 — Schema Inventory (Tables/Columns from Migrations)**
- [ ] **Step 8.3: Write Section 3 — Column Deep-Dive (5 target columns)**
- [ ] **Step 8.4: Write Section 4 — Index/Constraint Coverage**
- [ ] **Step 8.5: Write Section 5 — Code-to-Schema Drift Analysis**
- [ ] **Step 8.6: Write Section 6 — Refresh Pipeline Audit**
- [ ] **Step 8.7: Write Section 7 — Scheduler/Cron Audit**
- [ ] **Step 8.8: Write Section 8 — Provenance Tracking Audit**
- [ ] **Step 8.9: Write Section 9 — Report/Admin API Audit**
- [ ] **Step 8.10: Write Section 10 — Test Coverage vs Schema**
- [ ] **Step 8.11: Write Section 11 — Migration Application Status (from SQL script output placeholder)**
- [ ] **Step 8.12: Write Section 12 — Missing Columns/Tables Referenced in Code**
- [ ] **Step 8.13: Write Section 13 — Risk Assessment**
- [ ] **Step 8.14: Write Section 14 — Recommended Fixes (code-only, no Production changes)**
- [ ] **Step 8.15: Write Section 15 — Blocked Items Requiring Production DB Evidence**
- [ ] **Step 8.16: Append SQL verification script path**

---

### Task 9: Verify Deliverables

- [ ] **Step 9.1: Confirm audit report exists at `docs/superpowers/reports/2026-09-28-seo-gap-audit.md`**
- [ ] **Step 9.2: Confirm SQL script exists at `docs/superpowers/sql/2026-09-28-seo-production-verification.sql`**
- [ ] **Step 9.3: Confirm SQL script contains only SELECT/metadata queries**
- [ ] **Step 9.4: Confirm no files modified in working tree (git status clean except pre-existing changes)**
- [ ] **Step 9.5: STOP and present to user**