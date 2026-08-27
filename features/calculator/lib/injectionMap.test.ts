import { describe, it, expect } from 'vitest';
import { convertValue } from '../../../shared/lib/logic';

describe('InjectionMap — Pure Logic & Medical Constants', () => {

  describe('Fixed Anatomical Points', () => {
    const frontPoints = [
        { id: 'delt_side_l', baseId: 'delt_side', x: 30.16, y: 21.85 },
        { id: 'delt_side_r', baseId: 'delt_side', x: 66.19, y: 21.59 },
        { id: 'pecs_l', baseId: 'pecs', x: 40.24, y: 21.59 },
        { id: 'pecs_r', baseId: 'pecs', x: 55.04, y: 21.2 },
        { id: 'pecs_lower_l', baseId: 'pecs_lower', x: 44.1, y: 24.83 },
        { id: 'pecs_lower_r', baseId: 'pecs_lower', x: 52.68, y: 25.74 },
        { id: 'biceps_l', baseId: 'biceps', x: 31.23, y: 28.47 },
        { id: 'biceps_r', baseId: 'biceps', x: 66.19, y: 29.64 },
        { id: 'glute_ventro_l', baseId: 'glute_ventro', x: 36.39, y: 44.11 },
        { id: 'glute_ventro_r', baseId: 'glute_ventro', x: 59.98, y: 44.24 },
        { id: 'quad_outer_l', baseId: 'quad_outer', x: 35.53, y: 55.02 },
        { id: 'quad_outer_r', baseId: 'quad_outer', x: 60.62, y: 53.98 },
    ];

    const backPoints = [
        { id: 'traps_l', baseId: 'traps', x: 42.38, y: 17.17 },
        { id: 'traps_r', baseId: 'traps', x: 54.82, y: 17.17 },
        { id: 'delt_rear_l', baseId: 'delt_rear', x: 35.09, y: 20.94 },
        { id: 'delt_rear_r', baseId: 'delt_rear', x: 61.47, y: 20.42 },
        { id: 'triceps_l', baseId: 'triceps', x: 30.59, y: 26.91 },
        { id: 'triceps_r', baseId: 'triceps', x: 64.9, y: 26.26 },
        { id: 'lats_l', baseId: 'lats', x: 38.52, y: 30.16 },
        { id: 'lats_r', baseId: 'lats', x: 58.04, y: 29.51 },
        { id: 'glute_dorso_l', baseId: 'glute_dorso', x: 40.02, y: 40.16 },
        { id: 'glute_dorso_r', baseId: 'glute_dorso', x: 55.89, y: 39.77 },
        { id: 'calves_l', baseId: 'calves', x: 39.38, y: 67.56 },
        { id: 'calves_r', baseId: 'calves', x: 58.04, y: 67.56 },
    ];

    it('has 12 front anatomical points', () => {
        expect(frontPoints).toHaveLength(12);
    });

    it('has 12 back anatomical points', () => {
        expect(backPoints).toHaveLength(12);
    });

    it('each point has unique id', () => {
        const allIds = [...frontPoints, ...backPoints].map(p => p.id);
        const uniqueIds = new Set(allIds);
        expect(uniqueIds.size).toBe(allIds.length);
    });

    it('each point has left/right pair with same baseId', () => {
        const baseIds = [...frontPoints, ...backPoints].map(p => p.baseId);
        const counts = baseIds.reduce((acc, id) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        Object.values(counts).forEach(count => {
            expect(count).toBe(2); // Left + Right
        });
    });

    it('coordinates are within viewport bounds (0-100)', () => {
        [...frontPoints, ...backPoints].forEach(p => {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(100);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeLessThanOrEqual(100);
        });
    });

    it('front points are in upper/front region', () => {
        frontPoints.forEach(p => {
            expect(p.y).toBeLessThan(60); // Front view upper body
        });
    });

    it('back points cover upper and lower back', () => {
        const upperBack = backPoints.filter(p => p.y < 50);
        const lowerBack = backPoints.filter(p => p.y >= 50);
        expect(upperBack.length).toBeGreaterThan(0);
        expect(lowerBack.length).toBeGreaterThan(0);
    });
  });

  describe('Absorption Rate Constants', () => {
    const absorptionMap: Record<string, number> = {
        'glute_dorso': 98, 'delt_side': 95, 'quad_outer': 92, 'pecs': 88,
        'lats': 85, 'traps': 90, 'glute_ventro': 93, 'biceps': 82,
        'triceps': 84, 'calves': 78, 'forearms': 75, 'pecs_lower': 86,
        'delt_rear': 87
    };

    it('has absorption rates for all major sites', () => {
        expect(Object.keys(absorptionMap)).toHaveLength(13);
    });

    it('rates are in valid range (0-100)', () => {
        Object.values(absorptionMap).forEach(rate => {
            expect(rate).toBeGreaterThanOrEqual(0);
            expect(rate).toBeLessThanOrEqual(100);
        });
    });

    it('glute_dorso has highest absorption (98%)', () => {
        expect(absorptionMap['glute_dorso']).toBe(98);
    });

    it('forearms has lowest absorption (75%)', () => {
        expect(absorptionMap['forearms']).toBe(75);
    });

    it('all rates are integers', () => {
        Object.values(absorptionMap).forEach(rate => {
            expect(Number.isInteger(rate)).toBe(true);
        });
    });
  });

  describe('Risk Level Mapping', () => {
    const riskMap = { 'Low': 98, 'Medium': 75, 'High': 45 };

    it('maps Low → 98 safety', () => {
        expect(riskMap['Low']).toBe(98);
    });

    it('maps Medium → 75 safety', () => {
        expect(riskMap['Medium']).toBe(75);
    });

    it('maps High → 45 safety', () => {
        expect(riskMap['High']).toBe(45);
    });

    it('safety decreases as risk increases', () => {
        expect(riskMap['Low']).toBeGreaterThan(riskMap['Medium']);
        expect(riskMap['Medium']).toBeGreaterThan(riskMap['High']);
    });
  });

  describe('Volume Unit Conversion', () => {
    it('converts ml to oz for imperial', () => {
        const ml = 1.0;
        const oz = convertValue(ml, 'volume', 'imperial');
        expect(oz).toBeCloseTo(0.0338, 3);
    });

    it('converts 2.5ml to oz', () => {
        const oz = convertValue(2.5, 'volume', 'imperial');
        expect(oz).toBeCloseTo(0.0845, 3);
    });

    it('converts 5ml to oz', () => {
        const oz = convertValue(5.0, 'volume', 'imperial');
        expect(oz).toBeCloseTo(0.169, 3);
    });

    it('metric returns same value', () => {
        const ml = 2.5;
        const result = convertValue(ml, 'volume', 'metric');
        expect(result).toBe(2.5);
    });

    it('handles zero gracefully', () => {
        expect(convertValue(0, 'volume', 'imperial')).toBe(0);
    });

    it('handles edge case: 1ml = 0.0338oz', () => {
        expect(convertValue(1, 'volume', 'imperial')).toBeCloseTo(0.033814, 4);
    });
  });

  describe('Length Unit Conversion (Needle Depth)', () => {
    it('converts cm to inches for imperial', () => {
        const cm = 2.54;
        const inch = convertValue(cm, 'length', 'imperial');
        expect(inch).toBeCloseTo(1.0, 1);
    });

    it('converts 1 inch (2.54cm) to inches for imperial', () => {
        const inch = convertValue(2.54, 'length', 'imperial');
        expect(inch).toBeCloseTo(1.0, 1);
    });

    it('converts 0.5 inch (1.27cm) to inches for imperial', () => {
        const inch = convertValue(1.27, 'length', 'imperial');
        expect(inch).toBeCloseTo(0.5, 1);
    });

    it('converts 2 inch (5.08cm) to inches for imperial', () => {
        const inch = convertValue(5.08, 'length', 'imperial');
        expect(inch).toBeCloseTo(2.0, 1);
    });

    it('metric returns same value', () => {
        const cm = 2.54;
        const result = convertValue(cm, 'length', 'metric');
        expect(result).toBe(2.54);
    });
  });

  describe('Weight Unit Conversion', () => {
    it('converts kg to lbs for imperial', () => {
        const kg = 70;
        const lbs = convertValue(kg, 'weight', 'imperial');
        expect(lbs).toBeCloseTo(154.32, 1);
    });

    it('metric returns same value', () => {
        const kg = 70;
        const result = convertValue(kg, 'weight', 'metric');
        expect(result).toBe(70);
    });

    it('converts 80kg to lbs', () => {
        const lbs = convertValue(80, 'weight', 'imperial');
        expect(lbs).toBeCloseTo(176.37, 1);
    });
  });

  describe('Cell Stimulation Calculation', () => {
    it('calculates base cells from volume (1.25M per ml + 500k base)', () => {
        const volMl = 1.0;
        const cells = Math.floor(volMl * 1250000 + 500000);
        expect(cells).toBe(1750000);
    });

    it('scales linearly with volume', () => {
        const cells1 = Math.floor(1.0 * 1250000 + 500000);
        const cells2 = Math.floor(2.0 * 1250000 + 500000);
        expect(cells2).toBe(cells1 + 1250000);
    });

    it('3ml yields 4.25M cells', () => {
        const cells = Math.floor(3.0 * 1250000 + 500000);
        expect(cells).toBe(4250000);
    });
  });

  describe('Rotation Animation State', () => {
    it('front view when rotation <= 50', () => {
        const isFront = (rotation: number) => rotation <= 50;
        expect(isFront(0)).toBe(true);
        expect(isFront(50)).toBe(true);
        expect(isFront(51)).toBe(false);
    });

    it('back view when rotation > 50', () => {
        const isBack = (rotation: number) => rotation > 50;
        expect(isBack(51)).toBe(true);
        expect(isBack(100)).toBe(true);
        expect(isBack(50)).toBe(false);
    });
  });

  describe('Medical Advice Points (Arabic/English)', () => {
    const medicalAdvice = {
        eyebrow: 'إرشادات طبية',
        title: 'تنبيه طبي هام',
        intro: 'اتبع هذه القواعد لضمان حقن آمن وفعال:',
        points: [
            'استخدم إبرة جديدة ومعقمة لكل حقنة — لا تعيد الاستخدام أبداً.',
            'اعصر الجلد برفق ولا تسحبه — يمنع تلف الأنسجة والأوعية.',
            'اسحب المكبس قبل الحقن (Aspiration) — إذا ظهر دم، غير الموقع فوراً.',
            'حقن ببطء (10 ثواني/مل) — يقلل الألم ويمنع الخراجات.',
            'دلك الموقع بلطف بعد الحقن — يحسن الامتصاص ويمنع التصلب.',
            'لا تحقن في نفس الموقع قبل ٧ أيام — منع التليف الدهني.'
        ],
        warning: 'أي علامات عدوى (احمرار، سخونة، صديد) تستدعي مراجعة طبية فورية.',
        footer: 'هذه المعلومات للأغراض التعليمية فقط. استشر طبيبك قبل أي بروتوكول حقن.'
    };

    it('has 6 medical advice points', () => {
        expect(medicalAdvice.points).toHaveLength(6);
    });

    it('each point is non-empty string', () => {
        medicalAdvice.points.forEach(point => {
            expect(typeof point).toBe('string');
            expect(point.length).toBeGreaterThan(0);
        });
    });

    it('includes aspiration warning', () => {
        const hasAspiration = medicalAdvice.points.some(p => p.includes('Aspiration') || p.includes('اسحب المكبس'));
        expect(hasAspiration).toBe(true);
    });

    it('includes rotation advice (7 days)', () => {
        const hasRotation = medicalAdvice.points.some(p => p.includes('٧ أيام') || p.includes('7 days'));
        expect(hasRotation).toBe(true);
    });

    it('includes infection warning', () => {
        expect(medicalAdvice.warning).toContain('عدوى');
    });
  });

  describe('Golden Hour Protocol', () => {
    const goldenAdvice = 'استخدم الحرارة الخفيفة والحركة المعتدلة خلال الساعة الأولى بعد الحقن — يزيد تدفق الدم، يسرع الامتصاص، ويقلل التيبس بنسبة ٤٠٪. تجنب الثلج، التدليك القاسي، والتمارين العنيفة لمدة ٦ ساعات.';

    it('contains heat recommendation', () => {
        expect(goldenAdvice).toContain('حرارة');
    });

    it('contains 40% reduction claim', () => {
        expect(goldenAdvice).toContain('٤٠٪');
    });

    it('warns against ice and heavy massage', () => {
        expect(goldenAdvice).toContain('الثلج');
        expect(goldenAdvice).toContain('التدليك القاسي');
    });

    it('specifies 6-hour restriction', () => {
        expect(goldenAdvice).toContain('٦ ساعات');
    });
  });
});