import { describe, it, expect } from 'vitest';
import { generateStaticParams } from '@/app/smarttools/[category]/[tool]/page';

describe('generateStaticParams debug', () => {
  it('returns params and lists tool 132/137/138/139', async () => {
    const params = await generateStaticParams();
    console.log('Total params:', params.length);
    const keys = ['tool-132-ai-pose-form-coach', 'tool-137-peptide-hormone-reconstitution-calculator', 'tool-138-raw-powder-density-oil-formulation-engine', 'tool-139-solvent-emulsifier-ratio-calculator'];
    for (const key of keys) {
      const found = params.find(p => p.tool === key);
      console.log(key, '->', found ? 'GENERATED' : 'MISSING');
    }
    expect(params.length).toBeGreaterThan(0);
  });
});
