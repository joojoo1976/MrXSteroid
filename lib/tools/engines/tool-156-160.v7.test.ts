import {describe,it,expect} from 'vitest';
import {recordWaterObservation} from './tool-156-water-retention.v7';
import {calculateMultiHalfLife} from './tool-157-multi-compound-half-life.v7';
import {calculateVolumeRatio} from './tool-158-volume-measurement.v7';
import {calculateHalfLifeScenario} from './tool-159-half-life-stacker.v7';
import {calculatePotentialScenario} from './tool-160-genetic-potential.v7';
describe('v7 tools 156-160',()=>{it('156 observes',()=>expect(recordWaterObservation({water_weight_kg:80,reference_weight_kg:78}).change_kg).toBe(2));it('157 strict',()=>expect(calculateMultiHalfLife({compounds:[{name:'x',half_life_days:7}]}).compounds[0].remaining_after_one_half_life).toBe(.5));it('158 divides',()=>expect(calculateVolumeRatio({amount_ml:1,container_ml:2}).ratio).toBe(.5));it('159 decay',()=>expect(calculateHalfLifeScenario({half_lives_days:[7],interval_days:7}).decay_factors[0]).toBe(.5));it('160 bounded',()=>expect(calculatePotentialScenario({height_cm:180,wrist_cm:17,ankle_cm:23}).status).toBe('CALCULATED'));});
