/**
 * Tool-036 V4 — interface copy in Arabic and English (acceptance F7.5).
 *
 * Why a typed module rather than a loose JSON file (the convention used by the
 * older tools under `i18n/`): F7.5 requires that English is COMPLETE, not a
 * partial translation. Typing the English dictionary as `Record<CopyKey,string>`
 * — where `CopyKey` is derived from the Arabic source — makes a missing English
 * entry a compile error, and `i18n.test.ts` additionally asserts key parity and
 * non-emptiness at runtime.
 *
 * Bundle gate (acceptance-fixes-plan: preview route First Load JS): the
 * dictionaries are DATA, not logic, so they are deliberately kept OUT of the
 * client entry chunk. The preview route resolves this module on the server and
 * hands `DICT` to the shell as a prop (see `app/labs/tool-036-v4/page.tsx`).
 * Importing this module from a client component would put ~3 kB gz of copy back
 * into the route's First Load JS.
 *
 * Interpolation uses `fmt` (see `i18n.ts`) with `{name}` placeholders so every
 * entry stays a plain string (parity and emptiness are then trivially testable),
 * and so the wording can be reordered per language without touching call sites.
 */
import type { Locale } from '@/lib/i18n/config';

/**
 * Arabic copy — the source of truth for the key set. Strings that existing
 * behaviour depends on (labels the UI and tests address by name) are kept
 * verbatim.
 */
