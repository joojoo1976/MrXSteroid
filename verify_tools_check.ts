import { getPublishedCatalogTools } from './lib/tools/smartToolsCatalog4';
import { TOOL_REGISTRY } from './lib/tools/registry';
import { getCategoryOfSlug, getCategory } from './lib/tools/categories';

const catalog = getPublishedCatalogTools();
const keys = ['mrx.tool.132-ai-pose-form-coach', 'mrx.tool.137-peptide-hormone-reconstitution-calculator', 'mrx.tool.138-raw-powder-density-oil-formulation-engine', 'mrx.tool.139-solvent-emulsifier-ratio-calculator'];

console.log('=== In published catalog ===');
for (const k of keys) {
  const t = catalog.find(x => x.toolId === k);
  console.log(k, '?', !!t, t ? t.href : '');
}

console.log('=== In registry ===');
for (const k of keys) {
  const r = TOOL_REGISTRY.find(x => x.toolId === k);
  console.log(k, '?', !!r, r ? r.href : '');
}

console.log('=== Category of slugs ===');
for (const k of keys) {
  const t = catalog.find(x => x.toolId === k);
  if (t) {
    console.log(t.slug, '->', getCategoryOfSlug(t.slug), getCategory(getCategoryOfSlug(t.slug))?.nameEn);
  }
}
