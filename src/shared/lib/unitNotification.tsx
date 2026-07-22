import React from 'react';
import { toast } from 'sonner';
import { UnitSystem } from './logic';

export const showUnitChangeToast = (system: UnitSystem, isLoggedIn: boolean, isAr: boolean) => {
  const isMetric = system === 'metric';

  const title = isMetric
    ? (isAr ? '⚖️ النظام القياسي المتري (كجم، سم، مل)' : '⚖️ Metric System Active (kg, cm, ml)')
    : (isAr ? '📏 النظام الإمبراطوري (باوند، أنش، أونصة)' : '📏 Imperial System Active (lbs, in, oz)');

  const description = isMetric
    ? (isAr
        ? 'أنت الآن تعمل بالنظام المتري، المعيار العالمي الأدق للقياسات الحيوية الرياضية والحسابات الأيضية.'
        : 'You are now using the Metric system, the global standard for precise biometric and metabolic calculations.')
    : (isAr
        ? 'أنت الآن تعمل بالنظام الإمبراطوري المعتمد في العلوم الرياضية الأمريكية والمنافسات العالمية.'
        : 'You are now using the Imperial system, standard in US sports science and body strength metrics.');

  const adviceNote = !isLoggedIn
    ? (isAr
        ? '💡 تنبيه هام: ننصحك بإنشاء حساب وتسجيل الدخول للاحتفاظ بهستوري سجل معاملاتك، أرقامك، ونظام قياسك تلقائياً في جميع أنحاء الموقع.'
        : '💡 Pro Tip: Create an account & log in to automatically save your calculation history, stats, and unit preferences across all devices!')
    : null;

  toast.custom(
    (t) => (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full max-w-md bg-zinc-950 border-2 border-gold-500/40 text-white rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col gap-3 relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-black text-gold-400 flex items-center gap-1.5">
              {title}
            </h4>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-1">
              {description}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t)}
            className="text-zinc-500 hover:text-white p-1 rounded-lg text-xs transition-colors shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {adviceNote && (
          <div className="p-3 bg-gold-500/10 border border-gold-500/25 rounded-xl flex flex-col gap-2">
            <p className="text-[11px] font-bold text-zinc-200 leading-relaxed">
              {adviceNote}
            </p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  toast.dismiss(t);
                  window.dispatchEvent(
                    new CustomEvent('mrx_navigate_page', { detail: 'signup' })
                  );
                }}
                className="px-3.5 py-1.5 bg-gold-500 hover:bg-gold-400 text-black text-[11px] font-black uppercase rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isAr ? 'إنشاء حساب / دخول' : 'Sign Up / Log In'}
              </button>
            </div>
          </div>
        )}
      </div>
    ),
    { duration: 6000 }
  );
};
