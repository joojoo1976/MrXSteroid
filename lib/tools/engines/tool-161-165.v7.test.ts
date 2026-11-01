import { describe, expect, it } from 'vitest';
import { getPublishedCatalogTools } from '../smartToolsCatalog4';
import { recordPeptidePlan } from './tool-161-peptide-protocol-planner.v7';
import { recordOralCycleNote } from './tool-162-oral-cycle-planner.v7';
import { compareTrtValues } from './tool-163-trt-optimization.v7';
import { recordLabObservation } from './tool-164-post-cycle-bloodwork.v7';
import { recordInteractionItems } from './tool-165-drug-interaction.v7';
describe('SmartTools 161–165 constrained contracts',()=>{
 it('161 and 162 stay user-note only',()=>{expect(recordPeptidePlan({name:'x'}).disclaimer).toMatch(/no peptide protocol/i);expect(recordOralCycleNote({name:'x'}).disclaimer).toMatch(/no cycle design/i);});
 it('163 compares values without TRT optimization',()=>{const r=compareTrtValues({current_value:2,target_value:3,unit:'unit'});expect(r.difference).toBe(1);expect(r.disclaimer).toMatch(/no TRT dose optimization/i);});
 it('164 records labs without interpretation',()=>{expect(recordLabObservation({marker:'x',value:1,unit:'u'}).disclaimer).toMatch(/no interpretation/i);});
 it('165 records items without interaction conclusion',()=>{expect(recordInteractionItems({items:['a','b']}).disclaimer).toMatch(/no interaction conclusion/i);});
 it('publishes all five identities',()=>{const s=getPublishedCatalogTools().map(t=>t.slug);for(const n of ['161-peptide-protocol-planner','162-oral-cycle-planner','163-trt-optimization-engine','164-post-cycle-bloodwork-interpreter','165-drug-interaction-checker-pro'])expect(s).toContain(`tool-${n}`);});
});
