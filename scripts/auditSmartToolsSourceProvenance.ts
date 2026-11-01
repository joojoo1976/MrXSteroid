import fs from 'node:fs';
import path from 'node:path';
import { getPublishedCatalogTools } from '../lib/tools/smartToolsCatalog4';

type SourceDocument = {
  name: string;
  ids: Set<string>;
  range: boolean;
  externalUrlCount: number;
};

function csv(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function getNumericToolId(row: { slug: string; toolId: string }): string | null {
  // Legacy Tool #002 has no numeric ID in its registry toolId or slug. This
  // explicit alias is evidenced by the engine's Tool #002 source header and
  // attaches SMARTTOOLS_TOOL_002_SOURCES.md to the correct catalog row.
  if (row.slug === 'aromatization-risk' && row.toolId === 'mrx.tool.aromatization-risk') return '002';
  return row.slug.match(/^tool-(\d{3})-/)?.[1] ?? row.toolId.match(/(?:^|\.)(\d{3})(?:-|$)/)?.[1] ?? null;
}

function scanSourceDocuments(docsRoot: string): SourceDocument[] {
  return fs.readdirSync(docsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^SMARTTOOLS_.*SOURCES\.md$/i.test(entry.name))
    .map((entry) => {
      const rangeMatch = entry.name.match(/^SMARTTOOLS_(?:TOOLS?_)?(\d{3})_(\d{3})_SOURCES\.md$/i);
      const directMatch = entry.name.match(/^SMARTTOOLS_TOOL_(\d{3})_/i);
      const ids = new Set<string>();
      if (rangeMatch) {
        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        for (let id = start; id <= end; id += 1) ids.add(String(id).padStart(3, '0'));
      } else if (directMatch) {
        ids.add(directMatch[1]);
      }
      const contents = fs.readFileSync(path.join(docsRoot, entry.name), 'utf8');
      const externalUrlCount = (contents.match(/https?:\/\/[^\s)\]>]+/g) ?? []).length;
      return { name: entry.name, ids, range: Boolean(rangeMatch), externalUrlCount };
    });
}

function main() {
  const repositoryRoot = process.cwd();
  const docsRoot = path.join(repositoryRoot, 'docs');
  const outputPath = path.join(docsRoot, 'SMARTTOOLS_SOURCE_PROVENANCE_CROSSWALK.csv');
  const rows = getPublishedCatalogTools();
  const sourceDocs = scanSourceDocuments(docsRoot);
  const lines = [[
    'tool_id', 'slug', 'route', 'title_en', 'catalog_source_metadata', 'book_context',
    'numbered_source_documents', 'external_url_count', 'evidence_classification',
  ].join(',')];
  const classifications = new Map<string, number>();

  for (const row of rows) {
    const entry = row as typeof row & Record<string, unknown>;
    const numericId = getNumericToolId(row);
    const matchingDocs = numericId ? sourceDocs.filter((document) => document.ids.has(numericId)) : [];
    const hasSourceMetadata = Object.prototype.hasOwnProperty.call(entry, 'source') || Object.prototype.hasOwnProperty.call(entry, 'sources');
    const hasBookContext = Object.prototype.hasOwnProperty.call(entry, 'bookContext');
    const externalUrlCount = matchingDocs.reduce((sum, document) => sum + document.externalUrlCount, 0);
    const classification = hasSourceMetadata
      ? 'CATALOG_SOURCE_METADATA_PRESENT_UNVERIFIED'
      : matchingDocs.some((document) => !document.range) && externalUrlCount > 0
        ? 'DIRECT_TOOL_DOC_HAS_URL_UNVERIFIED'
        : matchingDocs.some((document) => !document.range)
          ? 'DIRECT_TOOL_DOC_NO_URL_CONTENT_REVIEW_REQUIRED'
          : matchingDocs.length > 0 && externalUrlCount > 0
            ? 'RANGE_DOC_HAS_URL_UNVERIFIED'
            : matchingDocs.length > 0
              ? 'RANGE_DOC_NO_URL_CONTENT_REVIEW_REQUIRED'
              : 'NO_NUMBERED_SOURCE_DOCUMENT_FOUND';
    classifications.set(classification, (classifications.get(classification) ?? 0) + 1);
    lines.push([
      csv(row.toolId),
      csv(row.slug),
      csv(row.href),
      csv(row.titleEn),
      csv(hasSourceMetadata),
      csv(hasBookContext),
      csv(matchingDocs.map((document) => document.name).join('; ')),
      csv(externalUrlCount),
      csv(classification),
    ].join(','));
  }

  if (!process.argv.includes('--write')) {
    process.stdout.write(`${JSON.stringify({ publishedRows: rows.length, sourceDocumentsScanned: sourceDocs.length, classifications: Object.fromEntries(classifications), output: outputPath, action: 'NOT_WRITTEN; rerun with --write to generate CSV' }, null, 2)}\n`);
    return;
  }

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ publishedRows: rows.length, sourceDocumentsScanned: sourceDocs.length, classifications: Object.fromEntries(classifications), output: outputPath, action: 'WRITTEN' }, null, 2)}\n`);
}

main();
