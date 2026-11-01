import { describe, expect, it } from 'vitest';
import { getPublishedCatalogTools } from '../smartToolsCatalog4';
import { recordPainNote } from './tool-166-injection-pain.v7';
import { convertMass } from './tool-167-ester-conversion.v7';
import { recordStackItems } from './tool-168-stacking-synergy.v7';
import { matchExplicitWarnings } from './tool-169-early-warning.v7';
import { calculateCost } from './tool-170-cycle-cost.v7';
describe('SmartTools 166–170 contracts',()=>{
 it('166 records a note only',()=>expect(recordPainNote({note:'x'}).disclaimer).toMatch(/no pain treatment/i));
 it('167 converts using explicit generic factor',()=>expect(convertMass({value:2,factor:3,unit:'u'}).value).toBe(6));
 it('168 records items without synergy',()=>expect(recordStackItems({items:['a']}).disclaimer).toMatch(/no synergy/i));
 it('169 matches only explicit selected signals',()=>expect(matchExplicitWarnings({signals:[{label:'x',selected:true}]}).status).toBe('MATCH'));
 it('170 sums supplied costs only',()=>expect(calculateCost({items:[{label:'a',cost:2},{label:'b',cost:3}],currency:'USD'}).total).toBe(5));
 it('publishes all five',()=>{const s=getPublishedCatalogTools().map(t=>t.slug);for(const n of ['166-injection-pain-minimizer','167-ester-conversion','168-compound-stacking-synergy','169-side-effect-early-warning','170-cycle-cost'])expect(s).toContain(`tool-${n}`);});
});
