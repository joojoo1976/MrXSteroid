/**
 * lib/tools/engines/hcg-serm-protocol.ts
 * ════════════════════════════════════════════════════════════════════════════
 *  Tool #005 — Layer 1: Intelligent HCG & SERM Protocol Generator
 *  Platform: MrXSteroid.com | Core: HPTA Recovery Modeling & Receptor Dynamics
 * ════════════════════════════════════════════════════════════════════════════
 * Pure clinical and pharmacokinetic engine (no React, no DOM, no side-effects).
 * Calculates:
 *   1. Compound Suppression Score (S-Score) using multi-compound weights and duration
 *   2. Testicular Desensitization & HCG Priming requirement
 *   3. Dynamic SERM Selection & Auto-switching (ocular, mood, gyno sensitivities)
 *   4. 4-Phase Protocol Roadmap (HCG Priming -> Kickstart -> Stabilization -> Weaning)
 */

export interface CompoundDosageItem {
    nameEn: string;
    nameAr: string;
    weeklyDoseMg: number;
    suppressionFactor: number; // Kj factor
}

export const COMPOUND_SUPPRESSION_CATALOG: readonly {
    id: string;
    nameEn: string;
    nameAr: string;
    factor: number;
    defaultDoseMg: number;
}[] = [
    { id: 'testosterone', nameEn: 'Testosterone (All Esters)', nameAr: 'تستوستيرون (كافة الإسترات)', factor: 1.0, defaultDoseMg: 500 },
    { id: 'nandrolone', nameEn: 'Nandrolone (Deca / NPP)', nameAr: 'ناندرولون (ديكا / NPP)', factor: 3.0, defaultDoseMg: 300 },
    { id: 'trenbolone', nameEn: 'Trenbolone (Ace / Enan)', nameAr: 'ترينبولون (أسيتات / إينانثات)', factor: 3.5, defaultDoseMg: 350 },
    { id: 'masteron', nameEn: 'Masteron (Drostanolone)', nameAr: 'ماستيرون (دروستانولون)', factor: 2.5, defaultDoseMg: 400 },
    { id: 'boldenone', nameEn: 'Boldenone (Equipoise)', nameAr: 'بولدينون (إكويبويز)', factor: 2.2, defaultDoseMg: 400 },
    { id: 'anavar', nameEn: 'Anavar (Oxandrolone)', nameAr: 'أنفار (أوكساندرولون)', factor: 0.4, defaultDoseMg: 50 },
    { id: 'winstrol', nameEn: 'Winstrol (Stanozolol)', nameAr: 'وينسترول (ستانوزولول)', factor: 0.5, defaultDoseMg: 50 },
    { id: 'dianabol', nameEn: 'Dianabol (Methandrostenolone)', nameAr: 'ديانابول (ميثاندروستينولون)', factor: 1.8, defaultDoseMg: 30 },
] as const;

export type TesticularStatus = 'normal' | 'mild_atrophy' | 'severe_atrophy';
export const TESTICULAR_STATUS_OPTIONS: readonly TesticularStatus[] = ['normal', 'mild_atrophy', 'severe_atrophy'] as const;

export type SermAvailability = 'enclomiphene' | 'nolvadex' | 'clomid' | 'toremifene' | 'auto_select';
export const SERM_AVAILABILITY_OPTIONS: readonly SermAvailability[] = ['enclomiphene', 'nolvadex', 'clomid', 'toremifene', 'auto_select'] as const;

export interface SideEffectProfile {
    ocularSensitivity: boolean;
    moodSensitivity: boolean;
    jointPain: boolean;
    gynoHistory: boolean;
}

export interface HcgSermEngineInput {
    compounds: Array<{
        catalogId: string;
        customName?: string;
        weeklyDoseMg: number;
    }>;
    cycleWeeks: number;
    testicularStatus: TesticularStatus;
    preferredSerm: SermAvailability;
    sideEffects: SideEffectProfile;
    bodyWeightKg?: number;
    washoutEndDateIso?: string;
}

export type SuppressionSeverity = 'mild' | 'moderate' | 'severe';

export interface ProtocolPhase {
    phaseNumber: number;
    nameKey: 'phase_0' | 'phase_1' | 'phase_2' | 'phase_3';
    titleEn: string;
    titleAr: string;
    durationWeeks: number;
    drugNameEn: string;
    drugNameAr: string;
    dosageDescriptionEn: string;
    dosageDescriptionAr: string;
    instructionsEn: string;
    instructionsAr: string;
    warningKey?: string;
}

