'use client';

import React from 'react';
import { CalendarCheck, Target, X, Plus, Download, Lock, Sparkles, RefreshCw, EyeOff } from 'lucide-react';
import BrandLogo from '../../shared/ui/BrandLogo';
import SystemGuideCard from '../../shared/ui/SystemGuideCard';
import { ContentStrings, Page } from '@/shared/types/types';
import { usePreferences } from '../../context/PreferencesContext';
import { useCycleCalendarExporter } from './hooks/useCycleCalendarExporter';


interface CycleCalendarExporterProps {
    content: ContentStrings;
    navigateTo: (page: Page) => void;
}

const CycleCalendarExporter: React.FC<CycleCalendarExporterProps> = ({ content, navigateTo }) => {
    const { isRTL } = usePreferences();

    const {
        isUnlocked,
        handleVerify,
        startDate,
        setStartDate,
        stealthMode,
        setStealthMode,
        autoRotate,
        setAutoRotate,
        autoPCT,
        setAutoPCT,
        compounds,
        addCompound,
        removeCompound,
        updateCompound,
        loadPreset,
        generateICS
    } = useCycleCalendarExporter({ content });


    if (!isUnlocked) {
        return (
            <div className="max-w-4xl mx-auto py-10">
                <div className="text-center mb-10">
                    <div className="mb-4">
                        <BrandLogo className="text-3xl md:text-5xl" onClick={() => navigateTo(Page.HOME)} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{content.cycleArchitect.title}</h1>
                    <p className="text-zinc-500">{content.cycleArchitect.subtitle}</p>
                </div>
                <div className="bg-white dark:bg-background rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-card rounded-full flex items-center justify-center mb-6 animate-pulse"><Lock className="w-10 h-10 text-gold-500" /></div>
                        <h3 className="text-2xl font-black mb-3">{content.cycleArchitect.premiumLock.lockedTitle}</h3>
                        <p className="text-zinc-500 mb-8 max-w-md mx-auto leading-relaxed">{content.cycleArchitect.premiumLock.lockedDesc}</p>
                        <div className="flex gap-3 w-full max-w-sm">
                            <input type="text" placeholder={content.cycleArchitect.premiumLock.placeholder} className="flex-1 bg-zinc-50 dark:bg-background border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 focus:border-gold-500 outline-none" />
                            <button onClick={handleVerify} className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl whitespace-nowrap transition-colors">{content.cycleArchitect.premiumLock.verifyBtn}</button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-4">{content.cycleArchitect.premiumLock.demoHint}</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-5xl mx-auto py-10 animate-fade-in-up">
            <div className="text-center mb-10">
                <CalendarCheck className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                <h1 className="text-3xl font-black mb-2">{content.cycleArchitect.title}</h1>
                <p className="text-zinc-500 max-w-2xl mx-auto">{content.cycleArchitect.subtitle}</p>
            </div>

            {/* ── System Guide: مزامنة جدول الكورس ── */}
            <div className="mb-10">
                <SystemGuideCard
                    isAr={isRTL}
                    icon={Sparkles}
                    title={{
                        ar: 'محرك مزامنة الجدول الدوائي CycleSync Pro',
                        en: 'CycleSync Pro — Protocol Calendar Engine',
                    }}
                    subtitle={{
                        ar: 'بناء الكورس وحساب التصفية وتصدير التقويم الذكي',
                        en: 'Protocol building, clearance scheduling & smart calendar export',
                    }}
                    intro={{
                        ar: 'يجمع هذا المحرك بين مصمم الكورس، وحساب عمر النصف والتصفية التلقائية، ووضع التخفي، وتصدير ICS مباشر لتقويم هاتفك، في منظومة واحدة متزامنة تماماً:',
                        en: 'This engine fuses the cycle builder, half-life clearance scheduling, stealth mode and direct ICS export to your phone calendar into one fully synchronized system:',
                    }}
                    items={[
                        {
                            icon: CalendarCheck,
                            title: {
                                ar: '1. مصمم الكورس بالنماذج الجاهزة',
                                en: '1. Preset Cycle Builder',
                            },
                            body: {
                                ar: 'نماذج جاهزة (تضخيم مبتدئ / تنشيف / TRT) تضيف المركبات والجرعات والتكرار تلقائياً مع تحكم كامل بالتخصيص اليدوي.',
                                en: 'Ready presets (beginner bulk / cutting / TRT) auto-populate compounds, dosages and frequency with full manual customization.',
                            },
                        },
                        {
                            icon: RefreshCw,
                            title: {
                                ar: '2. التصفية الذاتية وحساب نصف العمر',
                                en: '2. Auto-Rotation & Half-Life Clearance',
                            },
                            body: {
                                ar: 'يحسب نهاية تأثير كل مركب بناءً على عمر نصفه ويولّد توقيت التصفية تلقائياً لمنع فترات هرمونية ميتة أثناء الكورس.',
                                en: 'Computes each compound end of action from its half-life and auto-generates clearance timing to avoid dead hormonal gaps mid-cycle.',
                            },
                        },
                        {
                            icon: EyeOff,
                            title: {
                                ar: '3. وضع التخفي (Stealth Mode)',
                                en: '3. Stealth Mode',
                            },
                            body: {
                                ar: 'يستخدم مسميات بديلة محايدة في تقويمك للحفاظ على خصوصيتك الكاملة دون كشف محتوى الجدول لأي طرف آخر.',
                                en: 'Uses discreet alternative labels in your calendar to keep your schedule fully private from any third party.',
                            },
                        },
                        {
                            icon: Download,
                            title: {
                                ar: '4. تصدير ICS وتكامل التقويم',
                                en: '4. ICS Export & Calendar Sync',
                            },
                            body: {
                                ar: 'يصدّر الجدول بصيغة ICS القياسية إلى Google/Apple/Outlook مع ربط تلقائي لمواعيد الحقن والتنشيف وPCT، وتعمل التنبيهات مباشرة.',
                                en: 'Exports the schedule to standard ICS for Google/Apple/Outlook, auto-linking injection, cruise and PCT events with working reminders.',
                            },
                        },
                    ]}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-background p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-gold-500" /> {content.cycleArchitect.presetsTitle}</h3>
                        <div className="space-y-2">
                            <button onClick={() => loadPreset('beginnerBulk')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-background hover:bg-zinc-100 dark:hover:bg-card border border-zinc-200 dark:border-zinc-800 text-base font-medium transition-colors">{content.cycleArchitect.presets.beginnerBulk}</button>
                            <button onClick={() => loadPreset('cutting')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-background hover:bg-zinc-100 dark:hover:bg-card border border-zinc-200 dark:border-zinc-800 text-base font-medium transition-colors">{content.cycleArchitect.presets.cutting}</button>
                            <button onClick={() => loadPreset('trt')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 dark:bg-background hover:bg-zinc-100 dark:hover:bg-card border border-zinc-200 dark:border-zinc-800 text-base font-medium transition-colors">{content.cycleArchitect.presets.trt}</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-background p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-bold mb-4">{content.cycleArchitect.configLabel}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`text-base text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.stealthModeLabel}</span>
                                <button aria-label={content.cycleArchitect.toggleStealth} onClick={() => setStealthMode(!stealthMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${stealthMode ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${stealthMode ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-base text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.rotationLabel}</span>
                                <button aria-label={content.cycleArchitect.toggleRotation} onClick={() => setAutoRotate(!autoRotate)} className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRotate ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoRotate ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-base text-zinc-600 dark:text-zinc-400 ${isRTL ? 'text-right' : 'text-left'}`}>{content.cycleArchitect.pctLabel}</span>
                                <button aria-label={content.cycleArchitect.togglePct} onClick={() => setAutoPCT(!autoPCT)} className={`w-12 h-6 rounded-full p-1 transition-colors ${autoPCT ? 'bg-gold-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoPCT ? (isRTL ? '-translate-x-6' : 'translate-x-6') : ''}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Builder Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-background p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1">
                                <label htmlFor="start-date" className="text-sm font-bold text-zinc-500 uppercase block mb-2">{content.cycleArchitect.form.startDateLabel}</label>
                                <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 outline-none focus:border-gold-500" />
                            </div>
                            <div className="flex-1"></div>
                        </div>

                        <div className="space-y-4">
                            {compounds.map((comp) => (
                                <div key={comp.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-background border border-zinc-200 dark:border-zinc-800 relative group">
                                    <button aria-label="Remove Compound" onClick={() => removeCompound(comp.id)} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-4 space-y-1">
                                            <label htmlFor={`compound-${comp.id}`} className="text-xs font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.compoundLabel}</label>
                                            <input id={`compound-${comp.id}`} type="text" value={comp.name} onChange={e => updateCompound(comp.id, 'name', e.target.value)} className="w-full bg-white dark:bg-background border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-base outline-none" />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label htmlFor={`dosage-${comp.id}`} className="text-xs font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.dosageLabel}</label>
                                            <input id={`dosage-${comp.id}`} type="number" value={comp.dosage} onChange={e => updateCompound(comp.id, 'dosage', e.target.value)} className="w-full bg-white dark:bg-background border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-base outline-none" />
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <label htmlFor={`freq-${comp.id}`} className="text-xs font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.frequencyLabel}</label>
                                            <select id={`freq-${comp.id}`} value={comp.freq} onChange={e => updateCompound(comp.id, 'freq', e.target.value)} className="w-full bg-white dark:bg-background border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-base outline-none">
                                                {Object.entries(content.cycleArchitect.form.frequencies).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label htmlFor={`weeks-${comp.id}`} className="text-xs font-bold text-zinc-500 uppercase">{content.cycleArchitect.form.weeksLabel}</label>
                                            <input id={`weeks-${comp.id}`} type="number" value={comp.duration} onChange={e => updateCompound(comp.id, 'duration', e.target.value)} className="w-full bg-white dark:bg-background border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-base outline-none" />
                                        </div>
                                        <div className="md:col-span-1 flex justify-center pb-2">
                                            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-4">
                            <button onClick={addCompound} className="px-6 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:border-gold-500 hover:text-gold-500 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> {content.cycleArchitect.form.addCompoundBtn}</button>
                            <button onClick={generateICS} className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" /> {content.cycleArchitect.premiumLock.exportBtn}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CycleCalendarExporter;
