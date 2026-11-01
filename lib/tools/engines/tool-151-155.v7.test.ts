import { describe, expect, it } from 'vitest';
import { getPublishedCatalogTools } from '../smartToolsCatalog4';
import { calculateAccumulationScenario } from './tool-151-accumulation-half-life-simulator.v7';
import { recordSideEffects } from './tool-152-side-effect-tracker.v7';
import { recordSiteRotation } from './tool-153-injection-site-rotator.v7';
import { recordCompoundStack } from './tool-154-compound-stack-builder.v7';
import { recordProgress } from './tool-155-progress-tracker.v7';
describe('SmartTools 151–155 constrained contracts',()=>{
 it('151 performs bounded deterministic arithmetic with limitations',()=>{const r=calculateAccumulationScenario({initial_amount:100,half_life_days:10,interval_days:5,simulation_days:20});expect(r.status).toBe('CALCULATED');expect(Number.isFinite(r.peak_amount)).toBe(true);expect(r.disclaimer).toMatch(/not a dose/i);});
 it('152 records explicit user observations only',()=>{expect(recordSideEffects({entries:[{symptom:'headache',observedAt:'2026-10-27',severity:'user_noted'}]}).status).toBe('RECORDED');});
 it('153 records sites without instructions',()=>{expect(recordSiteRotation({entries:[{site:'left',usedOn:'2026-10-27'}]}).disclaimer).toMatch(/no injection instruction/i);});
 it('154 does not build a stack or dose',()=>{expect(recordCompoundStack({entries:[{compound:'example',enteredByUser:true}]}).disclaimer).toMatch(/no stack design/i);});
 it('155 records finite progress values',()=>{expect(recordProgress({entries:[{recordedOn:'2026-10-27',metric:'weight',value:80,unit:'kg'}]}).status).toBe('RECORDED');});
 it('publishes all five with preserved slugs',()=>{const s=getPublishedCatalogTools().map(t=>t.slug);for(const n of [151,152,153,154,155])expect(s).toContain(`tool-${n}-${n===151?'accumulation-half-life-simulator':n===152?'side-effect-tracker':n===153?'injection-site-rotator':n===154?'compound-stack-builder':'progress-tracker'}`);});
});