export interface HcgSermResult {
    sScore: number;
    severity: SuppressionSeverity;
    severityLabelEn: string;
    severityLabelAr: string;
    totalDurationWeeks: number;
    selectedSermId: 'enclomiphene' | 'nolvadex' | 'clomid' | 'toremifene';
    selectedSermNameEn: string;
    selectedSermNameAr: string;
    isAutoSwitched: boolean;
    autoSwitchReasonKey?: string;
    autoSwitchReasonEn?: string;
    autoSwitchReasonAr?: string;
    hcgRequired: boolean;
    hcgReasonEn?: string;
    hcgReasonAr?: string;
    phases: ProtocolPhase[];
    bloodworkPanelPromptEn: string;
    bloodworkPanelPromptAr: string;
}

/**
 * Calculates compound suppression score:
 * S = sum(K_j * (Dose_j / 100)) * ln(CycleWeeks + 1)
 */
export function calculateSuppressionScore(
    compounds: Array<{ catalogId: string; weeklyDoseMg: number }>,
    cycleWeeks: number,
): { sScore: number; severity: SuppressionSeverity } {
    let baseScore = 0;

    for (const c of compounds) {
        const found = COMPOUND_SUPPRESSION_CATALOG.find((cat) => cat.id === c.catalogId);
        const factor = found ? found.factor : 1.0;
        const doseFraction = Math.max(10, c.weeklyDoseMg) / 100; // normalized to 100mg TRT reference
        baseScore += factor * doseFraction;
    }

    if (compounds.length === 0) {
        baseScore = 5.0; // fallback default
    }

    const durationFactor = Math.log(Math.max(4, cycleWeeks) + 1);
    const rawScore = (baseScore / 3) * durationFactor;
    const sScore = Math.round(rawScore * 10) / 10;

    let severity: SuppressionSeverity = 'moderate';
    if (sScore < 3.0) severity = 'mild';
    else if (sScore > 7.0) severity = 'severe';

    return { sScore, severity };
}

/**
 * Resolves the optimal SERM based on user preference and contraindications.
 */
export function resolveSermSelection(
    preferred: SermAvailability,
    sideEffects: SideEffectProfile,
): {
    selectedSermId: 'enclomiphene' | 'nolvadex' | 'clomid' | 'toremifene';
    isAutoSwitched: boolean;
    autoSwitchReasonKey?: string;
    autoSwitchReasonEn?: string;
    autoSwitchReasonAr?: string;
} {
    // 1. Gynecomastia history demands Tamoxifen (Nolvadex) for direct mammary ER competition
    if (sideEffects.gynoHistory && preferred !== 'nolvadex') {
        return {
            selectedSermId: 'nolvadex',
            isAutoSwitched: true,
            autoSwitchReasonKey: 'auto_switch_nolvadex',
            autoSwitchReasonEn: 'Auto-switched to Nolvadex (Tamoxifen) to ensure direct estrogen receptor antagonism in breast tissue.',
            autoSwitchReasonAr: 'تم التحويل التلقائي إلى نولفادكس (Nolvadex) لحصار مستقبلات الاستروجين في نسيج الثدي نظراً لوجود تاريخ تثدي.',
        };
    }

    // 2. Ocular/vision issues preclude standard Clomid (Zuclomiphene isomer accumulation)
    if (sideEffects.ocularSensitivity && (preferred === 'clomid' || preferred === 'auto_select')) {
        return {
            selectedSermId: 'enclomiphene',
            isAutoSwitched: true,
            autoSwitchReasonKey: 'auto_switch_enclomiphene',
            autoSwitchReasonEn: 'Auto-switched to Enclomiphene to eliminate the ocular-toxic zuclomiphene isomer present in standard Clomid.',
            autoSwitchReasonAr: 'تم التحويل التلقائي إلى إينكلوميفين (Enclomiphene) لتفادي أيزومر زوكلوميفين المسبب للاضطرابات البصرية في الكلوميد.',
        };
    }

    // 3. User explicit choice (unless auto_select)
    if (preferred !== 'auto_select') {
        return {
            selectedSermId: preferred,
            isAutoSwitched: false,
        };
    }

    // 4. Default optimal selection
    if (sideEffects.moodSensitivity) {
        return {
            selectedSermId: 'enclomiphene',
            isAutoSwitched: false,
        };
    }

    return {
        selectedSermId: 'nolvadex',
        isAutoSwitched: false,
    };
}

/**
 * Generates the full personalized clinical protocol.
 */