const ar = {
  // Shared / chrome
  languageName: 'العربية',
  languageToggleAria: 'تبديل اللغة',
  loading: 'جارٍ تحميل المعاينة…',
  storageInvalid: 'البيانات المخزنة غير صالحة — بدأنا بحالة جديدة.',

  // Acknowledgment gate
  ackTitle: 'قبل البدء — إقرار الاستخدام',
  ackBullet1:
    'هذه الأداة لتنظيم جدولك وتسجيل وقائعك فقط: لا تشخيص، ولا وصف جرعات، ولا حكم على ملاءمة موقع طبيًا.',
  ackBullet2:
    'لا تستنتج الأداة جاهزية موقع من مرور أيام؛ تُعرض الوقائع المسجّلة فعلًا، وغيابها يُذكر صراحة.',
  ackBullet3:
    'كل ادّعاء صحّي معروض مربوط بمصدره ودرجة ثقته ونطاق تطبيقه، ويمكنك مراجعته في مكانه.',
  ackBullet4:
    'بياناتك تُخزَّن في متصفحك فقط، ولا تُرسل إلى أي شبكة، ويمكنك حذفها كاملة في أي وقت.',
  ackBullet5: 'عند أي مخاوف صحية، راجع مختصًا.',
  ackAccept: 'أفهم وأوافق — ابدأ',

  // Header
  previewTitle: 'Tool-036 V4 — معاينة تجريبية',
  previewNotice:
    'معاينة غير مفهرسة خارج الكتالوج. ليست استشارة طبية، ولا تشخيصًا ولا توصية جرعات. كل ادعاء صحّي هنا مربوط بمصدره ودرجة ثقته ونطاق تطبيقه.',

  // Plan (intent)
  planHeading: 'الخطة (النية)',
  weeklyTotalLabel: 'إجمالي الجرعة الأسبوعية:',
  mgUnit: 'مجم',
  mlUnit: 'مل',
  timeZoneLabel: 'المنطقة الزمنية:',
  toleranceHoursLabel: 'ساعات التسامح:',
  restPreferenceLabel: 'تفضيل الراحة:',
  daysUnit: 'أيام',
  weeklyDoseLabel: 'الجرعة الأسبوعية (مجم)',
  weeklyDoseAria: 'الجرعة الأسبوعية',
  concentrationLabel: 'التركيز (مجم/مل)',
  concentrationAria: 'التركيز',
  injectionsPerWeekLabel: 'عدد الحقن أسبوعيًا',
  injectionsPerWeekAria: 'عدد الحقن أسبوعيًا',
  rotationModeLabel: 'نمط تدوير المواقع (تنظيم جدولي فقط — ليس حكمًا طبيًا)',
  rotationModeAria: 'نمط تدوير المواقع',
  rotationLru: 'الأقل استخدامًا حديثًا',
  rotationFixed: 'ترتيب ثابت',

  // Proposal
  proposalHeading: 'الجدول المقترح ({weeks} أسابيع)',
  horizonNote:
    'نافذة متجدّدة من {weeks} أسبوعًا تبدأ من الأسبوع الحالي: عند عبور يوم الأحد تتحرّك النافذة، فتخرج الأحداث الأقدم من هذا التقرير. الأفق المعتمد {weeks} أسبوعًا.',
  thTime: 'الموعد',
  thSite: 'الموقع',
  thDose: 'الجرعة',
  thVolume: 'الحجم',
  thZone: 'المنطقة',

  // Volume zones (V3 bands, read-only)
  zoneGreen: 'روتيني',
  zoneYellow: 'محدود الدليل',
  zoneRed: 'يتجاوز الحد الشائع',

  // Recorded usage (R2)
  usageHeading: 'سجل استخدام المواقع (وقائع مسجّلة فقط)',
  sinceDays: '— منذ {days} يوم',
  noUsage: 'لا توجد بيانات استخدام مسجّلة',

  // Preference findings (R3)
  findingsHeading: 'تفضيل الراحة الشخصي ({days} أيام)',
  noFindings: 'لا توجد تجاوزات للتفضيل في هذه النافذة.',
  findingLine:
    '{site}: فرق {gap} أيام ({prev} ← {cur}) — تجاوز تفضيل شخصي، ليس تحذيرًا طبيًا',
  originRecorded: 'مسجّل',
  originPlanned: 'مخطط',

  // Log an actual event
  logHeading: 'تسجيل حدث فعلي (الواقع)',
  logWhenLabel: 'الموعد الفعلي',
  logWhenAria: 'موعد الحقن الفعلي',
  logSiteLabel: 'الموقع',
  logSiteAria: 'الموقع',
  logVolumeLabel: 'الحجم (مل)',
  logVolumeAria: 'الحجم بالمل',
  logDoseLabel: 'الجرعة (مجم)',
  logDoseAria: 'الجرعة بالمجم',
  logPainLabel: 'الألم 0–10 (اختياري، معلوماتي)',
  logPainAria: 'درجة الألم',
  logNoteLabel: 'ملاحظة (اختياري)',
  logNoteAria: 'ملاحظة',
  logSubmit: 'تسجيل',
  logErrorNumbers: 'الحجم والجرعة يجب أن يكونا أرقامًا موجبة.',
  logErrorWhen: 'موعد غير صالح.',

  // Plan vs actual (D4/R5)
  driftHeading: 'الخطة مقابل الواقع',
  driftDeclaredRules:
    'قواعد المقارنة المعلنة: التسامح {tolerance} ساعة · نافذة المطابقة ±24 ساعة · «متأخر» = فعلي بعد التسامح وحتى 24 ساعة · «فائت» = لا يوجد فعلي ضمن النافذة بعد إغلاقها · المواعيد التي لم تُغلق نافذتها لم تُقَيَّم بعد — لا توجد درجة مركّبة.',
  driftLastUpdated: 'آخر تحديث:',
  driftSummary:
    'مطابق: {matched} · متأخر: {late} · فائت: {missed} · مسجّل دون موعد: {extra} · موقع مختلف: {siteChanged}',
  driftEmpty: 'لا توجد فروقات مُقيَّمة بعد ضمن النافذة.',
  statusMatched: 'في الموعد',
  statusLate: 'متأخر',
  statusMissed: 'فائت',
  statusExtra: 'مسجّل دون موعد',
  statusSiteChanged: 'موقع مختلف',
  driftPlanned: '· مخطط:',
  driftNoCounterpart: '· بلا موعد مقابل',
  driftActual: '· فعلي:',
  driftDelta: '· فرق {hours} ساعة',
  driftReasonSummary: 'سبب التصنيف وقاعدته',
  driftReason: 'السبب:',
  driftRule: 'القاعدة:',

  // Backup & transfer (D3/R4)
  transferHeading: 'النسخ الاحتياطي والنقل',
  transferIntro:
    'التصدير والاستيراد يتمّان محليًا في متصفحك. ملف الاستيراد الوحيد المدعوم هو ظرف الأداة المنظّم (يُتحقق من إصداره وبصمته ومحتواه قبل القبول). حزمة FHIR للتصدير فقط في هذا الإصدار.',
  exportEnvelope: 'تصدير JSON (الظرف المنظّم)',
  exportFhir: 'تصدير FHIR (للتصدير فقط)',
  importLabel: 'استيراد ظرف JSON',
  importAria: 'استيراد ملف JSON',
  noticeExportEnvelope: 'تم إنشاء ملف الظرف المنظّم (يحوي الأحداث والخطة واللغة فقط).',
  noticeExportFhir: 'تم إنشاء حزمة FHIR — للتصدير فقط؛ لا يمكن استيرادها في هذا الإصدار.',
  importReadError: 'تعذّرت قراءة الملف المحدد.',
  noticeImport: 'تم استيراد {added} حدثًا، وتجاهل {skipped} مكرر (مطابق للمحتوى المحلي).',

  // Privacy & control (D5/R7)
  privacyHeading: 'الخصوصية والتحكم',
  privacyBody:
    'بياناتك تبقى في متصفحك: لا تُرسل إلى أي شبكة، ولا حسابات، ولا تتبّع. كل ما تخزّنه الأداة يقع تحت مفتاح واحد يمكن حذفه بالكامل في أي وقت — دون التأثير على أي بيانات أخرى في الموقع.',
  deleteIntro: 'حذف كامل: يمحو أحداثك وخطتك وتفضيلاتك من هذا المتصفح نهائيًا. لا يمكن التراجع.',
  deleteArm: 'حذف كل بياناتي',
  deleteConfirm: 'تأكيد الحذف النهائي',
  deleteCancel: 'إلغاء',
  deleteNotice: 'حُذفت {count} مفاتيح بيانات من هذا المتصفح. حالتك الآن نظيفة.',

  // Rule citation (R7)
  ruleSummary: 'المصدر والثقة ونطاق التطبيق',
  ruleSource: 'المصدر:',
  ruleConfidence: 'الثقة:',
  ruleScope: 'النطاق:',
};

/** The key set, derived from the Arabic source. */
export type CopyKey = keyof typeof ar;

/**
 * English copy. Typed as `Record<CopyKey,string>` so a missing or misspelled
 * key is a compile error rather than an untranslated Arabic string at runtime.
 */
const en: Record<CopyKey, string> = {
  languageName: 'English',
  languageToggleAria: 'Switch language',
  loading: 'Loading preview…',
  storageInvalid: 'Stored data was invalid — started from a clean state.',

  ackTitle: 'Before you start — usage acknowledgment',
  ackBullet1:
    'This tool only organises your schedule and records your events: no diagnosis, no dose prescribing, and no judgement on whether a site is medically suitable.',
  ackBullet2:
    'The tool does not infer site readiness from elapsed days; only recorded facts are shown, and their absence is stated explicitly.',
  ackBullet3:
    'Every health claim shown is tied to its source, confidence and scope, and you can review it in place.',
  ackBullet4:
    'Your data is stored only in your browser, is never sent to any network, and you can delete it entirely at any time.',
  ackBullet5: 'For any health concerns, consult a professional.',
  ackAccept: 'I understand and agree — start',

  previewTitle: 'Tool-036 V4 — experimental preview',
  previewNotice:
    'An unindexed preview outside the catalog. It is not medical advice, not a diagnosis and not a dosing recommendation. Every health claim here is tied to its source, confidence and scope.',

  planHeading: 'Plan (intent)',
  weeklyTotalLabel: 'Total weekly dose:',
  mgUnit: 'mg',
  mlUnit: 'mL',
  timeZoneLabel: 'Time zone:',
  toleranceHoursLabel: 'Tolerance hours:',
  restPreferenceLabel: 'Rest preference:',
  daysUnit: 'days',
  weeklyDoseLabel: 'Weekly dose (mg)',
  weeklyDoseAria: 'Weekly dose',
  concentrationLabel: 'Concentration (mg/mL)',
  concentrationAria: 'Concentration',
  injectionsPerWeekLabel: 'Injections per week',
  injectionsPerWeekAria: 'Injections per week',
  rotationModeLabel: 'Site rotation mode (scheduling only — not a medical judgement)',
  rotationModeAria: 'Site rotation mode',
  rotationLru: 'Least recently used',
  rotationFixed: 'Fixed order',

  proposalHeading: 'Proposed schedule ({weeks} weeks)',
  horizonNote:
    'A rolling {weeks}-week window starting from the current week: when Sunday passes the window moves, so older events leave this report. The approved horizon is {weeks} weeks.',
  thTime: 'Time',
  thSite: 'Site',
  thDose: 'Dose',
  thVolume: 'Volume',
  thZone: 'Zone',

  zoneGreen: 'Routine',
  zoneYellow: 'Limited evidence',
  zoneRed: 'Above the common ceiling',

  usageHeading: 'Site usage log (recorded facts only)',
  sinceDays: '— {days} days ago',
  noUsage: 'No recorded usage data',

  findingsHeading: 'Personal rest preference ({days} days)',
  noFindings: 'No preference violations in this window.',
  findingLine:
    '{site}: {gap} days apart ({prev} → {cur}) — a personal preference deviation, not a medical warning',
  originRecorded: 'recorded',
  originPlanned: 'planned',

  logHeading: 'Log an actual event (reality)',
  logWhenLabel: 'Actual time',
  logWhenAria: 'Actual injection time',
  logSiteLabel: 'Site',
  logSiteAria: 'Site',
  logVolumeLabel: 'Volume (mL)',
  logVolumeAria: 'Volume in mL',
  logDoseLabel: 'Dose (mg)',
  logDoseAria: 'Dose in mg',
  logPainLabel: 'Pain 0–10 (optional, informational)',
  logPainAria: 'Pain score',
  logNoteLabel: 'Note (optional)',
  logNoteAria: 'Note',
  logSubmit: 'Log',
  logErrorNumbers: 'Volume and dose must be positive numbers.',
  logErrorWhen: 'Invalid time.',

  driftHeading: 'Plan vs actual',
  driftDeclaredRules:
    'Declared comparison rules: tolerance {tolerance}h · matching window ±24h · "late" = actual after tolerance and up to 24h · "missed" = no actual within the window after it closed · slots whose window has not closed are not judged yet — there is no composite score.',
  driftLastUpdated: 'Last updated:',
  driftSummary:
    'matched: {matched} · late: {late} · missed: {missed} · recorded without a slot: {extra} · site changed: {siteChanged}',
  driftEmpty: 'No differences have been judged yet within the window.',
  statusMatched: 'matched',
  statusLate: 'late',
  statusMissed: 'missed',
  statusExtra: 'recorded without a slot',
  statusSiteChanged: 'site changed',
  driftPlanned: '· planned:',
  driftNoCounterpart: '· no counterpart',
  driftActual: '· actual:',
  driftDelta: '· {hours}h off',
  driftReasonSummary: 'Reason and rule for the classification',
  driftReason: 'Reason:',
  driftRule: 'Rule:',

  transferHeading: 'Backup & transfer',
  transferIntro:
    'Export and import both happen locally in your browser. The only supported import file is the tool envelope (its version, checksum and contents are verified before acceptance). FHIR is export-only in this release.',
  exportEnvelope: 'Export JSON (structured envelope)',
  exportFhir: 'Export FHIR (export only)',
  importLabel: 'Import a JSON envelope',
  importAria: 'Import a JSON file',
  noticeExportEnvelope: 'The structured envelope file was created (events, plan and language only).',
  noticeExportFhir:
    'The FHIR bundle was created — export only; it cannot be imported in this release.',
  importReadError: 'Could not read the selected file.',
  noticeImport:
    'Imported {added} event(s), skipped {skipped} duplicate(s) (identical to local content).',

  privacyHeading: 'Privacy & control',
  privacyBody:
    'Your data stays in your browser: it is not sent to any network, no accounts, no tracking. Everything the tool stores lives under a single key you can delete entirely at any time — without affecting any other site data.',
  deleteIntro:
    'Full delete: permanently erases your events, plan and preferences from this browser. It cannot be undone.',
  deleteArm: 'Delete all my data',
  deleteConfirm: 'Confirm permanent delete',
  deleteCancel: 'Cancel',
  deleteNotice: 'Deleted {count} data key(s) from this browser. You are now clean.',

  ruleSummary: 'Source, confidence and scope',
  ruleSource: 'Source:',
  ruleConfidence: 'Confidence:',
  ruleScope: 'Scope:',
};

/** Both dictionaries, indexed by interface language. */
export const DICT = { ar, en } as const;

/**
 * The shape a client component receives when the route passes the copy down.
 * Both languages are read by key only, so the literal types of the Arabic
 * source are not part of the contract.
 */
export type CopyDict = {
  readonly ar: Readonly<Record<CopyKey, string>>;
  readonly en: Readonly<Record<CopyKey, string>>;
};

/** Copy for one key in one language. */
export function t<K extends CopyKey>(locale: Locale, key: K): string {
  return DICT[locale][key];
}