export function calculateHcgSermProtocol(input: HcgSermEngineInput): HcgSermResult {
    const { sScore, severity } = calculateSuppressionScore(input.compounds, input.cycleWeeks);
    const { selectedSermId, isAutoSwitched, autoSwitchReasonKey, autoSwitchReasonEn, autoSwitchReasonAr } =
        resolveSermSelection(input.preferredSerm, input.sideEffects);

    // HCG is required if testicular atrophy exists, S-Score is severe, or cycle >= 16 weeks
    const hcgRequired =
        input.testicularStatus !== 'normal' ||
        severity === 'severe' ||
        input.cycleWeeks >= 16;

    let hcgReasonEn: string | undefined;
    let hcgReasonAr: string | undefined;

    if (hcgRequired) {
        if (input.testicularStatus === 'severe_atrophy') {
            hcgReasonEn = 'Severe Leydig cell atrophy detected. Intensive gonadotropin priming required before SERMs.';
            hcgReasonAr = 'تم رصد ضمور شديد في خلايا لايديغ؛ يتطلب ذلك تهيئة مكثفة بـ HCG قبل بدء الـ SERMs.';
        } else if (severity === 'severe') {
            hcgReasonEn = 'High suppressive compound load (S-Score > 7.0). Priming required to sensitize testicular response.';
            hcgReasonAr = 'حمل دوائي عالي التثبيط (S-Score أكبر من 7.0)؛ يستلزم تنشيط استجابة الخصية قبل الـ SERMs.';
        } else {
            hcgReasonEn = 'Prolonged cycle duration (≥16 weeks) justifies Leydig receptor reactivation.';
            hcgReasonAr = 'طول فترة الدورة (16 أسبوعاً أو أكثر) يستوجب إعادة حساسية مستقبلات الخصية للهرمونات الموجهة.';
        }
    }

    const phases: ProtocolPhase[] = [];

    // Phase 0: HCG Priming (if needed)
    if (hcgRequired) {
        const hcgDuration = input.testicularStatus === 'severe_atrophy' ? 3 : 2;
        const doseDscEn = input.testicularStatus === 'severe_atrophy'
            ? '2000 IU subQ every other day (EOD)'
            : '1000-1500 IU subQ 3x per week (Mon/Wed/Fri)';
        const doseDscAr = input.testicularStatus === 'severe_atrophy'
            ? '2000 وحدة دولية تحت الجلد يوماً بعد يوم'
            : '1000 - 1500 وحدة دولية تحت الجلد 3 مرات أسبوعياً';

        phases.push({
            phaseNumber: 0,
            nameKey: 'phase_0',
            titleEn: 'Phase 0: HCG Priming',
            titleAr: 'المرحلة 0: التجهيز بـ HCG',
            durationWeeks: hcgDuration,
            drugNameEn: 'Human Chorionic Gonadotropin (hCG)',
            drugNameAr: 'موجهة الغدد التناسلية المشيمائية (hCG)',
            dosageDescriptionEn: doseDscEn,
            dosageDescriptionAr: doseDscAr,
            instructionsEn: 'Administer during compound washout. STOP HCG at least 48 hours before Phase 1 to prevent secondary LH suppression.',
            instructionsAr: 'تُعطى أثناء فترة تلاشي المركبات. توقف تماماً عن HCG قبل 48 ساعة من المرحلة 1 لتجنب قمع الـ LH.',
            warningKey: 'hcg_stop_warning',
        });
    }

    // SERM Drug details
    const sermNames: Record<typeof selectedSermId, { en: string; ar: string; kickstartDose: { en: string; ar: string }; stabDose: { en: string; ar: string }; weanDose: { en: string; ar: string } }> = {
        enclomiphene: {
            en: 'Enclomiphene Citrate',
            ar: 'إينكلوميفين سترات',
            kickstartDose: { en: '25 mg daily', ar: '25 ملغ يومياً' },
            stabDose: { en: '12.5 mg daily', ar: '12.5 ملغ يومياً' },
            weanDose: { en: '12.5 mg every other day', ar: '12.5 ملغ يوماً بعد يوم' },
        },
        nolvadex: {
            en: 'Tamoxifen (Nolvadex)',
            ar: 'تاموكسيفين (نولفادكس)',
            kickstartDose: { en: '40 mg daily (2 weeks)', ar: '40 ملغ يومياً (أسبوعان)' },
            stabDose: { en: '20 mg daily', ar: '20 ملغ يومياً' },
            weanDose: { en: '10 mg daily', ar: '10 ملغ يومياً' },
        },
        clomid: {
            en: 'Clomiphene (Clomid)',
            ar: 'كلوميفين (كلوميد)',
            kickstartDose: { en: '50 mg daily', ar: '50 ملغ يومياً' },
            stabDose: { en: '25 mg daily', ar: '25 ملغ يومياً' },
            weanDose: { en: '25 mg every other day', ar: '25 ملغ يوماً بعد يوم' },
        },
        toremifene: {
            en: 'Toremifene (Fareston)',
            ar: 'توريميفين (فاريستون)',
            kickstartDose: { en: '60 mg daily', ar: '60 ملغ يومياً' },
            stabDose: { en: '30 mg daily', ar: '30 ملغ يومياً' },
            weanDose: { en: '30 mg every other day', ar: '30 ملغ يوماً بعد يوم' },
        },
    };

    const sermDetail = sermNames[selectedSermId];

    // Protocol Length: 4, 6, or 8 weeks based on severity
    let sermWeeks = 6;
    if (severity === 'mild') sermWeeks = 4;
    else if (severity === 'severe') sermWeeks = 8;

    const phase1Weeks = 2;
    const phase2Weeks = sermWeeks === 4 ? 1 : sermWeeks === 6 ? 2 : 3;
    const phase3Weeks = sermWeeks - phase1Weeks - phase2Weeks;

    // Phase 1: Kickstart
    phases.push({
        phaseNumber: 1,
        nameKey: 'phase_1',
        titleEn: 'Phase 1: HPTA Kickstart',
        titleAr: 'المرحلة 1: إعادة تشغيل المحور',
        durationWeeks: phase1Weeks,
        drugNameEn: sermDetail.en,
        drugNameAr: sermDetail.ar,
        dosageDescriptionEn: sermDetail.kickstartDose.en,
        dosageDescriptionAr: sermDetail.kickstartDose.ar,
        instructionsEn: 'Take with food once daily morning or evening. Blocks hypothalamic estrogen receptors to spike endogenous GnRH and LH secretion.',
        instructionsAr: 'تؤخذ مع الطعام مرة يومياً. تعمل على حظر مستقبلات الاستروجين في الوطاء لتحفيز إفراز GnRH و LH.',
    });

    // Phase 2: Stabilization
    phases.push({
        phaseNumber: 2,
        nameKey: 'phase_2',
        titleEn: 'Phase 2: Receptor Stabilization',
        titleAr: 'المرحلة 2: استقرار المستقبلات',
        durationWeeks: phase2Weeks,
        drugNameEn: sermDetail.en,
        drugNameAr: sermDetail.ar,
        dosageDescriptionEn: sermDetail.stabDose.en,
        dosageDescriptionAr: sermDetail.stabDose.ar,
        instructionsEn: 'Taper dose to prevent receptor desensitization and reduce potential ocular or mood side effects while maintaining LH elevation.',
        instructionsAr: 'تخفيض الجرعة لتفادي تشبع المستقبلات وتقليل احتمالية الأعراض الجانبية البصرية أو المزاجية.',
    });

    // Phase 3: Weaning
    phases.push({
        phaseNumber: 3,
        nameKey: 'phase_3',
        titleEn: 'Phase 3: Weaning & Bio-Feedback',
        titleAr: 'المرحلة 3: الفطام والمتابعة الحيوية',
        durationWeeks: phase3Weeks,
        drugNameEn: sermDetail.en,
        drugNameAr: sermDetail.ar,
        dosageDescriptionEn: sermDetail.weanDose.en,
        dosageDescriptionAr: sermDetail.weanDose.ar,
        instructionsEn: 'Gradual exit allowing natural negative feedback loops to resume autonomous testosterone regulation.',
        instructionsAr: 'خروج تدريجي يسمح لآليات التغذية الراجعة الطبيعية بتولي تنظيم هرمون التستوستيرون ذاتياً.',
    });

    const totalDurationWeeks = phases.reduce((acc, p) => acc + p.durationWeeks, 0);

    const severityLabels = {
        mild: { en: 'Mild Suppression (S-Score < 3.0)', ar: 'تثبيط خفيف (S-Score أقل من 3.0)' },
        moderate: { en: 'Moderate Suppression (S-Score 3.0 - 7.0)', ar: 'تثبيط معتدل (S-Score 3.0 - 7.0)' },
        severe: { en: 'Severe Suppression (S-Score > 7.0)', ar: 'تثبيط شديد (S-Score أعلى من 7.0)' },
    };

    return {
        sScore,
        severity,
        severityLabelEn: severityLabels[severity].en,
        severityLabelAr: severityLabels[severity].ar,
        totalDurationWeeks,
        selectedSermId,
        selectedSermNameEn: sermDetail.en,
        selectedSermNameAr: sermDetail.ar,
        isAutoSwitched,
        autoSwitchReasonKey,
        autoSwitchReasonEn,
        autoSwitchReasonAr,
        hcgRequired,
        hcgReasonEn,
        hcgReasonAr,
        phases,
        bloodworkPanelPromptEn: 'Required Lab Panel at Week 4 Post-SERM: Total Testosterone, Free Testosterone, LH, FSH, Sensitive Estradiol (E2), SHBG, Prolactin',
        bloodworkPanelPromptAr: 'فحص الدم الشامل المطلوب (بعد 4 أسابيع من إتمام الـ SERMs): التستوستيرون الكلي والحر، LH، FSH، الاستراديول الحساس (E2)، SHBG، والبرولاكتين.',
    };
}
