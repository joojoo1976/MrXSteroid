
import { ContentStrings, TeaserTableData, LabTest, InjectionSite, Compound } from './types';
import {
  seoKeywordsArabic,
  seoKeywordsEnglish,
  seoKeywordsHebrew,
  seoKeywordsFrench,
  seoKeywordsSpanish,
  seoKeywordsGerman,
  seoKeywordsItalian,
  seoKeywordsRussian,
  seoKeywordsTurkish,
  seoKeywordsPortuguese,
  seoKeywordsPersian,
  seoKeywordsUrdu,
  footerKeywordsPoolAr,
  footerKeywordsPoolEn,
  footerKeywordsPoolHe,
  footerKeywordsPoolFr,
  footerKeywordsPoolEs,
  footerKeywordsPoolDe,
  footerKeywordsPoolIt,
  footerKeywordsPoolRu,
  footerKeywordsPoolTr,
  footerKeywordsPoolPt,
  footerKeywordsPoolFa,
  footerKeywordsPoolUr,
  salesDataAr,
  salesDataEn,
  fullArabicDisclaimer,
  fullEnglishDisclaimer,
  fullHebrewDisclaimer,
  fullFrenchDisclaimer,
  fullSpanishDisclaimer,
  fullGermanDisclaimer,
  fullItalianDisclaimer,
  fullRussianDisclaimer,
  fullTurkishDisclaimer,
  fullPortugueseDisclaimer,
  fullPersianDisclaimer,
  fullUrduDisclaimer,
} from './content-data';

export {
  seoKeywordsArabic, seoKeywordsEnglish, seoKeywordsHebrew, seoKeywordsFrench, seoKeywordsSpanish, seoKeywordsGerman, seoKeywordsItalian, seoKeywordsRussian, seoKeywordsTurkish, seoKeywordsPortuguese, seoKeywordsPersian, seoKeywordsUrdu,
  footerKeywordsPoolAr, footerKeywordsPoolEn, footerKeywordsPoolHe, footerKeywordsPoolFr, footerKeywordsPoolEs, footerKeywordsPoolDe, footerKeywordsPoolIt, footerKeywordsPoolRu, footerKeywordsPoolTr, footerKeywordsPoolPt, footerKeywordsPoolFa, footerKeywordsPoolUr,
  salesDataAr, salesDataEn, fullArabicDisclaimer, fullEnglishDisclaimer,
  fullHebrewDisclaimer, fullFrenchDisclaimer, fullSpanishDisclaimer, fullGermanDisclaimer, fullItalianDisclaimer, fullRussianDisclaimer, fullTurkishDisclaimer, fullPortugueseDisclaimer, fullPersianDisclaimer, fullUrduDisclaimer
};

export const teaserTablesAR: TeaserTableData[] = [
  {
    title: "جدول تضخيم للمبتدئين (عيّنة)",
    headers: ["الأسبوع", "المادة", "الجرعة"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500mg / أسبوع" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30mg / يوم" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5mg / يوم بعد يوم" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500mg / أسبوع" },
      { col1: "13-15", col2: "فترة الانتظار (Clearance)", col3: "بدون مواد" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40mg / يوم" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50mg / يوم" }
    ]
  },
  {
    title: "جدول تنشيف متقدم (عيّنة)",
    headers: ["الأسبوع", "المادة", "الجرعة"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100mg / يوم بعد يوم" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75mg / يوم بعد يوم" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100mg / يوم بعد يوم" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50mg / يوم بعد يوم" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25mcg (تدرج هرمي)" },
      { col1: "11-14", col2: "PCT Protocol", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesEN: TeaserTableData[] = [
  {
    title: "Beginner Bulking Cycle (Sample)",
    headers: ["Week", "Compound", "Dosage"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500mg / week" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30mg / day" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5mg / EOD" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500mg / week" },
      { col1: "13-15", col2: "Clearance Period", col3: "No Compounds" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40mg / day" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50mg / day" }
    ]
  },
  {
    title: "Advanced Cutting Cycle (Sample)",
    headers: ["Week", "Compound", "Dosage"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100mg / EOD" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75mg / EOD" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25mcg (Pyramid)" },
      { col1: "11-14", col2: "PCT Protocol", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesHE: TeaserTableData[] = [
  {
    title: "טבלת מסה למתחילים (דוגמה)",
    headers: ["שבוע", "חומר", "מינון"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enanthate", col3: "500 מ״ג / שבוע" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 מ״ג / יום" },
      { col1: "1-12", col2: "Arimidex", col3: "0.5 מ״ג / פעם ביומיים" },
      { col1: "6-12", col2: "Testosterone Enanthate", col3: "500 מ״ג / שבוע" },
      { col1: "13-15", col2: "תקופת המתנה (Clearance)", col3: "ללא חומרים" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 מ״ג / יום" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 מ״ג / יום" }
    ]
  },
  {
    title: "טבלת חיטוב מתקדם (דוגמה)",
    headers: ["שבוע", "חומר", "מינון"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionate", col3: "100 מ״ג / פעם ביומיים" },
      { col1: "1-4", col2: "Trenbolone Acetate", col3: "75 מ״ג / פעם ביומיים" },
      { col1: "1-8", col2: "Masteron Propionate", col3: "100 מ״ג / פעם ביומיים" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50 מ״ג / פעם ביומיים" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (פירמידה)" },
      { col1: "11-14", col2: "פרוטוקול PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesFR: TeaserTableData[] = [
  {
    title: "Cycle de Prise de Masse Débutant (Échantillon)",
    headers: ["Semaine", "Composé", "Dosage"],
    rows: [
      { col1: "1-5", col2: "Testostérone Énanthate", col3: "500 mg / semaine" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / jour" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Testostérone Énanthate", col3: "500 mg / semaine" },
      { col1: "13-15", col2: "Période de dégagement", col3: "Aucun composé" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / jour" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / jour" }
    ]
  },
  {
    title: "Cycle de Sèche Avancé (Échantillon)",
    headers: ["Semaine", "Composé", "Dosage"],
    rows: [
      { col1: "1-4", col2: "Testostérone Propionate", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Acétate de Trenbolone", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Propionate de Masteron", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Pyramide)" },
      { col1: "11-14", col2: "Protocole PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesES: TeaserTableData[] = [
  {
    title: "Ciclo de Volumen para Principiantes (Muestra)",
    headers: ["Semana", "Compuesto", "Dosificación"],
    rows: [
      { col1: "1-5", col2: "Enantato de Testosterona", col3: "500 mg / semana" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / día" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Enantato de Testosterona", col3: "500 mg / semana" },
      { col1: "13-15", col2: "Período de Limpieza", col3: "Sin compuestos" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / día" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / día" }
    ]
  },
  {
    title: "Ciclo de Definición Avanzada (Muestra)",
    headers: ["Semana", "Compuesto", "Dosificación"],
    rows: [
      { col1: "1-4", col2: "Propionato de Testosterona", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Acetato de Trenbolona", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Propionato de Masteron", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Inyectable)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Pirámide)" },
      { col1: "11-14", col2: "Protocolo PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesDE: TeaserTableData[] = [
  {
    title: "Masseaufbau-Kur für Anfänger (Muster)",
    headers: ["Woche", "Wirkstoff", "Dosierung"],
    rows: [
      { col1: "1-5", col2: "Testosteron Enantat", col3: "500 mg / Woche" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / Tag" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Testosteron Enantat", col3: "500 mg / Woche" },
      { col1: "13-15", col2: "Wartezeit (Clearance)", col3: "Keine Wirkstoffe" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / Tag" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / Tag" }
    ]
  },
  {
    title: "Fortgeschrittene Definitions-Kur (Muster)",
    headers: ["Woche", "Wirkstoff", "Dosierung"],
    rows: [
      { col1: "1-4", col2: "Testosteron Propionat", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Trenbolon Acetat", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Masteron Propionat", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Injektion)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Pyramide)" },
      { col1: "11-14", col2: "PCT-Protokoll", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesIT: TeaserTableData[] = [
  {
    title: "Ciclo di Massa per Principianti (Esempio)",
    headers: ["Settimana", "Composto", "Dosaggio"],
    rows: [
      { col1: "1-5", col2: "Testosterone Enantato", col3: "500 mg / settimana" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / giorno" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Testosterone Enantato", col3: "500 mg / settimana" },
      { col1: "13-15", col2: "Periodo di smaltimento", col3: "Nessun composto" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / giorno" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / giorno" }
    ]
  },
  {
    title: "Ciclo di Definizione Avanzata (Esempio)",
    headers: ["Settimana", "Composto", "Dosaggio"],
    rows: [
      { col1: "1-4", col2: "Testosterone Propionato", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Trenbolone Acetato", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Masteron Propionato", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Iniettabile)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Piramide)" },
      { col1: "11-14", col2: "Protocollo PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesRU: TeaserTableData[] = [
  {
    title: "Курс на массу для новичков (Пример)",
    headers: ["Неделя", "Препарат", "Дозировка"],
    rows: [
      { col1: "1-5", col2: "Тестостерон Энантат", col3: "500 мг / неделю" },
      { col1: "1-5", col2: "Дианабол (Кик-старт)", col3: "30 мг / день" },
      { col1: "1-12", col2: "Аримидекс", col3: "0,5 мг / через день" },
      { col1: "6-12", col2: "Тестостерон Энантат", col3: "500 мг / неделю" },
      { col1: "13-15", col2: "Период ожидания", col3: "Без препаратов" },
      { col1: "16-17", col2: "ПКТ: Нольвадекс", col3: "40 мг / день" },
      { col1: "18-19", col2: "ПКТ: Кломид", col3: "50 мг / день" }
    ]
  },
  {
    title: "Продвинутый курс на сушку (Пример)",
    headers: ["Неделя", "Препарат", "Дозировка"],
    rows: [
      { col1: "1-4", col2: "Тестостерон Пропионат", col3: "100 мг / через день" },
      { col1: "1-4", col2: "Тренболон Ацетат", col3: "75 мг / через день" },
      { col1: "1-8", col2: "Мастерон Пропионат", col3: "100 мг / через день" },
      { col1: "5-10", col2: "Винстрол (Инъекционный)", col3: "50 мг / через день" },
      { col1: "1-10", col2: "Т3 (Цитомель)", col3: "25 мкг (Пирамида)" },
      { col1: "11-14", col2: "Протокол ПКТ", col3: "ХГЧ + SERMs" }
    ]
  }
];

export const teaserTablesTR: TeaserTableData[] = [
  {
    title: "Yeni Başlayanlar İçin Hacim Kürü (Örnek)",
    headers: ["Hafta", "Bileşik", "Dozaj"],
    rows: [
      { col1: "1-5", col2: "Testosteron Enantat", col3: "500 mg / hafta" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / gün" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Testosteron Enantat", col3: "500 mg / hafta" },
      { col1: "13-15", col2: "Arınma Süresi", col3: "Madde yok" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / gün" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / gün" }
    ]
  },
  {
    title: "İleri Seviye Definasyon Kürü (Örnek)",
    headers: ["Hafta", "Bileşik", "Dozaj"],
    rows: [
      { col1: "1-4", col2: "Testosteron Propionat", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Trenbolon Asetat", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Masteron Propionat", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Enjekte)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Piramit)" },
      { col1: "11-14", col2: "PCT Protokolü", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesPT: TeaserTableData[] = [
  {
    title: "Ciclo de Bulking para Iniciantes (Amostra)",
    headers: ["Semana", "Composto", "Dosagem"],
    rows: [
      { col1: "1-5", col2: "Enantato de Testosterona", col3: "500 mg / semana" },
      { col1: "1-5", col2: "Dianabol (Kickstart)", col3: "30 mg / dia" },
      { col1: "1-12", col2: "Arimidex", col3: "0,5 mg / EOD" },
      { col1: "6-12", col2: "Enantato de Testosterona", col3: "500 mg / semana" },
      { col1: "13-15", col2: "Período de Limpeza", col3: "Sem compostos" },
      { col1: "16-17", col2: "PCT: Nolvadex", col3: "40 mg / dia" },
      { col1: "18-19", col2: "PCT: Clomid", col3: "50 mg / dia" }
    ]
  },
  {
    title: "Ciclo de Cutting Avançado (Amostra)",
    headers: ["Semana", "Composto", "Dosagem"],
    rows: [
      { col1: "1-4", col2: "Propionato de Testosterona", col3: "100 mg / EOD" },
      { col1: "1-4", col2: "Acetato de Trembolona", col3: "75 mg / EOD" },
      { col1: "1-8", col2: "Propionato de Masteron", col3: "100 mg / EOD" },
      { col1: "5-10", col2: "Winstrol (Injetável)", col3: "50 mg / EOD" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 mcg (Pirâmide)" },
      { col1: "11-14", col2: "Protocolo PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesFA: TeaserTableData[] = [
  {
    title: "دوره حجم مبتدی (نمونه)",
    headers: ["هفته", "ماده", "دوز"],
    rows: [
      { col1: "1-5", col2: "تستوسترون انانتات", col3: "500 میلی‌گرم / هفته" },
      { col1: "1-5", col2: "دیانابول (Kickstart)", col3: "30 میلی‌گرم / روز" },
      { col1: "1-12", col2: "آریمیدکس", col3: "0.5 میلی‌گرم / یک روز در میان" },
      { col1: "6-12", col2: "تستوسترون انانتات", col3: "500 میلی‌گرم / هفته" },
      { col1: "13-15", col2: "دوره پاکسازی", col3: "بدون مواد" },
      { col1: "16-17", col2: "PCT: نولوداکس", col3: "40 میلی‌گرم / روز" },
      { col1: "18-19", col2: "PCT: کلومید", col3: "50 میلی‌گرم / روز" }
    ]
  },
  {
    title: "دوره کات پیشرفته (نمونه)",
    headers: ["هفته", "ماده", "دوز"],
    rows: [
      { col1: "1-4", col2: "تستوسترون پروپیونات", col3: "100 میلی‌گرم / یک روز در میان" },
      { col1: "1-4", col2: "ترنبولون استات", col3: "75 میلی‌گرم / یک روز در میان" },
      { col1: "1-8", col2: "مسترون پروپیونات", col3: "100 میلی‌گرم / یک روز در میان" },
      { col1: "5-10", col2: "وینسترول (تزریقی)", col3: "50 میلی‌گرم / یک روز در میان" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 میکروگرم (هرمی)" },
      { col1: "11-14", col2: "پروتکل PCT", col3: "HCG + SERMs" }
    ]
  }
];

export const teaserTablesUR: TeaserTableData[] = [
  {
    title: "مبتدی بلکنگ پلان (نمونہ)",
    headers: ["ہفتہ", "مرکب", "خوراک"],
    rows: [
      { col1: "1-5", col2: "ٹیسٹوسٹیرون اینانتھٹ", col3: "500 ملی گرام / ہفتہ" },
      { col1: "1-5", col2: "ڈیانابول (کک اسٹارٹ)", col3: "30 ملی گرام / دن" },
      { col1: "1-12", col2: "اریمیڈیکس", col3: "0.5 ملی گرام / ایک دن چھوڑ کر" },
      { col1: "6-12", col2: "ٹیسٹوسٹیرون اینانتھٹ", col3: "500 ملی گرام / ہفتہ" },
      { col1: "13-15", col2: "صفائی کا دورانیہ", col3: "کوئی مرکب نہیں" },
      { col1: "16-17", col2: "PCT: نولواڈیکس", col3: "40 ملی گرام / دن" },
      { col1: "18-19", col2: "PCT: کلومیڈ", col3: "50 ملی گرام / دن" }
    ]
  },
  {
    title: "ایڈوانس کٹنگ پلان (نمونہ)",
    headers: ["ہفتہ", "مرکب", "خوراک"],
    rows: [
      { col1: "1-4", col2: "ٹیسٹوسٹیرون پروپیونیٹ", col3: "100 ملی گرام / ایک دن چھوڑ کر" },
      { col1: "1-4", col2: "ٹرینبولون ایسیٹیٹ", col3: "75 ملی گرام / ایک دن چھوڑ کر" },
      { col1: "1-8", col2: "ماسٹرون پروپیونیٹ", col3: "100 ملی گرام / ایک دن چھوڑ کر" },
      { col1: "5-10", col2: "ونسٹرول (انجیکشن ایبل)", col3: "50 ملی گرام / ایک دن چھوڑ کر" },
      { col1: "1-10", col2: "T3 (Cytomel)", col3: "25 مائیکرو گرام (پیرامڈ)" },
      { col1: "11-14", col2: "PCT پروٹوکول", col3: "HCG + SERMs" }
    ]
  }
];


const commonCompounds: Compound[] = [
  { id: 'test_e', name: 'Testosterone Enanthate', halfLife: 4.5 },
  { id: 'test_p', name: 'Testosterone Propionate', halfLife: 0.8 },
  { id: 'test_c', name: 'Testosterone Cypionate', halfLife: 5 },
  { id: 'tren_a', name: 'Trenbolone Acetate', halfLife: 1 },
  { id: 'tren_e', name: 'Trenbolone Enanthate', halfLife: 5 },
  { id: 'deca', name: 'Deca Durabolin', halfLife: 6 },
  { id: 'npp', name: 'NPP (Nandrolone Phenyl)', halfLife: 2.5 },
  { id: 'eq', name: 'Equipoise (Boldenone)', halfLife: 14 },
  { id: 'mast_p', name: 'Masteron Propionate', halfLife: 0.8 },
  { id: 'primo', name: 'Primobolan Enanthate', halfLife: 5 }
];

const injectionSitesAr: InjectionSite[] = [
  {
    id: 'glute_dorso', name: 'المؤخرة (Dorso)', category: 'Lower Body', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'أفضل مكان للحقن. عضلة كبيرة جداً، قليلة الأعصاب، وتتحمل كميات زيت كبيرة.', pathD: '',
    painLevel: 'منخفض جداً (1/10)',
    bestFor: 'الأحجام الكبيرة (3ml+)، المواد الزيتية',
    steps: ['قسم العضلة إلى أربعة أرباع تخيلية.', 'استهدف الربع "العلوي الخارجي" تماماً.', 'أدخل الإبرة كاملة بزاوية 90 درجة.', 'اسحب المكبس قليلاً للتأكد من عدم سحب دم، ثم احقن ببطء شديد.'],
    advice: "يا بني، هذا هو الملاذ الآمن. لا تتفلسف كثيراً في البداية، ابدأ من هنا دائماً. العضلة كبيرة وتتحمل أخطائك، لكن احذر من عرق النسا، لا تحقن إلا في الربع العلوي الخارجي بصدق وأمانة."
  },
  {
    id: 'glute_ventro', name: 'الورك الجانبي (Ventro)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'آمن جداً وبعيد عن الأعصاب الرئيسية. ممتاز لتجنب تليف المؤخرة الخلفية.', pathD: '',
    painLevel: 'منخفض (2/10)',
    bestFor: 'أأمن مكان طبياً، تدوير الحقن',
    steps: ['استلقِ على جانبك وضح يدك على مفصل الورك.', 'افرد الإبهام والسبابة لتشكل حرف V.', 'احقن في المنطقة العضلية المحصورة بين إصبعيك.', 'المنطقة خالية من الأعصاب الكبرى، لا تقلق.'],
    advice: "الآن أنت تتحدث كمحترف. هذا المكان هو الأأمن طبياً والأقل ألماً. إذا أتقنت الوصول إليه، فستعيش في راحة هرمونية بعيداً عن التليفات."
  },
  {
    id: 'delt_side', name: 'الكتف الجانبي', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Low', description: 'مكان شائع وسهل الوصول إليه. مناسب للكميات المتوسطة.', pathD: '',
    painLevel: 'متوسط (3/10)',
    bestFor: 'الكميات الصغيرة (1-1.5ml)، المواد السريعة',
    steps: ['تحسس عظمة الكتف البارزة (The Acromion) باصبعك.', 'قس مسافة إصبعين أو ثلاثة أسفل هذه العظمة.', 'احقن في منتصف العضلة الجانبية.', 'تجنب النزول كثيراً لتفادي العصب الكعبري.'],
    advice: "الكتف هو واجهة جسمك، لا تدمره بالحقن الكثيرة. استخدم إبر الأنسولين إذا كانت الكمية صغيرة، وحافظ على نظافة المكان كأنك في غرفة عمليات."
  },
  {
    id: 'quad_outer', name: 'الفخذ الخارجي', category: 'Lower Body', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'تجنب الحقن في الداخل! خطر إصابة أعصاب.', description: 'سهل الوصول إليه وأنت جالس. مؤلم قليلاً بعد الحقن (PIP).', pathD: '',
    painLevel: 'متوسط إلى عالي (5/10)',
    bestFor: 'سهولة الوصول الذاتي، أحجام متوسطة',
    steps: ['اجلس وظهرك مستقيم، وقسم الفخذ لثلاثة أثلاث.', 'استهدف "المنتصف الخارجي" من الفخذ (Vastus Lateralis).', 'تجنب تماماً الجزء الداخلي أو العلوي من الساق.', 'أدخل الإبرة بزاوية 90 درجة أو مائلة قليلاً للخارج.'],
    advice: "الفخذ متاح وسهل، لكنه غدار. إذا أصبت عصباً هناك فستعرج لأيام. لا تفعل ذلك إلا وأنت ثابت تماماً، وابعد عن أي أوردة ظاهرة."
  },
  {
    id: 'pecs', name: 'الصدر', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'للمحترفين فقط.', description: 'يستخدم لتوزيع الحقن وتجنب الندبات في الأماكن الأخرى.', pathD: '',
    painLevel: 'متوسط (4/10)',
    bestFor: 'المحترفين، تدوير الأماكن',
    steps: ['شد عضلة الصدر وحاول تحديد كتلتها.', 'احقن في الجزء الخارجي السميك من العضلة.', 'تجنب الاقتراب من الإبط (غدد ليمفاوية) أو النصف الداخلي.', 'الحقن يكون ضحلاً قليلاً مقارنة بالفخذ.'],
    advice: "عضلة الصدر قريبة من قلبك ومن رئتيك. لا تدخل هنا إلا إذا كنت تعرف تماماً ماذا تفعل. حافظ على الهدوء ولا تندفع بالإبرة بعمق زائد."
  },
  {
    id: 'lats', name: 'اللاتس (الظهر الجانبي)', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'عضلة كبيرة وتتحمل كميات جيدة. تتطلب مرونة للوصول إليها.', pathD: '',
    painLevel: 'منخفض (2/10)',
    bestFor: 'أحجام كبيرة، بديل للمؤخرة',
    steps: ['تحتاج لمرونة عالية للوصول بيدك للخلف.', 'اقرص العضلة للإمساك بها إذا أمكن.', 'احقن في الجزء اللحمي البارز.', 'احذر من الحقن العميق جداً باتجاه القفص الصدري.'],
    advice: "هنا تكمن القوة، عضلة تتحمل الكثير. لكن الوصول إليها يتطلب مرونة وثبات. إذا لم تستطع الوصول بيدك بوضوح، اطلب المساعدة أو اتركها لمكان آخر."
  },
  {
    id: 'triceps', name: 'التراي (الرأس الطويل)', category: 'Upper Body', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'ممتازة للكميات الصغيرة (Insulin Pin). تجنب الرأس الجانبي لتفادي الأعصاب.', pathD: '',
    painLevel: 'خفيف (2/10)',
    bestFor: 'الإبر الصغيرة (Insulin Pins)، كميات قليلة',
    steps: ['اختر الرأس الخلفي/الطويل للعضلة.', 'تجنب الرأس الجانبي الخارجي لوجود أعصاب.', 'ممتازة للحقن بإبر الأنسولين.', 'الحقن بطيء جداً بسبب صغر الإبرة.'],
    advice: "عضلة صغيرة وحساسة. كن رقيقاً جداً واستخدم أقل المقاسات. التراي لا يتحمل الزيوت الكثيفة أو الكميات الكبيرة، لا تخاطر بتورم يشوه منظر ذراعك."
  },
  {
    id: 'biceps', name: 'البايسبس', category: 'Upper Body', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'خطر! مليئة بالأوردة والأعصاب.', description: 'للمحترفين جداً. تستخدم للحقن الموضعي (Site Enhancement).', pathD: '',
    painLevel: 'عالي (7/10)',
    bestFor: 'المحترفين فقط (Site Enhancement)',
    steps: ['للمحترفين فقط: خطر إصابة أعصاب وعروق.', 'احقن في قمة العضلة (Peak).', 'اسحب المكبس ضروري جداً! كثرة الأوعية دموية.', 'توقع كدمات واردة جداً.'],
    advice: "اسمعني جيداً: البايسبس مليئة بالأوعية الدموية. الحقن هنا للمخاطرين فقط وأنا لا أحب المخاطرة بتلميذي. كن حذراً للغاية وتأكد من سحب المكبس ضروري جداً."
  },
  {
    id: 'traps', name: 'الترابيس', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'سهلة جداً وحقنها غير مؤلم غالباً. تعطي مظهراً ممتلئاً للمنطقة.', pathD: '',
    painLevel: 'متوسط (3/10)',
    bestFor: 'تدوير الأماكن، إبراز العضلة',
    steps: ['انظر للمرآة وحدد الجزء العلوي المثلث.', 'احقن من الأعلى للأسفل قليلاً.', 'تجنب الرقبة تماماً!.', 'المنطقة تتحمل 1-1.5 مل بسهولة.'],
    advice: "الترابيس تعطي منظراً مهيباً، لكنها قريبة جداً من أعصاب الرقبة والعمود الفقري. لا تقترب من منبت الرقبة أبداً. ابقى في المثلث الخارجي."
  },
  {
    id: 'calves', name: 'السمانة', category: 'Lower Body', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'مؤلمة جداً (High PIP).', description: 'قد تعيق المشي لعدة أيام. تستخدم فقط عند استنفاد الأماكن الأخرى.', pathD: '',
    painLevel: 'عالي جداً (9/10)',
    bestFor: 'للضرورة القصوى فقط',
    steps: ['مؤلمة جداً بعد الحقن، قد تعرج لأيام.', 'اختر الجزء الخارجي من العضلة.', 'تجنب المنطقة الخلفية للركبة تماماً.', 'استخدم إبرة دقيقة جداً.'],
    advice: "خيار اليائسين! الألم في السمانة قد يمنعك من المشي أو التمرين لأيام. فكر مرتين قبل الحقن هنا، هل المساحات الأخرى فعلاً استنفدت؟"
  },
  {
    id: 'forearms', name: 'الساعد', category: 'Upper Body', view: 'back', needle: '27G - 30G (0.5")', volume: '0.5 - 1.0 ml', recoveryDays: 4, riskLevel: 'High', warning: 'خطر عالي! أعصاب وأوردة كثيفة.', description: 'للمحترفين فقط. تستخدم غالباً للحقن الموضعي الصغير جداً.', pathD: '',
    painLevel: 'عالي (8/10)',
    bestFor: 'لا ينصح بها',
    steps: ['خطرة جداً لكثرة الأعصاب.', 'استخدم إبرة أنسولين قصيرة.', 'للحقن السطحي الموضعي فقط.'],
    advice: "هذه منطقة محرمة في مدرسة مستر إكس إلا للضرورة القصوى جداً. الأعصاب هنا مثل خيوط العنكبوت، أي خطأ قد يكلفك التحكم في يدك. لا أنصحك بها."
  },
  {
    id: 'pecs_lower', name: 'الصدر السفلي', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'تجنب منطقة الحلمة تماماً.', description: 'تساعد في توزيع الحقن في عضلة الصدر الكبيرة.', pathD: '',
    painLevel: 'متوسط (5/10)',
    bestFor: 'تدوير الأماكن',
    steps: ['تأكد من وجود كتلة عضلية كافية.', 'ابتعد تماماً عن الحلمة.', 'احقن بزاوية مائلة قليلاً.'],
    advice: "إضافة ذكية لتدوير الأماكن، لكن احذر من الاقتراب من الحلمة أو الأنسجة الحساسة. ابقَ في الجزء العضلي الصلب دائماً."
  },
  {
    id: 'delt_rear', name: 'الكتف الخلفي', category: 'Upper Body', view: 'back', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'جيد لتدوير الأماكن. عضلة صغيرة، احذر الأعصاب.', pathD: '',
    painLevel: 'متوسط (4/10)',
    bestFor: 'تدوير الأماكن، أحجام صغيرة',
    steps: ['حدد الرأس الخلفي لعضلة الكتف.', 'احقن في منتصف العضلة.', 'تجنب منطقة الإبط.', 'استخدم إبر أصغر إن أمكن.'],
    advice: "عضلة صغيرة لكنها رائعة للحقن البسيط. تأكد فقط أنك لا تضغط على مفاصل الكتف. الهدوء والثبات هما سر النجاح هنا."
  }
];

const injectionSitesEn: InjectionSite[] = [
  {
    id: 'glute_dorso', name: 'Glute (Dorsogluteal)', category: 'Lower Body', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'The gold standard. Huge muscle belly, fewer nerves, handles high volume.', pathD: '',
    painLevel: 'Low (1/10)',
    bestFor: 'High Volume, Oil Based',
    steps: ['Divide buttock into 4 quadrants.', 'Aim for Upper-Outer quadrant.', 'Insert needle at 90 degrees.', 'Aspirate and inject slowly (30s per ml).'],
    advice: "My boy, this is your safe haven. Don't overthink it in the beginning; always start here. The muscle is massive and forgives mistakes, but watch out for the sciatic nerve. Only inject in the upper-outer quadrant with total honesty and integrity."
  },
  {
    id: 'glute_ventro', name: 'Glute (Ventrogluteal)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'Extremely safe, far from sciatic nerve. Best rotation site.', pathD: '',
    painLevel: 'Low (2/10)',
    bestFor: 'Safety, Daily Rotation',
    steps: ['Lie on your side. Place palm on hip bone.', 'Spread thumb and index finger to form a V.', 'Inject in the muscle belly between fingers.', 'Safest site medically speaking.'],
    advice: "Now you're talking like a pro. This site is medically the safest and least painful. If you master reaching it, you'll live in hormonal comfort far away from scar tissue."
  },
  {
    id: 'delt_side', name: 'Side Delt', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 2.0 ml', recoveryDays: 5, riskLevel: 'Low', description: 'Very accessible. Good for medium volumes.', pathD: '',
    painLevel: 'Medium (3/10)',
    bestFor: 'Fast Acting, Small to Medium Volume',
    steps: ['Find the Acromion process (shoulder bone).', 'Measure 2-3 finger widths down.', 'Inject in the center of the side delt.', 'Avoid going too low (radial nerve risk).'],
    advice: "The shoulder is the face of your physique; don't ruin it with excessive injections. Use insulin pins for small volumes and keep the area as clean as an operating room."
  },
  {
    id: 'quad_outer', name: 'Outer Quad (Vastus Lateralis)', category: 'Lower Body', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'Stay outer! Inner thigh has major nerves.', description: 'Easy to access while sitting. Can have higher PIP.', pathD: '',
    painLevel: 'Medium-High (5/10)',
    bestFor: 'Self-Administration, Visual Control',
    steps: ['Sit down and divide thigh into thirds.', 'Target the middle outer third.', 'Inject at 90 degrees or slightly angled outward.', 'Never inject inner thigh.'],
    advice: "The quad is accessible and easy, but it's treacherous. If you hit a nerve there, you'll be limping for days. Only do it when you're completely steady, and stay away from visible veins."
  },
  {
    id: 'pecs', name: 'Pecs', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'Advanced users only.', description: 'Used for site rotation to avoid scar tissue elsewhere.', pathD: '',
    painLevel: 'Medium (4/10)',
    bestFor: 'Advanced Rotation',
    steps: ['Flex pecs to find muscle mass.', 'Inject into the thick outer portion.', 'Avoid armpit area (lymph nodes).', 'Shallower injection than quads.'],
    advice: "The chest muscle is close to your heart and lungs. Don't enter here unless you know exactly what you're doing. Stay calm and don't push the needle with excessive depth."
  },
  {
    id: 'lats', name: 'Lats', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'Great site for volume. Requires some flexibility to reach.', pathD: '',
    painLevel: 'Low (2/10)',
    bestFor: 'Volume, Stealth',
    steps: ['Reach around or use a mirror.', 'Pinch muscle if possible to isolate.', 'Inject into the thickest part.', 'Ensure not to go too deep towards ribs.'],
    advice: "Here lies the power—a muscle that can handle a lot. But reaching it requires flexibility and stability. If you can't reach clearly, seek help or leave it for another spot."
  },
  {
    id: 'triceps', name: 'Triceps (Long Head)', category: 'Upper Body', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'Excellent for small volumes using insulin pins. Avoid lateral head.', pathD: '',
    painLevel: 'Low (2/10)',
    bestFor: 'Insulin Pins, Small Volume',
    steps: ['Target the rear/long head of tricep.', 'Avoid the outer head (nerves).', 'Perfect for insulin pin injections.', 'Inject slowly.'],
    advice: "A small and sensitive muscle. Be very gentle and use the smallest gauges. The tricep doesn't handle thick oils or large volumes well; don't risk a swelling that ruins your arm's look."
  },
  {
    id: 'biceps', name: 'Biceps', category: 'Upper Body', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'Danger zone! Many nerves and veins.', description: 'Expert only. Often used for site enhancement protocols.', pathD: '',
    painLevel: 'High (7/10)',
    bestFor: 'Experts, Site Enhancement',
    steps: ['Experts only: High vein/nerve risk.', 'Inject at the peak of the muscle.', 'Aspirate is mandatory here.', 'Expect bruising.'],
    advice: "Listen to me carefully: the biceps are packed with blood vessels. Injecting here is for risk-takers only, and I don't like taking risks with my student. Be extremely careful and make sure to aspirate every single time."
  },
  {
    id: 'traps', name: 'Traps', category: 'Upper Body', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'Very easy access and usually painless. Visual "pop" effect.', pathD: '',
    painLevel: 'Medium (3/10)',
    bestFor: 'Visual Pop, Rotation',
    steps: ['Look in mirror, find upper trap triangle.', 'Inject slightly downwards.', 'Stay away from neck vertebrae.', 'Good for 1ml injections.'],
    advice: "Traps give a majestic look, but they're very close to the nerves of the neck and spine. Never go near the base of the neck. Stay in the outer triangle."
  },
  {
    id: 'calves', name: 'Calves', category: 'Lower Body', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'Extreme PIP warning.', description: 'Can make walking difficult. Last resort for rotation.', pathD: '',
    painLevel: 'Very High (9/10)',
    bestFor: 'Last Resort',
    steps: ['Expect significant pain post-injection.', 'Target outer calf muscle.', 'Avoid back of knee area completely.', 'Use very thin needle.'],
    advice: "The option of the desperate! Pain in the calf can prevent you from walking or training for days. Think twice before injecting here—have the other areas really been exhausted?"
  },
  {
    id: 'forearms', name: 'Forearms', category: 'Upper Body', view: 'back', needle: '27G - 30G (0.5")', volume: '0.5 - 1.0 ml', recoveryDays: 4, riskLevel: 'High', warning: 'High risk! Dense nerves and veins.', description: 'Advanced only. Primarily used for small site-specific micro-injections.', pathD: '',
    painLevel: 'High (8/10)',
    bestFor: 'Not Recommended',
    steps: ['High risk of nerve hit.', 'Use short insulin pins only.', 'Surface/Micro injections only.'],
    advice: "This is a forbidden zone in Mr. X's school except for the most extreme necessity. The nerves here are like spider webs; one mistake could cost you hand control. I do not recommend it."
  },
  {
    id: 'pecs_lower', name: 'Lower Pecs', category: 'Upper Body', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'Avoid nipple area completely.', description: 'Expands the injection surface area of the chest.', pathD: '',
    painLevel: 'Medium (5/10)',
    bestFor: 'Advanced Rotation',
    steps: ['Ensure adequate muscle mass exists.', 'Keep safe distance from nipple.', 'Inject at varying angle.'],
    advice: "A smart addition for rotation, but beware of getting close to the nipple or sensitive tissue. Always stay in the solid muscle mass."
  },
  {
    id: 'delt_rear', name: 'Rear Delt', category: 'Upper Body', view: 'back', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'Good for rotation. Small muscle, careful with nerves.', pathD: '',
    painLevel: 'Medium (4/10)',
    bestFor: 'Site Rotation, Small Volume',
    steps: ['Locate the posterior head of the deltoid.', 'Inject into the center of the muscle belly.', 'Avoid the armpit area.', 'Use smaller needles if possible.'],
    advice: "A small muscle but excellent for light injections. Just make sure you're not putting pressure on the shoulder joints. Calmness and stability are the secrets here."
  }
];

const labTestsAr: LabTest[] = [
  { id: 'test_total', name: 'Testosterone, Total', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'مستوى التستوستيرون الكلي في الدم.', elevationMeaning: 'نتيجة طبيعية للكورس. إذا كان > 1500، الكورس فعال.', lowMeaning: 'ضعف جنسي، اكتئاب، خسارة عضلية. (علامة فشل PCT)', management: 'إذا مرتفع: استمر. إذا منخفض: ابدأ PCT فوراً.' },
  { id: 'e2', name: 'Estradiol (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'هرمون الأنوثة. يتحول من التستوستيرون.', elevationMeaning: 'خطر الجينو (تثدي)، احتباس ماء، ضغط دم.', lowMeaning: 'ألم مفاصل، ضعف انتصاب، جفاف.', management: 'مرتفع: خذ Arimidex 0.5mg. منخفض: وقف الـ AI.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'إنزيم كبد رئيسي.', elevationMeaning: 'إجهاد كبد. شائع مع الحبوب (Orals).', lowMeaning: 'نادر وغير مقلق.', management: 'أوقف الحبوب، خذ TUDCA + NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'إنزيم كبد وعضلات.', elevationMeaning: 'إجهاد كبد أو تدمير عضلي شديد من التمرين.', lowMeaning: 'غير مقلق.', management: 'قيم الـ ALT معه للتأكد من الكبد.' },
  { id: 'creatinine', name: 'Creatinine', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'مؤشر وظائف كلى.', elevationMeaning: 'إجهاد كلوي، أو جفاف، أو كتلة عضلية ضخمة.', lowMeaning: 'ضمور عضلي.', management: 'اشرب ماء أكثر (4-5 لتر). قلل البروتين قليلاً.' },
  { id: 'hdl', name: 'HDL Cholesterol', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'الكوليسترول النافع.', elevationMeaning: 'ممتاز لصحة القلب.', lowMeaning: 'خطر! شائع جداً في الكورسات.', management: 'زيت سمك 4g/يوم، كارديو، Niacin.' },
  { id: 'hematocrit', name: 'Hematocrit', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'لزوجة الدم.', elevationMeaning: 'دم ثقيل = خطر جلطات.', lowMeaning: 'أنيميا.', management: 'تبرع بالدم فوراً إذا تجاوز 52%.' },
  { id: 'fsh', name: 'FSH', category: 'hormones', range: '1.5 - 12.4', unit: 'mIU/mL', min: 1.5, max: 12.4, description: 'الهرمون المحفز للجريب. يتحكم في إنتاج الحيوانات المنوية.', elevationMeaning: 'فشل أولي في الخصيتين.', lowMeaning: 'خمول (Shutdown). متوقع خلال الكورس.', management: 'متوقع في الكورس. يسترجع في فترة الـ PCT.' },
  { id: 'lh', name: 'LH', category: 'hormones', range: '1.7 - 8.6', unit: 'mIU/mL', min: 1.7, max: 8.6, description: 'الهرمون الملوتن. يعطي إشارة للخصية لإنتاج التستوستيرون.', elevationMeaning: 'تضرر في الخصية.', lowMeaning: 'خمول (Shutdown). متوقع تماماً في الكورس.', management: 'تحتاج HCG أو بروتوكول PCT بعد الكورس.' },
  { id: 'prolactin', name: 'Prolactin', category: 'hormones', range: '4.0 - 15.2', unit: 'ng/mL', min: 4, max: 15.2, description: 'هرمون التوتر/النخامية.', elevationMeaning: 'خطر جينو، ضعف رغبة. شائع مع الترين والديكا.', lowMeaning: 'نادر وغير مقلق.', management: 'إذا مرتفع: استخدم P5P أو Cabergoline.' },
  { id: 'shbg', name: 'SHBG', category: 'hormones', range: '16.5 - 55.9', unit: 'nmol/L', min: 16.5, max: 55.9, description: 'البروتين الرابط للهرمونات الجنسية.', elevationMeaning: 'يقلل التستوستيرون الحر الفعال.', lowMeaning: 'تستوستيرون حر عالي (متوقع مع الحبوب).', management: 'الحبوب (Orals) غالباً ما تخفضه جداً.' },
  { id: 'progesterone', name: 'Progesterone', category: 'hormones', range: '< 1.0', unit: 'ng/mL', min: 0, max: 1.0, description: 'هرمون أنثوي (مسؤول عن احتباس الماء والجينو مع الديكا/الترين).', elevationMeaning: 'خطر جينو واحتباس سوائل (تأثير البروجستين).', lowMeaning: 'غير مهم للرجال.', management: 'تجنب الديكا/الترين إذا كنت حساساً.' },
  { id: 'dht', name: 'DHT', category: 'hormones', range: '30 - 85', unit: 'ng/dL', min: 30, max: 85, description: 'ديهيدروتستوستيرون (أقوى أندروجين).', elevationMeaning: 'تساقط شعر، حب شباب، تضخم بروستاتا.', lowMeaning: 'ضعف جنسي، نقص في صلابة العضلات.', management: 'استخدم Finasteride فقط عند الضرورة القصوى.' },
  { id: 'igf1', name: 'IGF-1', category: 'hormones', range: '115 - 307', unit: 'ng/mL', min: 115, max: 307, description: 'عامل النمو شبيه الأنسولين (مؤشر هرمون النمو).', elevationMeaning: 'نمو عضلي هائل (أو استخدام GH/MK-677).', lowMeaning: 'صعوبة في البناء والاستشفاء.', management: 'السر الحقيقي للبناء العضلي.' },
  { id: 'cortisol', name: 'Cortisol (AM)', category: 'hormones', range: '6.2 - 19.4', unit: 'ug/dL', min: 6.2, max: 19.4, description: 'هرمون التوتر (هادم للعضلات).', elevationMeaning: 'هدم عضلي، تراكم دهون البطن، أرق.', lowMeaning: 'إرهاق كظري (Adrenal Fatigue).', management: 'قلل الكافيين، نم جيداً، خذ Ashwagandha.' },
  { id: 'dhea', name: 'DHEA-S', category: 'hormones', range: '80 - 560', unit: 'ug/dL', min: 80, max: 560, description: 'هرمون "الشباب" ومصدر للهرمونات الأخرى.', elevationMeaning: 'بشرة دهنية، حب شباب.', lowMeaning: 'طاقة منخفضة، تعافي بطيء.', management: 'مكمل DHEA بسيط وفعال.' },
  { id: 'test_free', name: 'Free Testosterone', category: 'hormones', range: '9.3 - 26.5', unit: 'pg/mL', min: 9.3, max: 26.5, description: 'التستوستيرون النشط فعلياً في الجسم.', elevationMeaning: 'بناء عضلي هائل. متوقع في الكورس.', lowMeaning: 'فقدان القوة والنشاط.', management: 'يفضل مراقبته مع التستوستيرون الكلي.' },
  { id: 'ldl', name: 'LDL Cholesterol', category: 'blood', range: '< 100', unit: 'mg/dL', min: 0, max: 100, description: 'الكوليسترول الضار.', elevationMeaning: 'خطر ترسب الدهون في الشرايين.', lowMeaning: 'غير مقلق طبياً.', management: 'كارديو، ألياف، ودهون صحية (أوميجا 3).' },
  { id: 'triglycerides', name: 'Triglycerides', category: 'blood', range: '< 150', unit: 'mg/dL', min: 0, max: 150, description: 'الدهون الثلاثية في الدم.', elevationMeaning: 'خطر أمراض القلب.', lowMeaning: 'نتيجة نشاط بدني عالي أو صيام.', management: 'نظام غذائي متوازن وأوميجا 3.' },
  { id: 'rbc', name: 'RBC Count', category: 'blood', range: '4.14 - 5.80', unit: 'x10^6/uL', min: 4.14, max: 5.8, description: 'عدد خلايا الدم الحمراء.', elevationMeaning: 'دم ثقيل (مخاطر لزوجة).', lowMeaning: 'أنيميا (فقر دم).', management: 'راقبه مع الهيماتوكريت.' },
  { id: 'hgb', name: 'Hemoglobin', category: 'blood', range: '13.0 - 17.7', unit: 'g/dL', min: 13, max: 17.7, description: 'بروتين نقل الأكسجين.', elevationMeaning: 'زيادة لزوجة الدم.', lowMeaning: 'فقر دم.', management: 'راقبه خصوصاً عند استخدام الإيكوبويز (EQ).' },
  { id: 'wbc', name: 'WBC Count', category: 'blood', range: '3.4 - 10.8', unit: 'x10^3/uL', min: 3.4, max: 10.8, description: 'عدد خلايا الدم البيضاء (المناعة).', elevationMeaning: 'عدوى أو التهاب في الجسم.', lowMeaning: 'ضعف مناعي.', management: 'التمرين الشديد قد يرفعها مؤقتاً.' },
  { id: 'bun', name: 'BUN (Urea)', category: 'organs', range: '6 - 20', unit: 'mg/dL', min: 6, max: 20, description: 'فضلات تكسير البروتين.', elevationMeaning: 'دايت عالي البروتين أو إجهاد كلى.', lowMeaning: 'دايت منخفض البروتين.', management: 'شائع جداً عند لاعبي كمال الأجسام.' },
  { id: 'bilirubin', name: 'Bilirubin, Total', category: 'organs', range: '0.0 - 1.2', unit: 'mg/dL', min: 0, max: 1.2, description: 'مؤشر كبد ومرارة.', elevationMeaning: 'مشكلة في القنوات المرارية أو تضرر كبد.', lowMeaning: 'غير مدعاة للقلق.', management: 'راقب حدوث اصفرار في العين.' },
  { id: 'alp', name: 'Alkaline Phosphatase', category: 'organs', range: '44 - 147', unit: 'U/L', min: 44, max: 147, description: 'إنزيم كبد وعظام.', elevationMeaning: 'انسداد مراري أو إجهاد كبدي عالي.', lowMeaning: 'نادر جداً.', management: 'قيم النتيجة مع ALT و AST.' },
  { id: 'vit_d', name: 'Vitamin D (25-OH)', category: 'vitamins', range: '30 - 100', unit: 'ng/mL', min: 30, max: 100, description: 'فيتامين أساسي لإنتاج التستوستيرون.', elevationMeaning: 'زيادة مفرطة في الفيتامين (نادر).', lowMeaning: 'ضعف عضلات، هبوط تستوستيرون، وهن بمناعة.', management: 'مكمل 5000 وحدة دولية يومياً.' },
  { id: 'vit_b12', name: 'Vitamin B12', category: 'vitamins', range: '232 - 1245', unit: 'pg/mL', min: 232, max: 1245, description: 'صحة الأعصاب والطاقة.', elevationMeaning: 'زيادة مفرطة.', lowMeaning: 'تضرر أعصاب، تعب مزمن.', management: 'مكمل B12 (Methylcobalamin).' },
  { id: 'zinc', name: 'Zinc, Serum', category: 'minerals', range: '60 - 120', unit: 'ug/dL', min: 60, max: 120, description: 'معدن أساسي للتستوستيرون والصحة.', elevationMeaning: 'قد يسبب نقص في النحاس.', lowMeaning: 'انخفاض الخصوبة والتستوستيرون.', management: 'ZMA أو مكمل زنك بيكولينات.' },
  { id: 'magnesium', name: 'Magnesium', category: 'minerals', range: '1.6 - 2.3', unit: 'mg/dL', min: 1.6, max: 2.3, description: 'وظائف العضلات والأعصاب.', elevationMeaning: 'مشاكل في الكلى.', lowMeaning: 'تشنجات، قلق، نوم سيء.', management: 'مكمل مغنيسيوم جلايسينيت.' },
  { id: 'tsh', name: 'TSH', category: 'thyroid', range: '0.450 - 4.500', unit: 'uIU/mL', min: 0.45, max: 4.5, description: 'الهرمون المحفز للغدة الدرقية.', elevationMeaning: 'خمول غدة (حرق بطيء جداً).', lowMeaning: 'نشاط مفرط (قد ينخفض عند أخذ T3).', management: 'صحة الغدة حاسمة جداً لحرق الدهون.' },
  { id: 'free_t3', name: 'Free T3', category: 'thyroid', range: '2.0 - 4.4', unit: 'pg/mL', min: 2, max: 4.4, description: 'هرمون الغدة الدرقية النشط (الميتابوليزم).', elevationMeaning: 'حرق دهون عالي.', lowMeaning: 'توقف الميتابوليزم (شائع مع الترين).', management: 'يجب مراقبته عند استخدام T3 أو ترين.' },
  { id: 'free_t4', name: 'Free T4', category: 'thyroid', range: '0.82 - 1.77', unit: 'ng/dL', min: 0.82, max: 1.77, description: 'هرمون الغدة الدرقية الخام.', elevationMeaning: 'فرط نشاط غدة.', lowMeaning: 'خمول غدة.', management: 'المؤشر الرئيسي لإنتاج الغدة.' }
];

const labTestsEn: LabTest[] = [
  { id: 'test_total', name: 'Testosterone, Total', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'Total circulating testosterone.', elevationMeaning: 'Expected on cycle. >1500 means gear is real.', lowMeaning: 'Hypogonadism, depression, muscle loss.', management: 'High: Good on cycle. Low: Start PCT.' },
  { id: 'e2', name: 'Estradiol (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'Estrogen converted from Test.', elevationMeaning: 'Gyno risk, water retention, high BP.', lowMeaning: 'Joint pain, ED, dry skin.', management: 'High: Take AI (Arimidex). Low: Stop AI.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'Liver enzyme.', elevationMeaning: 'Liver stress (common with orals).', lowMeaning: 'Not concerning.', management: 'Stop orals, add TUDCA/NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'Liver & Muscle enzyme.', elevationMeaning: 'Liver stress or hard training damage.', lowMeaning: 'Not concerning.', management: 'Check ALT to confirm liver.' },
  { id: 'creatinine', name: 'Creatinine', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'Kidney function marker.', elevationMeaning: 'Kidney stress, dehydration, or high muscle mass.', lowMeaning: 'Low muscle mass.', management: 'Hydrate (4L+). Monitor BP.' },
  { id: 'hdl', name: 'HDL Cholesterol', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'Good cholesterol.', elevationMeaning: 'Heart protective.', lowMeaning: 'DANGER. Very common on cycle.', management: 'Fish Oil 4g, Cardio, Niacin.' },
  { id: 'hematocrit', name: 'Hematocrit', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'Blood viscosity (thickness).', elevationMeaning: 'Thick blood = Clot risk.', lowMeaning: 'Anemia.', management: 'Donate blood if > 52%.' },
  { id: 'fsh', name: 'FSH', category: 'hormones', range: '1.5 - 12.4', unit: 'mIU/mL', min: 1.5, max: 12.4, description: 'Follicle Stimulating Hormone. Controls sperm production.', elevationMeaning: 'Primary testicular failure.', lowMeaning: 'Shutdown. Expected on cycle.', management: 'Expected on cycle. Recover during PCT.' },
  { id: 'lh', name: 'LH', category: 'hormones', range: '1.7 - 8.6', unit: 'mIU/mL', min: 1.7, max: 8.6, description: 'Luteinizing Hormone. Signals Test production.', elevationMeaning: 'Testicular damage.', lowMeaning: 'Shutdown. Expected on cycle.', management: 'Expected on cycle. HCG/PCT needed.' },
  { id: 'prolactin', name: 'Prolactin', category: 'hormones', range: '4.0 - 15.2', unit: 'ng/mL', min: 4, max: 15.2, description: 'Stress/pituitary hormone.', elevationMeaning: 'Gyno risk, low libido. Common with Tren/Deca.', lowMeaning: 'Rare, not concerning.', management: 'If high: P5P or Cabergoline.' },
  { id: 'shbg', name: 'SHBG', category: 'hormones', range: '16.5 - 55.9', unit: 'nmol/L', min: 16.5, max: 55.9, description: 'Sex Hormone Binding Globulin.', elevationMeaning: 'Lowers Free Test.', lowMeaning: 'High Free Test (Expected with orals).', management: 'Orals usually crush SHBG.' },
  { id: 'progesterone', name: 'Progesterone', category: 'hormones', range: '< 1.0', unit: 'ng/mL', min: 0, max: 1.0, description: 'Key for Deca/Tren users (Prolactin pathways).', elevationMeaning: 'Gyno risk, water retention, mood swings.', lowMeaning: 'Irrelevant for men.', management: 'Avoid 19-Nors if sensitive.' },
  { id: 'dht', name: 'DHT', category: 'hormones', range: '30 - 85', unit: 'ng/dL', min: 30, max: 85, description: 'Dihydrotestosterone (Potent Androgen).', elevationMeaning: 'Hair loss, acne, prostate enlargement.', lowMeaning: 'Low libido, soft muscles.', management: 'Finasteride only if absolutely needed.' },
  { id: 'igf1', name: 'IGF-1', category: 'hormones', range: '115 - 307', unit: 'ng/mL', min: 115, max: 307, description: 'Insulin-like Growth Factor 1.', elevationMeaning: 'Massive growth (or GH/MK-677 use).', lowMeaning: 'Poor recovery, muscle wasting.', management: 'The holy grail of hypertrophy.' },
  { id: 'cortisol', name: 'Cortisol (AM)', category: 'hormones', range: '6.2 - 19.4', unit: 'ug/dL', min: 6.2, max: 19.4, description: 'Stress hormone (Catabolic).', elevationMeaning: 'Muscle loss, belly fat, insomnia.', lowMeaning: 'Adrenal fatigue.', management: 'Sleep, Ashwagandha, lower caffeine.' },
  { id: 'dhea', name: 'DHEA-S', category: 'hormones', range: '80 - 560', unit: 'ug/dL', min: 80, max: 560, description: 'Adrenal androgen precursor.', elevationMeaning: 'Oily skin, acne.', lowMeaning: 'Low energy, poor immune system.', management: 'Cheap DHEA supplement fixes this.' },
  { id: 'test_free', name: 'Free Testosterone', category: 'hormones', range: '9.3 - 26.5', unit: 'pg/mL', min: 9.3, max: 26.5, description: 'Actually active testosterone.', elevationMeaning: 'Expected on cycle. High anabolism.', lowMeaning: 'Loss of gains, low energy.', management: 'Good to track along with Total Test.' },
  { id: 'ldl', name: 'LDL Cholesterol', category: 'blood', range: '< 100', unit: 'mg/dL', min: 0, max: 100, description: 'Bad cholesterol.', elevationMeaning: 'Plaque risk in arteries.', lowMeaning: 'Rarely a problem.', management: 'Cardio, healthy fats, fiber.' },
  { id: 'triglycerides', name: 'Triglycerides', category: 'blood', range: '< 150', unit: 'mg/dL', min: 0, max: 150, description: 'Fats in blood.', elevationMeaning: 'Heart disease risk.', lowMeaning: 'High activity/diet.', management: 'Omega-3 and diet control.' },
  { id: 'rbc', name: 'RBC Count', category: 'blood', range: '4.14 - 5.80', unit: 'x10^6/uL', min: 4.14, max: 5.8, description: 'Red Blood Cell count.', elevationMeaning: 'Thick blood (Erythrocytosis).', lowMeaning: 'Anemia.', management: 'Monitor with Hematocrit.' },
  { id: 'hgb', name: 'Hemoglobin', category: 'blood', range: '13.0 - 17.7', unit: 'g/dL', min: 13, max: 17.7, description: 'Oxygen carrying protein.', elevationMeaning: 'Thick blood.', lowMeaning: 'Anemia.', management: 'Monitor on Boldenone (EQ).' },
  { id: 'wbc', name: 'WBC Count', category: 'blood', range: '3.4 - 10.8', unit: 'x10^3/uL', min: 3.4, max: 10.8, description: 'White Blood Cell count (Immune).', elevationMeaning: 'Infection or inflammation.', lowMeaning: 'Weak immune system.', management: 'Training can cause temporary spikes.' },
  { id: 'bun', name: 'BUN (Urea)', category: 'organs', range: '6 - 20', unit: 'mg/dL', min: 6, max: 20, description: 'Protein metabolism waste.', elevationMeaning: 'High protein diet or kidney stress.', lowMeaning: 'Low protein intake.', management: 'Commonly high in bodybuilders.' },
  { id: 'bilirubin', name: 'Bilirubin, Total', category: 'organs', range: '0.0 - 1.2', unit: 'mg/dL', min: 0, max: 1.2, description: 'Liver function marker.', elevationMeaning: 'Biliary issues or liver damage.', lowMeaning: 'Not concerning.', management: 'Watch for jaundice symptoms.' },
  { id: 'alp', name: 'Alkaline Phosphatase', category: 'organs', range: '44 - 147', unit: 'U/L', min: 44, max: 147, description: 'Liver and bone enzyme.', elevationMeaning: 'Gallbladder or liver blockage.', lowMeaning: 'Rare.', management: 'Check with ALT/AST.' },
  { id: 'vit_d', name: 'Vitamin D (25-OH)', category: 'vitamins', range: '30 - 100', unit: 'ng/mL', min: 30, max: 100, description: 'Essential for Test production.', elevationMeaning: 'Toxicity risk (rare).', lowMeaning: 'Low Test, weak immune system.', management: 'Supplement 5000 IU daily.' },
  { id: 'vit_b12', name: 'Vitamin B12', category: 'vitamins', range: '232 - 1245', unit: 'pg/mL', min: 232, max: 1245, description: 'Energy and nerve health.', elevationMeaning: 'Rarely a problem.', lowMeaning: 'Nerve damage, fatigue.', management: 'Methylcobalamin supplement.' },
  { id: 'zinc', name: 'Zinc, Serum', category: 'minerals', range: '60 - 120', unit: 'ug/dL', min: 60, max: 120, description: 'Testosterone support mineral.', elevationMeaning: 'Copper deficiency risk.', lowMeaning: 'Low Test, low immunity.', management: 'ZMA or Zinc Picolinate.' },
  { id: 'magnesium', name: 'Magnesium', category: 'minerals', range: '1.6 - 2.3', unit: 'mg/dL', min: 1.6, max: 2.3, description: 'Muscle and nerve function.', elevationMeaning: 'Kidney issues.', lowMeaning: 'Cramps, anxiety, poor sleep.', management: 'Take Magnesium Glycinate.' },
  { id: 'tsh', name: 'TSH', category: 'thyroid', range: '0.450 - 4.500', unit: 'uIU/mL', min: 0.45, max: 4.5, description: 'Thyroid Stimulating Hormone.', elevationMeaning: 'Hypothyroidism (Slow metabolic).', lowMeaning: 'Hyperthyroidism (May be low on T3).', management: 'Thyroid health is key for fat loss.' },
  { id: 'free_t3', name: 'Free T3', category: 'thyroid', range: '2.0 - 4.4', unit: 'pg/mL', min: 2, max: 4.4, description: 'Active thyroid hormone (Metabolism).', elevationMeaning: 'Fast metabolism.', lowMeaning: 'Metabolic shutdown (Common with Tren).', management: 'Monitor if using Tren or T3.' },
  { id: 'free_t4', name: 'Free T4', category: 'thyroid', range: '0.82 - 1.77', unit: 'ng/dL', min: 0.82, max: 1.77, description: 'Precursor thyroid hormone.', elevationMeaning: 'Overactive thyroid.', lowMeaning: 'Underactive thyroid.', management: 'Main thyroid production marker.' }
];

const injectionSitesHe: InjectionSite[] = [
  { id: 'glute_dorso', name: 'גלוט (Dorsogluteal)', category: 'פלג גוף תחתון', view: 'back', needle: '23G - 25G (1.5")', volume: '3.0 - 4.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'הסטנדרט המוזהב. שריר גדול, פחות עצבים, מתמודד עם נפח גבוה.', pathD: '', steps: ['חלק את העכוז ל-4 רביעים.', 'כוון לרביע העליון-חיצוני.', 'הכנס את המחט ב-90 מעלות.', 'בצע שאיבה והזרק לאט (30 שניות למ״ל).'], advice: "בן שלי, זה המקלט הבטוח שלך. אל תחשוב יותר מדי בהתחלה; תמיד תתחיל כאן. השריר עצום וסולח על טעויות, אבל היזהר מעצב השת. הזרק רק ברבע העליון-חיצוני ביושר ובאחריות." },
  { id: 'glute_ventro', name: 'גלוט (Ventrogluteal)', category: 'פלג גוף תחתון', view: 'front', needle: '23G - 25G (1.5")', volume: '2.5 - 3.0 ml', recoveryDays: 7, riskLevel: 'Low', description: 'בטוח מאוד, רחוק מעצב השת. האתר הטוב ביותר לרוטציה.', pathD: '', steps: ['שכב על הצד. הנח כף יד על עצם האגן.', 'פתח את האגודל והאצבע לצורת V.', 'הזרק במרכז השריר שבין האצבעות.', 'האתר הבטוח ביותר מבחינה רפואית.'], advice: "עכשיו אתה מדבר כמו מקצוען. האתר הזה הוא הרפואי הבטוח ביותר והכי פחות כואב. אם תלמד להגיע אליו, תחיה בנוחות הורמונלית רחוק מרקמה צלקתית." },
  { id: 'delt_side', name: 'כתף צידית', category: 'פלג גוף עליון', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 2.0 ml', recoveryDays: 5, riskLevel: 'Low', description: 'אתר נגיש מאוד. טוב לנפחים בינוניים.', pathD: '', steps: ['מצא את עצם האקרומיון (עצם הכתף).', 'מדוד 2-3 אצבעות למטה.', 'הזרק במרכז הכתף הצידית.', 'הימנע מלרדת נמוך מדי (סיכון לעצב הרדיאלי).'], advice: "הכתף היא הפנים של הפיזיק שלך; אל תהרוס אותה עם הזרקות מוגזמות. השתמש במחטי אינסולין לנפחים קטנים ושמור על האזור נקי כמו חדר ניתוח." },
  { id: 'quad_outer', name: 'ירך חיצונית', category: 'פלג גוף תחתון', view: 'front', needle: '23G - 25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 7, riskLevel: 'Medium', warning: 'הישאר חיצוני! הירך הפנימית מכילה עצבים מרכזיים.', description: 'גישה קלה בזמן ישיבה. עלול לגרום לכאב לאחר הזרקה (PIP).', pathD: '', steps: ['שב וחלק את הירך לשלושה שלישים.', 'כוון לשליש האמצעי-חיצוני.', 'הזרק ב-90 מעלות או בזווית קלה החוצה.', 'לעולם אל תזריק בירך הפנימית.'], advice: "הירך נגישה וקלה, אבל היא בוגדנית. אם תפגע שם בעצב, תצלע במשך ימים. עשה זאת רק כשאתה יציב לחלוטין, והתרחק מוורידים גלויים." },
  { id: 'pecs', name: 'חזה', category: 'פלג גוף עליון', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'למשתמשים מתקדמים בלבד.', description: 'משמש לרוטציה כדי למנוע רקמה צלקתית באתרים אחרים.', pathD: '', steps: ['כווץ את החזה כדי למצוא את מסת השריר.', 'הזרק בחלק החיצוני העבה.', 'הימנע מאזור בית השחי (בלוטות לימפה).', 'הזרקה שטחית יותר מאשר בירך.'], advice: "שריר החזה קרוב ללב ולריאות שלך. אל תיכנס לכאן אלא אם כן את יודע בדיוק מה אתה עושה. הישאר רגוע ואל תדחף את המחט לעומק מוגזם." },
  { id: 'lats', name: 'לת׳ס (גב)', category: 'פלג גוף עליון', view: 'back', needle: '25G (1")', volume: '2.0 - 3.0 ml', recoveryDays: 6, riskLevel: 'Medium', description: 'אתר מעולה לנפח. דורש גמישות מסוימת כדי להגיע.', pathD: '', steps: ['הושט יד לאחור או השתמש במראה.', 'צבוט את השריר אם ניתן כדי לבודד אותו.', 'הזרק בחלק העבה ביותר.', 'הקפד לא להעמיק מדי לכיוון הצלעות.'], advice: "כאן טמון הכוח - שריר שיכול להתמודד עם הרבה. אבל ההגעה אליו דורשת גמישות ויציבות. אם אתה לא יכול להגיע בבירור, בקש עזרה או עזוב את זה לאתר אחר." },
  { id: 'triceps', name: 'תלת-ראשי', category: 'פלג גוף עליון', view: 'back', needle: '27G - 29G (0.5")', volume: '1.0 ml', recoveryDays: 4, riskLevel: 'Medium', description: 'מצוין לנפחים קטנים עם מחטי אינסולין. הימנע מהראש הצידי.', pathD: '', steps: ['כוון לראש האחורי/ארוך של התלת-ראשי.', 'הימנע מהראש החיצוני (עצבים).', 'מושלם להזרקות עם מחט אינסולין.', 'הזרק לאט.'], advice: "שריר קטן ורגיש. היה עדין מאוד והשתמש במחטים הקטנות ביותר. התלת-ראשי לא מתמודד טוב עם שמנים סמיכים או נפחים גדולים; אל תסתכן בנפיחות שהורסת את מראה הזרוע שלך." },
  { id: 'biceps', name: 'דו-ראשי', category: 'פלג גוף עליון', view: 'front', needle: '27G - 30G (0.5")', volume: '1.0 ml', recoveryDays: 5, riskLevel: 'High', warning: 'אזור סכנה! עצבים וכלי דם רבים.', description: 'למומחים בלבד. משמש לעיתים לשיפור מראה האתר.', pathD: '', steps: ['למומחים בלבד: סיכון גבוה לעצבים/וורידים.', 'הזרק בשיא (Peak) של השריר.', 'שאיבה (Aspirate) היא חובה כאן.', 'צפה לסימנים כחולים.'], advice: "הקשב לי היטב: הדו-ראשי עמוס בכלי דם. הזרקה כאן היא רק למי שלוקח סיכונים, ואני לא אוהב לקחת סיכונים עם התלמידים שלי. היה זהיר מאוד והקפד לשאוב (aspirate) בכל פעם." },
  { id: 'traps', name: 'טרפזים', category: 'פלג גוף עליון', view: 'back', needle: '25G (1")', volume: '1.5 - 2.0 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'גישה קלה מאוד ובדרך כלל ללא כאב. נותן מראה בולט.', pathD: '', steps: ['הבט במראה, מצא את משולש הטרפז העליון.', 'הזרק מעט כלפי מטה.', 'התרחק מחוליות הצוואר.', 'טוב להזרקות של 1 מ״ל.'], advice: "הטרפזים נותנים מראה מלכותי, אבל הם קרובים מאוד לעצבי הצוואר ועמוד השדרה. לעולם אל תתקרב לבסיס הצוואר. הישאר במשולש החיצוני." },
  { id: 'calves', name: 'תאומים', category: 'פלג גוף תחתון', view: 'back', needle: '27G (1")', volume: '1.0 ml', recoveryDays: 8, riskLevel: 'High', warning: 'אזהרת PIP קיצונית.', description: 'עלול להקשות על הליכה. מוצא אחרון לרוטציה.', pathD: '', steps: ['צפה לכאב משמעותי לאחר ההזרקה.', 'כוון לשריר התאומים החיצוני.', 'הימנע לחלוטין מאזור אחורי הברך.', 'השתמש במחט דקה מאוד.'], advice: "האופציה של המיואשים! כאב בתאומים יכול למנוע ממך ללכת או להתאמן במשך ימים. חשוב פעמיים לפני שאתה מזריק כאן - האם שאר האזורים באמת מוצו?" },
  { id: 'forearms', name: 'אמות', category: 'פלג גוף עליון', view: 'back', needle: '27G - 30G (0.5")', volume: '0.5 - 1.0 ml', recoveryDays: 4, riskLevel: 'High', warning: 'סיכון גבוה! עצבים וכלי דם צפופים.', description: 'למשתמשים מתקדמים בלבד. משמש בעיקר להזרקות מקומיות קטנות.', pathD: '', steps: ['סיכון גבוה לפגיעה בעצב.', 'השתמש רק במחטי אינסולין קצרות.', 'הזרקות שטחיות/מיקרו בלבד.'], advice: "זהו אזור אסור בבית הספר של מר איקס, למעט צורך קיצוני ביותר. העצבים כאן הם כמו קורי עכביש; טעות אחת יכולה לעלות לך בשליטה ביד. אני לא ממליץ על זה." },
  { id: 'pecs_lower', name: 'חזה תחתון', category: 'פלג גוף עליון', view: 'front', needle: '25G - 27G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', warning: 'הימנע לחלוטין מאזור הפטמה.', description: 'מרחיב את שטח הפנים להזרקה בשרירי החזה.', pathD: '', steps: ['וודא שיש מסת שריר מספקת.', 'שמור מרחק בטוח מהפטמה.', 'הזרק בזווית משתנה.'], advice: "תוספת חכמה לרוטציה, אבל היזהר מלהתקרב לפטמה או לרקמה רגישה. תמיד הישאר במסת השריר המוצקה." },
  { id: 'delt_rear', name: 'כתף אחורית', category: 'פלג גוף עליון', view: 'back', needle: '25G (1")', volume: '1.0 - 1.5 ml', recoveryDays: 5, riskLevel: 'Medium', description: 'טוב לרוטציה. שריר קטן, זהירות מעצבים.', pathD: '', painLevel: 'בינוני (4/10)', bestFor: 'רוטציה, נפח קטן', steps: ['מצא את הראש האחורי של הכתף.', 'הזרק למרכז השריר.', 'הימנע מאזור בית השחי.', 'השתמש במחטים קטנות אם אפשר.'], advice: "שריר קטן אך מצוין להזרקות קלות. רק וודא שאתה לא מפעיל לחץ על מפרקי הכתף. רוגע ויציבות הם הסוד כאן." }
];

const labTestsHe: LabTest[] = [
  { id: 'test_total', name: 'טסטוסטרון כללי', category: 'hormones', range: '264 - 916', unit: 'ng/dL', min: 264, max: 916, description: 'טסטוסטרון כללי במחזור הדם.', elevationMeaning: 'צפוי בסייקל. מעל 1500 אומר שהחומרים אמיתיים.', lowMeaning: 'היפוגונדיזם, דיכאון, איבוד שריר.', management: 'גבוה: טוב בסייקל. נמוך: התחל PCT.' },
  { id: 'e2', name: 'אסטרדיול (E2)', category: 'hormones', range: '7.6 - 42.6', unit: 'pg/mL', min: 7.6, max: 42.6, description: 'אסטרוגן המומר מטסטוסטרון.', elevationMeaning: 'סיכון לג׳ינו, אגירת נוזלים, לחץ דם גבוה.', lowMeaning: 'כאבי מפרקים, בעיות זקפה, עור יבש.', management: 'גבוה: קח AI (ארימידקס). נמוך: הפסק AI.' },
  { id: 'progesterone', name: 'פרוגסטרון', category: 'hormones', range: '< 1.0', unit: 'ng/mL', min: 0, max: 1.0, description: 'חשוב למשתמשי דקה/טרן.', elevationMeaning: 'סיכון לג׳ינו.', lowMeaning: 'לא רלוונטי לגברים.', management: 'הימנע מ-19-Nor אם רגיש.' },
  { id: 'dht', name: 'DHT', category: 'hormones', range: '30 - 85', unit: 'ng/dL', min: 30, max: 85, description: 'דיהידרו-טסטוסטרון.', elevationMeaning: 'נשירת שיער.', lowMeaning: 'חשק מיני ירוד.', management: 'פינסטריד במידת הצורך.' },
  { id: 'igf1', name: 'IGF-1', category: 'hormones', range: '115 - 307', unit: 'ng/mL', min: 115, max: 307, description: 'פקטור גדילה.', elevationMeaning: 'גדילה משמעותית.', lowMeaning: 'התאוששות איטית.', management: 'מפתח להיפרטרופיה.' },
  { id: 'cortisol', name: 'קורטיזול (AM)', category: 'hormones', range: '6.2 - 19.4', unit: 'ug/dL', min: 6.2, max: 19.4, description: 'הורמון הלחץ.', elevationMeaning: 'פירוק שריר.', lowMeaning: 'עייפות אדרנל.', management: 'שינה, אשווגנדה.' },
  { id: 'dhea', name: 'DHEA-S', category: 'hormones', range: '80 - 560', unit: 'ug/dL', min: 80, max: 560, description: 'מקדים אנדרוגן.', elevationMeaning: 'עור שומני.', lowMeaning: 'אנרגיה נמוכה.', management: 'תוסף DHEA.' },
  { id: 'alt', name: 'ALT (SGPT)', category: 'organs', range: '7 - 56', unit: 'U/L', min: 7, max: 56, description: 'אנזים כבד.', elevationMeaning: 'לחץ על הכבד (נפוץ עם כדורים).', lowMeaning: 'לא מדאיג.', management: 'הפסק כדורים, הוסף TUDCA/NAC.' },
  { id: 'ast', name: 'AST (SGOT)', category: 'organs', range: '8 - 48', unit: 'U/L', min: 8, max: 48, description: 'אנזים כבד ושריר.', elevationMeaning: 'לחץ על הכבד או נזק מאימון קשה.', lowMeaning: 'לא מדאיג.', management: 'בדוק ALT לאישור מצב הכבד.' },
  { id: 'creatinine', name: 'קריאטינין', category: 'organs', range: '0.74 - 1.35', unit: 'mg/dL', min: 0.74, max: 1.35, description: 'מדד לתפקוד כליות.', elevationMeaning: 'לחץ על הכליות, התייבשות, או מסת שריר גבוהה.', lowMeaning: 'מסת שריר נמוכה.', management: 'שתה מים (4 ליטר+). עקוב אחר לחץ דם.' },
  { id: 'hdl', name: 'HDL כולסטרול', category: 'blood', range: '> 40', unit: 'mg/dL', min: 40, max: 100, description: 'כולסטרול טוב.', elevationMeaning: 'מגן על הלב.', lowMeaning: 'סכנה. נפוץ מאוד בסייקל.', management: 'שמן דגים 4 גרם, אירובי, ניאצין.' },
  { id: 'hematocrit', name: 'המטוקריט', category: 'blood', range: '38.3 - 48.6', unit: '%', min: 38.3, max: 52, description: 'צמיגות הדם.', elevationMeaning: 'דם סמיך = סיכון לקרישים.', lowMeaning: 'אנמיה.', management: 'תרום דם אם מעל 52%.' },
  { id: 'fsh', name: 'FSH', category: 'hormones', range: '1.5 - 12.4', unit: 'mIU/mL', min: 1.5, max: 12.4, description: 'הורמון מעורר זקיק. שולט בייצור זרע.', elevationMeaning: 'כשל אשכים ראשוני.', lowMeaning: 'דיכוי (Shutdown). צפוי במהלך סייקל.', management: 'צפוי בסייקל. התאוששות במהלך PCT.' },
  { id: 'lh', name: 'LH', category: 'hormones', range: '1.7 - 8.6', unit: 'mIU/mL', min: 1.7, max: 8.6, description: 'הורמון מחלט. מאותת לאשכים לייצר טסטוסטרון.', elevationMeaning: 'נזק לאשכים.', lowMeaning: 'דיכוי (Shutdown). צפוי לחלוטין בסייקל.', management: 'דורש HCG או פרוטוקול PCT לאחר הסייקל.' },
  { id: 'prolactin', name: 'פרולקטין', category: 'hormones', range: '4.0 - 15.2', unit: 'ng/mL', min: 4, max: 15.2, description: 'הורמון מתח/יותרת המוח.', elevationMeaning: 'סיכון לג׳ינו, ליבידו נמוך. נפוץ עם טרן/דקה.', lowMeaning: 'נדיר ולא מדאיג.', management: 'אם גבוה: השתמש ב-P5P או קברגולין.' },
  { id: 'shbg', name: 'SHBG', category: 'hormones', range: '16.5 - 55.9', unit: 'nmol/L', min: 16.5, max: 55.9, description: 'חלבון קושר הורמוני מין.', elevationMeaning: 'מוריד טסטוסטרון חופשי.', lowMeaning: 'טסטוסטרון חופשי גבוה (צפוי עם כדורים).', management: 'כדורים בדרך כלל מרסקים SHBG.' },
  { id: 'test_free', name: 'טסטוסטרון חופשי', category: 'hormones', range: '9.3 - 26.5', unit: 'pg/mL', min: 9.3, max: 26.5, description: 'הטסטוסטרון הפעיל באמת.', elevationMeaning: 'צפוי בסייקל. אנבוליזם גבוה.', lowMeaning: 'איבוד כוח ואנרגיה.', management: 'כדאי לעקוב יחד עם טסטוסטרון כללי.' },
  { id: 'ldl', name: 'LDL כולסטרול', category: 'blood', range: '< 100', unit: 'mg/dL', min: 0, max: 100, description: 'כולסטרול רע.', elevationMeaning: 'סיכון להצטברות פלאק בעורקים.', lowMeaning: 'נדיר שזו בעיה.', management: 'אירובי, שומנים בריאים, סיבים.' },
  { id: 'triglycerides', name: 'טריגליצרידים', category: 'blood', range: '< 150', unit: 'mg/dL', min: 0, max: 150, description: 'שומנים בדם.', elevationMeaning: 'סיכון למחלות לב.', lowMeaning: 'פעילות גבוהה/תזונה.', management: 'אומגה 3 ובקרת תזונה.' },
  { id: 'rbc', name: 'RBC (תאי דם אדומים)', category: 'blood', range: '4.14 - 5.80', unit: 'x10^6/uL', min: 4.14, max: 5.8, description: 'ספירת תאי דם אדומים.', elevationMeaning: 'דם סמיך (אריתרוציטוזיס).', lowMeaning: 'אנמיה.', management: 'עקוב יחד עם המטוקריט.' },
  { id: 'hgb', name: 'המוגלובין', category: 'blood', range: '13.0 - 17.7', unit: 'g/dL', min: 13, max: 17.7, description: 'חלבון נושא חמצן.', elevationMeaning: 'דם סמיך.', lowMeaning: 'אנמיה.', management: 'עקוב במיוחד בשימוש בבולדנון (EQ).' },
  { id: 'wbc', name: 'WBC (תאי דם לבנים)', category: 'blood', range: '3.4 - 10.8', unit: 'x10^3/uL', min: 3.4, max: 10.8, description: 'ספירת תאי דם לבנים (מערכת חיסון).', elevationMeaning: 'זיהום או דלקת.', lowMeaning: 'מערכת חיסון חלשה.', management: 'אימון עשוי לגרום לעליות זמניות.' },
  { id: 'bun', name: 'BUN (אוריאה)', category: 'organs', range: '6 - 20', unit: 'mg/dL', min: 6, max: 20, description: 'פסולת מטבוליזם של חלבון.', elevationMeaning: 'תזונה עשירה בחלבון או עומס על הכליות.', lowMeaning: 'צריכת חלבון נמוכה.', management: 'נפוץ בקרב מפתחי גוף.' },
  { id: 'bilirubin', name: 'בילירובין כללי', category: 'organs', range: '0.0 - 1.2', unit: 'mg/dL', min: 0, max: 1.2, description: 'מדד לתפקוד כבד ומררה.', elevationMeaning: 'בעיות בדרכי המרה או נזק לכבד.', lowMeaning: 'לא מדאיג.', management: 'עקוב אחר תסמיני צהבת.' },
  { id: 'alp', name: 'פוספטאזה בסיסית', category: 'organs', range: '44 - 147', unit: 'U/L', min: 44, max: 147, description: 'אנזים כבד ועצם.', elevationMeaning: 'חסימת מרה או עומס כבדי.', lowMeaning: 'נדיר.', management: 'בדוק יחד עם ALT/AST.' },
  { id: 'vit_d', name: 'ויטמין D', category: 'vitamins', range: '30 - 100', unit: 'ng/mL', min: 30, max: 100, description: 'חיוני לייצור טסטוסטרון.', elevationMeaning: 'סיכון לרעילות (נדיר).', lowMeaning: 'טסטוסטרון נמוך, מערכת חיסון חלשה.', management: 'תיסוף של 5000 IU ביום.' },
  { id: 'vit_b12', name: 'ויטמין B12', category: 'vitamins', range: '232 - 1245', unit: 'pg/mL', min: 232, max: 1245, description: 'אנרגיה ובריאות עצבית.', elevationMeaning: 'נדיר שזו בעיה.', lowMeaning: 'נזק עצבי, עייפות.', management: 'תיסוף מתיל-קובלמין.' },
  { id: 'zinc', name: 'אבץ', category: 'minerals', range: '60 - 120', unit: 'ug/dL', min: 60, max: 120, description: 'מינרל תומך טסטוסטרון.', elevationMeaning: 'סיכון למחסור בנחושת.', lowMeaning: 'טסטוסטרון נמוך, חסינות נמוכה.', management: 'מكمل ZMA או אבץ פיקולינאט.' },
  { id: 'magnesium', name: 'מגנזיום', category: 'minerals', range: '1.6 - 2.3', unit: 'mg/dL', min: 1.6, max: 2.3, description: 'תפקוד שרירים ועצבים.', elevationMeaning: 'בעיות בכליות.', lowMeaning: 'התכווצויות, חרדה, שינה גרועה.', management: 'קח מגנזיום גליצינאט.' },
  { id: 'tsh', name: 'TSH', category: 'thyroid', range: '0.450 - 4.500', unit: 'uIU/mL', min: 0.45, max: 4.5, description: 'הורמון מעורר בלוטת התריס.', elevationMeaning: 'תת-פעילות בלוטת התריס (מטבוליזם איטי).', lowMeaning: 'פעילות יתר (עשוי להיות נמוך בנטילת T3).', management: 'בריאות הבלוטה היא מפתח לאיבוד שומן.' },
  { id: 'free_t3', name: 'T3 חופשי', category: 'thyroid', range: '2.0 - 4.4', unit: 'pg/mL', min: 2, max: 4.4, description: 'הורמון בלוטת תריס פעיל (מטבוליזם).', elevationMeaning: 'מטבוליזם מהיר.', lowMeaning: 'השבתה מטבולית (נפוץ עם טרן).', management: 'עקוב בשימוש בטרן או T3.' },
  { id: 'free_t4', name: 'T4 חופשי', category: 'thyroid', range: '0.82 - 1.77', unit: 'ng/dL', min: 0.82, max: 1.77, description: 'הורמון מקדים לבלוטת התריס.', elevationMeaning: 'פעילות יתר של הבלוטה.', lowMeaning: 'תת-פעילות של הבלוטה.', management: 'מדד הייצור העיקרי של הבלוטה.' }
];

export const enContent: ContentStrings = {
  navAiTools: "Bodybuilder's Ai Tools",
  navPremiumResources: "Premium Resources",
  navFeatures: "Features",
  navToolNames: {
    macro: "Macro Calculator",
    injection: "Injection Map",
    halflife: "Half-Life Plotter",
    lab: "Smart Lab Reference",
    genetic: "Genetic Potential",
    cycleArchitect: "Cycle Calendar Exporter",
  },
  themeNames: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  backToHome: "Back to Home",
  seoTitle: "Mr. X-Steroid | The Ultimate Bodybuilding & Steroid Guide",
  seoDescription: "Discover the ultimate scientific guide to muscle building and anabolic cycles. Mr. X-Steroid by George Mourice offers bulking/cutting plans, safety protocols, and a comprehensive supplement guide.",
  seoKeywords: seoKeywordsEnglish,

  heroTitle: "Mr. X-Steroid",
  heroSubtitle: "Discover the ultimate muscle-building guide and hormonal cycle handbook: A comprehensive scientific approach backed by detailed charts and easy-to-understand tables. Unlock the secrets of anabolic hormones with practical, clear plans to help you achieve immense strength and a sculpted, powerful physique.",
  heroCta: "Get Your Copy Now",
  downloadPreview: "Download Free Preview (PDF)",
  audioPreviewBtn: "Listen to Intro",
  authorSection: "About the Author",
  authorName: "George Mourice",
  authorBio: "Author and cover designer, George presents a guide that isn't just information—it's armor. This book is a message to every coach and athlete who believes that knowledge and science are the foundation of excellence.",
  featuresTitle: "What's Inside?",
  sneakPeekTitle: "Exclusive Sneak Peek",
  sneakPeekSubtitle: "See what professional cycle charts look like. Part 1 is available; the rest is encrypted to protect the content.",
  unlockText: "Buy Book to Unlock Full Dosages",
  buyNow: "Buy Now",
  contact: "Contact Us",
  copyright: "All Rights Reserved © 2025 George Mourice",
  features: [
    {
      title: "Comprehensive Hormone Charts: Zero to Hero",
      description: "No more guessing or relying on 'bro-science'. The book provides precise, scientifically structured cycle charts, taking you safely from beginner to advanced levels. Clear Bulking plans for massive mass and Cutting plans for shredded definition, all with exact dosages and timing.",
      iconKey: "chart"
    },
    {
      title: "The Art of 'Safe Exit': Strict PCT Protocols",
      description: "Starting a cycle is easy; exiting safely is the art. The book details how to protect your hormonal system and rapidly restore natural testosterone production to avoid muscle crash and depression. Proven PCT plans with meds and dosages.",
      iconKey: "exit"
    },
    {
      title: "Supplement Guide: The Truth, No Marketing",
      description: "Save your money. Stop buying useless powders. This guide reveals which supplements actually work (like Creatine, Whey, Essentials) and exposes the commercial scams draining your wallet.",
      iconKey: "shield"
    }
  ],
  testimonials: [
    { name: "Ahmed S.", title: "Amateur Bodybuilder", text: "I was lost in conflicting internet info. This book put me on the right track and saved me years of trial and error." },
    { name: "Mohamed A.", title: "Personal Trainer", text: "An indispensable reference for any coach who wants to be honest with clients and protect their health." },
    { name: "Karim M.", title: "Local Champion", text: "The charts in this book are incredibly precise and helped me reach the best shape of my life." }
  ],
  testimonialsTitle: "What Readers Say",
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Direct answers to common queries",
  faqSearchPlaceholder: "Search questions...",
  faqCategories: { all: "All", safety: "Safety", general: "General", legal: "Legal", women: "Women", strategy: "Strategy" },
  faqs: [
    { question: "Is this book suitable for total beginners?", answer: "Yes, it starts from the basics, explaining medical and gym terms in simple language before diving into complex charts.", category: "general" },
    { question: "Does it include nutrition plans?", answer: "Yes, while focused on hormones, it includes a full chapter on proper nutrition during a cycle, counting calories, and macros.", category: "strategy" },
    { question: "How do I get the book after payment?", answer: "Once payment is complete, a direct PDF download link will be emailed to you immediately.", category: "general" },
    { question: "What makes 'Mr. X-Steroid' different from other bodybuilding guides?", answer: "Most guides are filled with boring medical jargon. We’ve revolutionized the game by condensing complex science into easy-to-read, actionable tables. Whether you are a beginner or an advanced athlete, you get a clear, visual roadmap to your dream physique without the headache.", category: "general" },
    { question: "Is this book suitable for beginners?", answer: "Absolutely! 💯 We start from ground zero. You don’t need a medical degree to understand our cycles. We guide you step-by-step, explaining the 'What, Why, and How' of every substance, ensuring you never feel lost.", category: "general" },
    { question: "Will this really help me break through my plateau?", answer: "Yes. If your gains have stalled, it’s likely a strategy issue. 'Mr. X-Steroid' provides advanced stacking techniques and cycle adjustments that shock the muscles back into growth mode. Say goodbye to stagnation! 🚀", category: "general" },
    { question: "How do I ensure I stay healthy while on a cycle?", answer: "Safety is our obsession. 🛡️ We provide comprehensive guides on harm reduction, including how to read your body’s signals and the absolute necessity of blood work. We teach you how to mitigate risks, not ignore them.", category: "safety" },
    { question: "What about side effects? Can I avoid them?", answer: "While no cycle is risk-free, knowledge is your best defense. We dedicate entire sections to managing estrogen levels, liver protection, and hair loss prevention. We give you the protocols to minimize side effects and keep your system running smoothly.", category: "safety" },
    { question: "Do you cover Post-Cycle Therapy (PCT)?", answer: "A cycle isn't finished until the PCT is done. 🔄 We don’t just leave you hanging; we provide detailed PCT protocols to help restore your natural testosterone production and keep the muscle you worked so hard to build.", category: "safety" },
    { question: "Is 'Mr. X-Steroid' encouraging illegal activity?", answer: "No. 🚫 This material is strictly for informational, educational, and harm-reduction purposes only. We believe that if adults choose to use these substances, they should have access to accurate, scientific data to avoid dangerous mistakes.", category: "legal" },
    { question: "Can I get in trouble for owning this book?", answer: "Absolutely not. Possessing knowledge is a fundamental right. 📚 You are simply purchasing a comprehensive educational resource. However, the purchase and use of anabolic substances are subject to local laws, which we advise you to respect.", category: "legal" },
    { question: "Are you selling steroids on this site?", answer: "Never. We sell expertise, strategy, and information. We do not sell, distribute, or condone the sale of controlled substances. We are your coaches, not your dealers.", category: "legal" },
    { question: "Will using these strategies make me look like a man?", answer: "Not with our guidance! 🙅‍♀️ The 'bulky' look often comes from using the wrong compounds or dosages. Our 'Women’s Zone' focuses on safe, female-friendly cycles designed for toning, fat loss, and lean muscle—preserving your femininity while boosting your strength.", category: "women" },
    { question: "Which compounds are safe for women?", answer: "We specifically highlight compounds with low androgenic ratings (like Anavar or Primobolan) that are popular among female fitness models. We tell you exactly what to avoid to prevent virilization symptoms.", category: "women" },
    { question: "Can women follow the same cycles as men?", answer: "Definitely not! Female physiology is unique. We provide tailored charts specifically for women, adjusting dosages and cycle lengths to ensure results without compromising hormonal balance. 🌸", category: "women" },
    { question: "Bulking vs. Cutting: Does the book cover both?", answer: "Yes, we cover the full spectrum! 📉📈 Whether you want to pack on mass in the off-season or get shredded for the summer, we have specific 'Cycle Blueprints' for every goal. You just pick your target, and we show you the path.", category: "strategy" },
    { question: "How do I know which stack is right for me?", answer: "We categorize stacks by experience level (Beginner, Intermediate, Pro). You won’t accidentally start a pro-level cycle on day one. We help you graduate through the levels logically to maximize gains and minimize shock.", category: "strategy" },
    { question: "What is the 'Smart Cycle' approach?", answer: "It’s about timing and synergy. ⏱️ We teach you how to synchronize your training intensity and nutrition with your cycle’s peak weeks. It’s not just about taking something; it’s about aligning your entire lifestyle for the 'X-Steroid' effect.", category: "strategy" }
  ],
  privacyPolicy: "Privacy Policy",
  termsOfService: "Terms of Service",
  refundPolicy: "Refund Policy",
  legalDisclaimer: "Legal Disclaimer",
  aboutUs: "About Us",
  legal: "Legal",
  quickLinks: "Quick Links",
  privacyPolicyContent: "We respect your privacy and are committed to protecting your personal data...",
  termsOfServiceContent: "By using this website, you agree to the following terms...",
  refundPolicyContent: "Due to the nature of digital products, refunds are not available once the file is downloaded...",
  pricingTitle: "Choose Your Plan",
  pricingSubtitle: "A small investment in your health and knowledge will save you thousands of dollars and endless health risks.",
  pricingTiers: [
    { name: "Pro Bundle", price: "$49.99", originalPrice: "$79.99", description: "Full Book + Exclusive Tools", features: ["Full Book (300+ Pages)", "Dosage Calculator Excel", "Access to Private Community", "Bonus Supplement Guide"], buttonText: "Best Seller", isPopular: true, popularLabel: "Best Value" },
    { name: "Coaching Package", price: "$199.99", description: "Personal Training + Book", features: ["All Pro Features", "Online Consultation (30 min)", "Custom Cycle Design", "1 Month Follow-up"], buttonText: "Start Transformation" }
  ],
  disclaimerTitle: "Important Warning & Disclaimer",
  disclaimerContent: fullEnglishDisclaimer,
  agreeButton: "I agree & I take full responsibility and I am over 18+",
  disclaimerAcknowledgement: "By clicking the button below, you acknowledge that you have read, understood, and agreed to all terms listed above.",
  importantDisclaimer: "Important Warning",
  downloadFullBook: "Download Full Book",
  processing: "Processing...",
  purchaseSuccess: "Purchase successful! You can now access all premium features.",
  loginTitle: "Login",
  signupTitle: "Sign Up",
  emailLabel: "Email Address",
  passwordLabel: "Password",
  nameLabel: "Full Name",
  loginBtn: "Log In",
  signupBtn: "Create Account",
  noAccount: "Don't have an account?",
  haveAccount: "Already have an account?",
  invalidCredentials: "Invalid email or password",
  signupSuccess: "Account created! Please check your email for verification.",
  logout: "Logout",
  welcomeUser: "Welcome",
  loginWithGoogle: "Login with Google",
  loginWithMicrosoft: "Login with Microsoft",
  orDivider: "OR",
  benefitsTitle: "Why is \"Mr. X-Steroid\" Your Best Investment?",
  benefitsSubtitle: "We don't just sell pages; we sell you years of distilled experience and science to shortcut your path to the top.",
  benefits: [
    { title: "Maximum ROI: Stop Guessing, Start Growing 💰", description: "Time is muscle. Instead of wasting years on trial and error or burning cash on hyped-up supplements that don't work, get the exact formula. We provide over 100+ proven cycle tables that act as a direct blueprint to your dream physique. You aren't just buying a book; you're buying years of progress in a few pages.", iconKey: "roi" },
    { title: "Medical-Grade Safety & Harm Reduction 🛡️", description: "Your health is priceless. We go beyond basic advice with our exclusive 'Safe Injection Map' and professional medical protocols. Learn to manage side effects, interpret blood work, and execute Post-Cycle Therapy (PCT) like a pro. We teach you how to push limits without crossing the line into danger.", iconKey: "safety" },
    { title: "0% Bro-Science, 100% Unbiased Truth 🧪", description: "We are not sponsored by supplement companies. This is unfiltered, raw data. We strip away the marketing lies to give you the naked scientific facts and historical strategies used by champions. If it doesn't work, it’s not in this book.", iconKey: "truth" },
    { title: "Complex Science, Simplified Visually 🚀", description: "No PhD? No problem. We’ve decoded complex endocrinology into visual, easy-to-follow charts. Whether you are planning a bulk or a cut, our unique 'Table System' lets you visualize your entire cycle at a glance. It’s the sophistication of a medical text with the simplicity of a user manual.", iconKey: "simplified" },
    { title: "The 'Smart Cycle' Advantage 🧠", description: "Don't just train hard; train smart. Our 'Smart Cycle Synchronizer' methodology ensures your nutrition and training intensity peak exactly when your hormones do. This strategic alignment is the secret difference between 'good results' and 'legendary transformation.'", iconKey: "smart" }
  ],
  labReference: {
    title: "Smart Lab Reference",
    subtitle: "Understand your bloodwork yourself. This guide helps you read lab results and identify danger signs.",
    searchPlaceholder: "Search test name (e.g., Test, ALT)...",
    noResults: "No results found",
    analyzeBtn: "Analyze Result",
    analyzeTitle: "Enter Your Value",
    enterValue: "Value",
    resultLabel: "Status",
    status: { low: "Low", normal: "Normal", high: "High" },
    categories: { all: "All", hormones: "Hormones", organs: "Organs", blood: "Blood & Heart", vitamins: "Vitamins", minerals: "Minerals", thyroid: "Thyroid" },
    labels: { whatIsIt: "What is it?", normalRange: "Normal Range", elevationMeaning: "High Meaning", lowMeaning: "Low Meaning", management: "Management", cancel: "Cancel", high: "High", low: "Low" },
    tests: labTestsEn,
  },
  whoIsTitle: "Who is this book for?",
  whoIsSubtitle: "This content is carefully designed to serve specific groups effectively",
  targetAudiences: [
    { title: "Aspiring Bodybuilder", description: "Who wants to shortcut the path and build a perfect physique on scientific grounds.", iconKey: "athlete" },
    { title: "Professional Coach", description: "Looking for a reliable scientific reference to design client programs.", iconKey: "coach" },
    { title: "Truth Seeker", description: "Tired of misinformation and myths spreading in the gym.", iconKey: "truth" },
    { title: "Health Conscious", description: "Who wants to understand hormonal impact and how to prevent damage.", iconKey: "shield" }
  ],
  whoIsClosing: "If you are one of these, this book is your smartest investment.",
  whoIsCta: "Start Your Journey",
  checkoutTitle: "Secure Checkout",
  billingDetails: "Billing Details",
  fullName: "Full Name",
  emailAddress: "Email Address",
  paymentMethod: "Payment Method",
  creditCard: "Credit Card",
  cardNumber: "Card Number",
  expiryDate: "Expiry Date",
  cvc: "CVC",
  payNow: "Pay Now",
  cancel: "Cancel",
  orderSummary: "Order Summary",
  total: "Total",
  secureCheckout: "100% Secure & Encrypted via Stripe",
  aboutPageTitle: "About Mr. X-Steroid",
  aboutPageContent: "The Mr. X-Steroid project is the fruit of years of research...",
  aboutPageStoryTitle: "Our Story",
  aboutPageStory: "We started as a small blog...",
  aboutPageMissionTitle: "Our Mission",
  aboutPageMission: "Spreading science and fighting hormonal ignorance...",
  contactPageTitle: "Contact Us",
  contactPageSubtitle: "We are here to help and answer your queries",
  contactFormNamePlaceholder: "Your Name",
  contactFormEmailPlaceholder: "Your Email",
  contactFormMessagePlaceholder: "How can we help?",
  contactFormSubjectPlaceholder: "Subject",
  contactFormSubmit: "Send Message",
  contactFormSuccessMessage: "Message sent successfully! We'll reply soon.",
  contactInfoAddress: "Dubai, UAE",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 50 123 4567",
  contactInfoHours: "Mon-Fri, 9am - 5pm",
  homeLink: "Home",
  viewOnMap: "Location",
  cookieTitle: "Cookies",
  cookieMessage: "We use cookies to improve experience.",
  cookieAccept: "Accept",
  cookieReject: "Reject",
  calcTitle: "Macro & Calorie Calculator",
  calcSubtitle: "Define your nutritional needs with scientific precision",
  calcGender: "Gender",
  calcMale: "Male",
  calcFemale: "Female",
  calcAge: "Age",
  calcWeight: "Weight (kg)",
  calcHeight: "Height (cm)",
  calcActivity: "Activity Level",
  calcTrainingStyle: "Training Style",
  calcGoal: "Goal",
  calcCalculate: "Calculate Now",
  calcResults: "Your Daily Results",
  calcCalories: "Calories",
  calcProtein: "Protein",
  calcCarbs: "Carbs",
  calcFats: "Fats",
  calcCta: "Generate Meal Plan",
  calcSmartMode: "Smart Mode",
  calcBodyFat: "Body Fat %",
  calcWater: "Water Need",
  calcLiters: "L",
  calcRecalculate: "Recalculate",
  calcGenerateMealPlan: "Generate AI Meal Plan",
  calcGenerating: "Generating...",
  calcMealPlanTitle: "Your Suggested Meal Plan",
  calcMealPlanSubtitle: "Generated by AI based on your macros",
  calcDisclaimer: "These figures are estimates based on formulas. Consult a nutritionist.",
  calcTdeeLabel: "Total Daily Energy Expenditure (TDEE)",
  calcBmrLabel: "Basal Metabolic Rate (BMR)",
  calcTefLabel: "Thermic Effect of Food (TEF)",
  calcBeastTitle: "Dormant Beast Classification",
  calcAnalysisLabel: "SMART ENGINE ANALYSIS",
  calcBmiStatusLabel: "BMI Status",

  calcShuffleLabel: "Shuffle Meals",
  calcAwaitingInputLabel: "Awaiting Muscle Input",
  calcAiEngineLabel: "AI POWERED ENGINE",
  calcAnalyzingLabel: "Analyzing Data...",
  calcMetabolicActiveLabel: "Metabolic Drive Active",
  calcAnabolicPotentialLabel: "EXPECTED ANABOLIC POTENTIAL",
  calcWindowBtn: "Metabolic Window Insight",
  calcTrainingTime: "Preferred Training Time",
  calcTrainingWindows: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    advice: "Since you train in the {time}, focus 40% of your carbs around the workout window."
  },
  calcPredictionTitle: "12-Week Body Prediction",
  calcBeastNames: {
    cut: "Shredded Beast",
    maintain: "Hybrid Warrior",
    bulk: "Anabolic Titan"
  },
  calcPredictions: {
    cut: "Your muscles will look sharp, with stubborn fat around the waist disappearing. You'll see details you've never seen before.",
    maintain: "Significant improvement in muscle density while maintaining low body fat. A powerful and symmetrical athletic physique.",
    bulk: "Massive increase in muscle mass and strength. You'll look bigger in clothes with obvious muscle fullness in shoulders and chest."
  },
  calcSelectGoal: { cut: "Cutting (Fat Loss)", maintain: "Maintenance", bulk: "Bulking (Muscle Gain)" },
  calcMealNames: ["Breakfast", "Lunch", "Pre-Workout", "Dinner"],
  calcActivityLevels: { sedentary: "Sedentary (No exercise)", light: "Light (1-3 days/week)", moderate: "Moderate (3-5 days/week)", active: "Active (6-7 days/week)", veryActive: "Very Active (2x daily)" },
  calcTrainingStyles: { hypertrophy: "Hypertrophy", strength: "Strength", endurance: "Endurance" },
  geneticCalculator: {
    title: "Genetic Potential Calculator",
    subtitle: "Discover your natural maximum muscular potential based on the Casey Butt model.",
    labels: {
      height: "Height (cm)",
      wrist: "Wrist Girth (cm)",
      ankle: "Ankle Girth (cm)",
      bodyFat: "Target Body Fat (%)",
      frameSize: "Frame Size",
      boneThickness: "Bone thickness",
      lowerBody: "Lower body structure",
      shoulders: "Shoulder Girth (cm)",
      chest: "Chest Girth (cm)",
      waist: "Waist (cm)",
      thigh: "Thigh Girth (cm)",
      calf: "Calf Girth (cm)",
      current: "Current",
      potential: "Potential",
      analysis: "Casey Butt Analysis",
      roadmap: "Muscular Roadmap",
      ffmi: "Fat Free Mass Index (FFMI)",
      goldenRatio: "Golden Ratio",
      physiqueScore: "Physique Score"
    },
    modelLabel: "Based on Casey Butt Model",
    awaitingDataTitle: "Awaiting Data...",
    frameOptions: { small: "Small", medium: "Medium", large: "Large" },
    unknownMeasurements: "Don't know measurements? Estimate",
    cta: "Analyze Potential",
    reset: "Reset",
    yourBodyType: "Your Body Type",
    resultTitle: "Muscular Potential Analysis",
    naturalLabel: "Max Natural Weight",
    enhancedLabel: "Max Enhanced Weight",
    differenceLabel: "Expected Difference",
    disclaimer: "These calculations are estimates based on statistical models. Individual genetics play a huge role.",
    unlockMsg: "To reach this level, you need the right knowledge.",
    errorMsg: "Please ensure all fields are filled correctly.",
    bodyTypes: {
      ecto: "Ectomorph",
      meso: "Mesomorph",
      endo: "Endomorph"
    }
  },
  halfLifeVisualizer: {
    title: "Half-Life Plotter",
    subtitle: "Visualize hormone accumulation and avoid instability.",
    compoundLabel: "Compound",
    dosageLabel: "Dosage (mg)",
    durationLabel: "Duration (weeks)",
    frequencyLabel: "Frequency",
    yAxis: "Blood Level",
    xAxis: "Days",
    pctZone: "PCT Safe Zone",
    pctStartMsg: "Start PCT Here",
    peakLevelMsg: "Peak Level",
    addToStackBtn: "Add to Stack",
    activeStackTitle: "Active Compounds",
    serumTitle: "Serum Concentration",
    peakLabel: "Peak",
    emptyStackMsg: "Add compounds to visualize the cycle",
    compounds: commonCompounds,
    frequencies: { ed: "Every Day (ED)", eod: "Every Other Day (EOD)", e3d: "Every 3 Days (E3D)", e7d: "Weekly (E7D)" },
    tooltipDay: "Day",
    tooltipLevel: "Level",
    tooltipPctReady: "PCT Ready",
    tooltipWait: "Wait",
    tooltipInject: "Injection",
    analysis: {
      title: "Cycle Analysis",
      prosTitle: "Expected Benefits",
      consTitle: "Potential Risks",
      adviceTitle: "Mr. X's Verdict",
      pros: ["Stable blood levels", "Convenient injection frequency", "Lower risk of acute side effects"],
      cons: ["Slow saturation", "Long clearance time", "Requires careful PCT planning"],
      advice: "This chart visualizes how compounds accumulate in your blood. Stability is key to avoiding side effects. Note when PCT starts."
    }
  },
  timeUnits: {
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs"
  },
  offerExpired: "Offer Expired!",
  heroEditions: {
    ar: "نسخة عربية",
    en: "English Edition",
    he: "English Edition",
    fr: "English Edition",
    es: "English Edition",
    de: "English Edition",
    it: "English Edition",
    ru: "English Edition",
    tr: "English Edition",
    pt: "English Edition",
    fa: "English Edition",
    ur: "English Edition"
  },
  injectionMap: {
    labels: {
      left: "Left",
      right: "Right",
      days: "Days",
      injectionSteps: "Injection Steps",
      selectPoint: "Select Injection Point",
      efficiency: "Absorption Efficiency",
      recovery: "Recovery Time",
      bestFor: "Best For",
      painLevel: "Pain Level"
    },
    featureCards: {
      power: { title: "Power Explosion", desc: "Within minutes, the compound begins circulating to maximize protein synthesis." },
      tissue: { title: "Tissue Building", desc: "Muscle fibers begin nitrogen retention, drastically accelerating recovery." },
      burn: { title: "Burn & Define", desc: "Metabolism spikes, resulting in a drier, more defined and vascular physique." }
    },
    title: "Safe Injection Map",
    subtitle: "Interactive guide for IM injection sites, risks, and tools.",
    viewFront: "Front View",
    viewBack: "Back View",
    needleSizeLabel: "Needle Size",
    maxVolumeLabel: "Max Volume",
    painLevelLabel: "Pain Level",
    riskLevelLabel: "Risk Level",
    recoveryLabel: "Recovery Time",
    lastInjectedLabel: "Last Injected",
    logInjectionBtn: "Log Injection",
    suggestBtn: "Suggest Site",
    suggesting: "Suggesting...",
    status: { ready: "Ready", recovering: "Recovering", warning: "Avoid" },
    riskLevel: "Risk Level",
    tapToExplore: "Tap any muscle for details",
    interactiveMapLabel: "Interactive 3D Map",
    medicalInsightLabel: "Medical Insight",
    riskLevels: {
      low: "Low",
      high: "High"
    },
    goldenHourTitle: "Post-Injection (The Golden Hour)",
    goldenHourDesc: "Transformation begins immediately! The compound flows to reshape your tissues, instantly boosting protein synthesis, turning your next workout into an explosion of power.",
    goldenAdvice: "Rotation is key. Don't exhaust one muscle; make your body a balanced map of growth.",
    rotationTrackerTitle: "Smart Rotation Tracker",
    cumulativeGrowthLabel: "Cumulative Growth",
    efficiencyLabel: "Absorption Efficiency",
    stimulatedCellsLabel: "Stimulated Cells",
    rotateHint: "Slide to Rotate ↔️",
    mrxInsightLabel: "MR. X INSIGHT",
    closeDetailsBtn: "Close Details",
    comfortableSpot: "Most Comfortable",
    sites: injectionSitesEn,
  },
  mealPlanTitle: "Meal Plan",
  mealPlanBtn: "Generate Plan",
  mealPlanLoading: "Preparing...",
  mealPlanError: "Error occurred",
  timelineTitle: "Transformation Timeline",
  timelineSubtitle: "What happens inside your body week by week? A full biological journey.",
  timelinePhases: [
    { week: "1-2", title: "The Kickstart", shortDesc: "Initial saturation and first changes", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "Sharp rise in blood androgen levels. Nitrogen retention increases.", feeling: "High libido, improved mood, constant pumps.", action: "Stick to diet 100%. Drink 4L water daily." } },
    { week: "3-6", title: "Hypertrophy Surge", shortDesc: "Rapid growth and weight gain", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "Receptor saturation. Protein synthesis at max.", feeling: "Insane strength. Clothes get tight. High appetite.", action: "Increase weights. Monitor BP and Estrogen." } },
    { week: "7-10", title: "Hardening Phase", shortDesc: "Weight stabilizes, fat burning starts", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "Blood levels stable. Body uses fat for fuel efficiently.", feeling: "Muscles look harder and more detailed.", action: "Start regular cardio. Monitor liver values." } },
    { week: "11-12", title: "Peaking", shortDesc: "Final touches before exit", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "Max muscle density. Preparing for withdrawal.", feeling: "Slight fatigue. Fully ready.", action: "Plan PCT. Slight calorie deficit." } }
  ],
  timelineLabels: { strength: "Strength", hypertrophy: "Size", water: "Water", fatLoss: "Fat Loss", mood: "Mood", biologicalTitle: "Biological Impact", feelingTitle: "How You Feel", actionTitle: "Action Plan", phaseLabel: "Phase" },
  salesToast: { purchased: "purchased Full Version", verified: "Verified", justNow: "Just Now", fromLabel: "from" },
  audioPlayer: { title: "Author's Intro", subtitle: "Listen to a special message from George", duration: "02:15" },
  aiChat: { fabLabel: "Mr. X AI", title: "Mr. X AI Assistant", subtitle: "Your smart assistant for questions", placeholder: "Ask a question...", send: "Send", disclaimer: "AI may make mistakes. Always consult a doctor.", welcomeMessage: "Hey champ. I'm Mr. X AI. How can I help with your training or nutrition today?" },
  quiz: {
    title: "Are You Ready?",
    subtitle: "A quick quiz to determine your level and whether you are ready to enter the hormonal world or need more foundation.",
    startBtn: "Start Quiz",
    questionLabel: "Question",
    totalLabel: "Total",
    questions: [
      {
        question: "How many years of consistent training do you have?",
        options: [
          { text: "Less than 3 years", score: 0 },
          { text: "More than 5 years", score: 1 }
        ]
      },
      {
        question: "What is your current body fat percentage?",
        options: [
          { text: "Over 15% (visible fat)", score: 0 },
          { text: "Under 12% (visible abs)", score: 1 }
        ]
      },
      {
        question: "Do you weigh your food and track calories daily?",
        options: [
          { text: "Sometimes / I just eat healthy", score: 0 },
          { text: "Yes, every gram is tracked", score: 1 }
        ]
      },
      {
        question: "Do you know what PCT (Post Cycle Therapy) is?",
        options: [
          { text: "Heard of it / Don't know much", score: 0 },
          { text: "Yes, I know SERMs & HCG protocols", score: 1 }
        ]
      },
      {
        question: "Have you done bloodwork (Kidney, Liver, Hormones) recently?",
        options: [
          { text: "No / A long time ago", score: 0 },
          { text: "Yes, and I know my baseline", score: 1 }
        ]
      }
    ],
    results: {
      natural: {
        title: "Stay Natural (For Now)",
        desc: "You have great potential for natural growth. Using hormones now might hurt you more than help because your foundation (Diet/Training) needs tuning. This book will help you max out your natural genetic potential first.",
        cta: "Get the Book to Maximize Gains"
      },
      enhanced: {
        title: "You Are Ready for the Next Step",
        desc: "You have the experience and a solid foundation. The next step requires precise science to protect you. You don't need random advice; you need the strict scientific protocols in this book.",
        cta: "Get the Book & Start Your Cycle"
      }
    }
  },
  dailyIQ: {
    title: "Daily Steroid IQ Challenge",
    subtitle: "New question every 24h. Answer correctly to unlock an instant discount.",
    challengeLabel: "DAILY CHALLENGE",
    winTitle: "Correct! You're sharp.",
    winDesc: "You proved your knowledge. Here is your discount code (Valid for 60 mins).",
    loseTitle: "Incorrect",
    loseDesc: "Don't worry, learning is part of the game. Come back tomorrow for a new question.",
    explanationLabel: "Explanation:",
    copySuccess: "Code copied!",
    toastCorrect: "Awesome! Discount code applied successfully.",
    couponLabel: "Discount Code",
    claimBtn: "Copy & Buy Now",
    expiresIn: "Offer expires in:",
    comeBackTomorrow: "Next question in:",
    questions: [
      {
        id: 1,
        question: "What is the primary difference between Nolvadex and Clomid in PCT?",
        options: ["They are exactly the same", "Nolvadex is better for Gyno, Clomid is stronger for LH stimulation", "Clomid stops Gyno better than Nolvadex", "Nolvadex is an Aromatase Inhibitor (AI)"],
        correctIndex: 1,
        explanation: "Nolvadex blocks estrogen at the breast tissue (stopping Gyno), while Clomid acts more potently on the pituitary gland to restart LH and Testosterone."
      },
      {
        id: 2,
        question: "What is the approximate half-life of Testosterone Enanthate?",
        options: ["24 Hours", "2-3 Days", "4.5-5 Days", "14 Days"],
        correctIndex: 2,
        explanation: "Testosterone Enanthate has a half-life of roughly 4.5 to 5 days, making it suitable for twice-weekly injections."
      },
      {
        id: 3,
        question: "Which of these is considered the most hepatotoxic (Liver Toxic)?",
        options: ["Testosterone Propionate", "Injectable Primobolan", "Dianabol (Oral)", "Deca Durabolin"],
        correctIndex: 2,
        explanation: "Oral steroids like Dianabol are 17-alpha-alkylated to survive liver metabolism, causing significant liver stress compared to injectables."
      }
    ]
  },
  cycleArchitect: {
    title: "Smart Cycle Synchronizer",
    subtitle: "Design your protocol with precision. Get a live executable schedule (ICS) with injection rotation, stealth mode, and PCT calculation.",
    presetsTitle: "Presets:",
    configLabel: "Configuration",
    stealthModeLabel: "Stealth Mode (Privacy)",
    rotationLabel: "Auto-Rotate Injection Sites",
    pctLabel: "Auto-Calculate PCT Start",
    toggleStealth: "Toggle Stealth Mode",
    toggleRotation: "Toggle Injection Rotation",
    togglePct: "Toggle Auto PCT",
    stealthAliases: ["Gym Session", "Vitamin Shot", "Work Meeting", "Physio", "Cardio"],
    rotationSites: ["Right Glute (Dorso)", "Left Glute (Dorso)", "Right Delt", "Left Delt", "Right Quad", "Left Quad"],
    presets: {
      beginnerBulk: "Beginner Bulking",
      cutting: "Advanced Cutting",
      trt: "TRT Protocol"
    },
    form: {
      startDateLabel: "Start Date",
      compoundLabel: "Compound",
      dosageLabel: "Dosage (mg)",
      frequencyLabel: "Frequency",
      weeksLabel: "Duration (Weeks)",
      halfLifeLabel: "Half-Life (Days) - For PCT",
      addCompoundBtn: "Add Compound",
      removeBtn: "Remove",
      frequencies: {
        daily: "Daily (ED)",
        eod: "Every Other Day (EOD)",
        twiceWeekly: "Twice Weekly (Mon/Thu)",
        weekly: "Weekly (Once)"
      }
    },
    premiumLock: {
      lockedTitle: "Premium Feature Locked",
      lockedDesc: "Exporting the full schedule to your phone's calendar with Smart Rotation, Stealth Mode & Auto-PCT is exclusive to Verified Customers.",
      verifyBtn: "Verify Purchase to Unlock",
      exportBtn: "Export Smart Calendar (.ics)",
      placeholder: "Enter Email or Order ID",
      successMsg: "Verified! Feature Unlocked.",
      errorMsg: "Order not found.",
      demoHint: "Try \"demo\" to unlock instantly"
    },
    pctEventSummary: "🔰 START PCT PROTOCOL 🔰",
    pctEventDescription: "Clearance time passed. Begin SERMs protocol now.",
    stealthPctAlias: "Recovery Phase Start"
  },
  units: {
    mg: "mg",
    g: "g",
    ml: "ml",
    kcal: "kcal",
    days: "days",
    weeks: "weeks",
    percentage: "%",
    liters: "liters",
    ed: "Daily",
    eod: "EOD",
    twiceWeekly: "Twice Weekly",
    weekly: "Weekly"
  }
};

export const arContent: ContentStrings = {
  ...enContent,
  navAiTools: "أدوات كمال الأجسام الذكية",
  navPremiumResources: "الموارد الحصرية",
  navFeatures: "المميزات",
  navToolNames: {
    macro: "حاسبة الماكروز",
    injection: "خريطة الحقن التفاعلية",
    halflife: "محاكي نصف العمر",
    lab: "المرجع الذكي للتحاليل",
    genetic: "حاسبة الإمكانيات الجينية",
    cycleArchitect: "مُصدر تقويم الكورسات (Cycle Calendar)",
  },
  themeNames: {
    light: "الوضع المضيء",
    dark: "الوضع الليلي",
    system: "وضع النظام",
  },
  backToHome: "العودة للرئيسية",
  seoTitle: "مستر إكس-سترويد Mr. X-Steroid | الدليل الشامل لكمال الأجسام والهرمونات",
  seoDescription: "اكتشف الدليل العلمي الأقوى في العالم العربي لبناء العضلات والكورسات الهرمونية. كتاب مستر إكس-سترويد بقلم جورج موريس يقدم جداول تضخيم وتنشيف، بروتوكولات حماية، ودليل شامل للمكملات.",
  seoKeywords: seoKeywordsArabic,

  heroTitle: "مستر إكس-سترويد Mr. X-Steroid",
  heroSubtitle: "اكتشف دليل بناء العضلات وكتاب الكورسات الهرمونية: دليل شامل ومنهج علمي مُدعم بجداول تفصيلية دقيقة وجداول بسيطة سهلة الفهم يعرّفك على كورسات الهرمونات الابتنائية المثيرة ويجعلها في متناول يدك عبر خطط عملية واضحة لتكون عونًا في رحلتك نحو القوة وجسمٍ منحوتٍ مهيبٍ مفتول العضلات.",
  heroCta: "احصل على نسختك الآن",
  downloadPreview: "تحميل معاينة مجانية (PDF)",
  audioPreviewBtn: "استمع للمقدمة",
  authorSection: "عن المؤلف",
  authorName: "جورج موريس",
  authorBio: "المؤلف ومصمم الغلاف، يقدم جورج دليلاً ليس مجرد معلومات - بل هو درع. هذا الكتاب رسالة إلى كل مدرب ورياضي يؤمن بأن المعرفة والعلم هما أساس التميز.",
  featuresTitle: "ماذا ستجد في هذا الكتاب؟",
  sneakPeekTitle: "نظرة حصرية داخل الكتاب",
  sneakPeekSubtitle: "شاهد كيف تبدو الجداول الاحترافية. الجزء الأول متاح، والباقي مشفر لحماية المحتوى.",
  unlockText: "اشترِ الكتاب لفتح الجدول والجرعات بالكامل",
  buyNow: "شراء الكتاب",
  contact: "تواصل معنا",
  copyright: "جميع الحقوق محفوظة © 2025 George Mourice",
  features: [
    {
      title: "المخططات الهرمونية الشاملة: من المبتدئ إلى 'الوحش'",
      description: "لن تضطر بعد اليوم للتخمين أو الاعتماد على 'وصفات' المدربين العشوائية. يقدم لك الكتاب جداول تفصيلية دقيقة لكورسات الهرمونات، مصممة بمنهجية علمية تبدأ معك من مستوى المبتدئين وتتدرج بك بأمان إلى المستويات المتوسطة والمتقدمة. ستجد خططاً واضحة للتضخيم (Bulking) لبناء كتلة عضلية مرعبة، وخططاً للتنشيف (Cutting) لنحت العضلات وإبراز تفاصيلها، مدعومة بجرعات محددة وتوقيتات دقيقة.",
      iconKey: "chart"
    },
    {
      title: "فن 'الخروج الآمن': بروتوكولات التنظيف (PCT) الصارمة",
      description: "الدخول في كورس الهرمونات سهل، ولكن الخروج الآمن هو الفن الحقيقي. يشرح لك الكتاب بالتفصيل الممل كيف تحمي جهازك الهرموني، وكيف تستعيد إنتاج التستوستيرون الطبيعي بسرعة بعد الكورس لتجنب الانهيار العضلي والاكتئاب. خطط PCT مدروسة بالأدوية والجرعات.",
      iconKey: "exit"
    },
    {
      title: "دليل المكملات: الحقيقة الكاملة بدون تسويق",
      description: "وفر أموالك وتوقف عن شراء مكملات لا فائدة منها. يقدم لك الكتاب دليلاً صريحاً للمكملات التي تعمل فعلاً (مثل الكرياتين، البروتين، الفيتامينات الأساسية) ويكشف لك كذب المكملات التجارية التي تستنزف جيبك.",
      iconKey: "shield"
    }
  ],
  testimonials: [
    { name: "أحمد س.", title: "لاعب كمال أجسام هاوي", text: "كنت تائهاً بين معلومات الإنترنت المتضاربة. هذا الكتاب وضعني على الطريق الصحيح ووفر علي سنوات من التجربة والخطأ." },
    { name: "محمد ع.", title: "مدرب شخصي", text: "مرجع لا غنى عنه لأي مدرب يريد أن يكون أميناً مع عملائه ويحمي صحتهم." },
    { name: "كريم م.", title: "بطل محلي", text: "الجداول الموجودة في الكتاب دقيقة جداً وساعدتني في الوصول لأفضل فورمة في حياتي." }
  ],
  testimonialsTitle: "ماذا يقول القراء؟",
  faqTitle: "الأسئلة الشائعة",
  faqSubtitle: "إجابات مباشرة على أكثر الأسئلة تكراراً",
  faqSearchPlaceholder: "ابحث عن سؤال...",
  faqCategories: { all: "الكل", safety: "الأمان", general: "عام", legal: "قانوني", women: "السيدات", strategy: "استراتيجيات" },
  faqs: [
    { question: "هل الكتاب مناسب للمبتدئين تماماً؟", answer: "نعم، يبدأ الكتاب من الأساسيات ويشرح المصطلحات الطبية والرياضية بلغة بسيطة جداً قبل الدخول في الجداول المعقدة.", category: "general" },
    { question: "هل يحتوي الكتاب على جداول تغذية؟", answer: "نعم، الكتاب يركز بشكل أساسي على الهرمونات ولكنه يحتوي على فصل كامل عن التغذية المناسبة خلال الكورس وكيفية حساب السعرات والماكروز.", category: "strategy" },
    { question: "كيف أحصل على الكتاب بعد الدفع؟", answer: "بمجرد إتمام الدفع، سيصلك رابط تحميل مباشر لملف PDF على بريدك الإلكتروني فوراً.", category: "general" },
    { question: "ما الذي يميز 'Mr. X-Steroid' عن أدلة كمال الأجسام الأخرى؟", answer: "معظم الأدلة مليئة بالمصطلحات الطبية المملة. لقد أحدثنا ثورة من خلال تكثيف العلوم المعقدة في جداول سهلة القراءة وقابلة للتنفيذ. سواء كنت مبتدئاً أو رياضياً متقدماً، ستحصل على خارطة طريق بصرية واضحة لجسم أحلامك دون عناء.", category: "general" },
    { question: "هل هذا الكتاب مناسب للمبتدئين؟", answer: "بالتأكيد! 💯 نبدأ من نقطة الصفر. لا تحتاج لشهادة طبية لفهم دوراتنا. نحن نوجهك خطوة بخطوة، ونشرح 'ماذا، ولماذا، وكيف' لكل مادة، لنضمن أنك لن تشعر أبداً بالضياع.", category: "general" },
    { question: "هل سيساعدني هذا حقاً في كسر حالة الثبات (Plateau)؟", answer: "نعم. إذا توقفت مكاسبك، فمن المحتمل أنها مشكلة استراتيجية. يوفر 'Mr. X-Steroid' تقنيات دمج (Stacking) متقدمة وتعديلات على الدورات تصدم العضلات وتعيدها إلى وضع النمو. وداعاً للركود! 🚀", category: "general" },
    { question: "كيف أتأكد من حفاظي على صحتي أثناء الكورس؟", answer: "الأمان هو هوسنا. 🛡️ نقدم أدلة شاملة حول تقليل المخاطر، بما في ذلك كيفية قراءة إشارات جسمك والضرورة القصوى لتحاليل الدم. نحن نعلمك كيفية التخفيف من المخاطر، وليس تجاهلها.", category: "safety" },
    { question: "ماذا عن الآثار الجانبية؟ هل يمكنني تجنبها؟", answer: "رغم أنه لا يوجد كورس بدون مخاطر، إلا أن المعرفة هي أفضل دفاع لك. نخصص أقساماً كاملة لإدارة مستويات الاستروجين، وحماية الكبد، ومنع تساقط الشعر. نقدم لك البروتوكولات لتقليل الآثار الجانبية والحفاظ على استقرار جسمك.", category: "safety" },
    { question: "هل يغطي الكتاب فترة التنظيف (PCT)؟", answer: "الكورس لا ينتهي حتى تنتهي فترة التنظيف. 🔄 لا نتركك عالقاً؛ نحن نوفر بروتوكولات PCT مفصلة للمساعدة في استعادة إنتاج التستوستيرون الطبيعي والحفاظ على العضلات التي كافحت لبنائها.", category: "safety" },
    { question: "هل يشجع 'Mr. X-Steroid' على الأنشطة غير القانونية؟", answer: "لا. 🚫 هذه المواد مخصصة حصرياً للأغراض الإعلامية والتعليمية وتقليل المخاطر. نؤمن أنه إذا اختار البالغون استخدام هذه المواد، فيجب أن يحصلوا على بيانات علمية دقيقة لتجنب الأخطاء الخطيرة.", category: "legal" },
    { question: "هل يمكنني الوقوع في مشكلة لامتلاكي هذا الكتاب؟", answer: "بالتأكيد لا. امتلاك المعرفة حق أساسي. 📚 أنت ببساطة تشتري مورداً تعليمياً شاملاً. ومع ذلك، فإن شراء واستخدام المواد الابتنائية يخضع للقوانين المحلية التي ننصحك باحترامها.", category: "legal" },
    { question: "هل تبيعون المنشطات في هذا الموقع؟", answer: "أبداً. نحن نبيع الخبرة والاستراتيجية والمعلومات. نحن لا نبيع أو نوزع أو نتغاضى عن بيع المواد الخاضعة للرقابة. نحن مدربون، ولسنا تجاراً.", category: "legal" },
    { question: "هل يؤدي استخدام هذه الاستراتيجيات إلى جعل مظهري مثل الرجال؟", answer: "ليس مع توجيهاتنا! 🙅‍♀️ المظهر الضخم غالباً ما يأتي من استخدام المواد أو الجرعات الخاطئة. يركز قسم 'منطقة السيدات' على دورات آمنة وصديقة للإناث مصممة للشد وحرق الدهون وبناء عضلات صافية - مع الحفاظ على أنوثتك وتعزيز قوتك.", category: "women" },
    { question: "ما هي المواد الآمنة للسيدات؟", answer: "نسلط الضوء خصيصاً على المواد ذات التأثيرات الأندروجينية المنخفضة (مثل Anavar أو Primobolan) المشهورة بين عارضات اللياقة البدنية. نخبرك بالضبط ما يجب تجنبه لمنع ظهور أعراض الذكورة.", category: "women" },
    { question: "هل يمكن للسيدات اتباع نفس دورات الرجال؟", answer: "قطعا لا! فيزيولوجيا الإناث فريدة من نوعها. نحن نوفر جداول مصممة خصيصاً للسيدات، مع تعديل الجرعات وطول الدورات لضمان النتائج دون المساس بالتوازن الهرموني. 🌸", category: "women" },
    { question: "التضخيم مقابل التنشيف: هل يغطي الكتاب كليهما؟", answer: "نعم، نحن نغطي الطيف الكامل! 📉📈 سواء كنت ترغب في اكتساب الكتلة في غير موسم البطولات أو الحصول على تنشيف خرافي للصيف، فلدينا 'مخططات دورات' خاصة لكل هدف. ما عليك سوى اختيار هدفك، وسنريك الطريق.", category: "strategy" },
    { question: "كيف أعرف أي مجموعة (Stack) مناسبة لي؟", answer: "نصنف المجموعات حسب مستوى الخبرة (مبتدئ، متوسط، محترف). لن تبدأ بطريق الخطأ دورة للمحترفين في يومك الأول. نحن نساعدك على التدرج عبر المستويات منطقياً لتحقيق أقصى قدر من المكاسب وتقليل الصدمات.", category: "strategy" },
    { question: "ما هو نهج 'الكورس الذكي' (Smart Cycle)؟", answer: "يتعلق الأمر بالتوقيت والتآزر. ⏱️ نحن نعلمك كيفية مزامنة كثافة تدريبك وتغذيتك مع أسابيع الذروة في دوراتك. الأمر لا يتعلق فقط بتناول شيء ما؛ بل يتعلق بمواءمة نمط حياتك بالكامل لتحقيق تأثير 'X-Steroid'.", category: "strategy" }
  ],
  privacyPolicy: "سياسة الخصوصية",
  termsOfService: "شروط الخدمة",
  refundPolicy: "سياسة الاسترجاع",
  legalDisclaimer: "إخلاء المسؤولية القانوني",
  aboutUs: "من نحن",
  legal: "قانوني",
  quickLinks: "روابط سريعة",
  privacyPolicyContent: "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية...",
  termsOfServiceContent: "باستخدامك لهذا الموقع، فإنك توافق على الشروط التالية...",
  refundPolicyContent: "نظراً لطبيعة المنتج الرقمي، لا يمكن استرجاع المبلغ بعد تحميل الملف...",
  pricingTitle: "اختر خطتك",
  pricingSubtitle: "استثمار بسيط في صحتك ومعرفتك سيوفر عليك آلاف الدولارات ومخاطر صحية لا حصر لها.",
  pricingTiers: [
    { name: "الباقة الاحترافية", price: "$49.99", originalPrice: "$79.99", description: "الكتاب الكامل + أدوات حصرية", features: ["الكتاب الكامل (300+ صفحة)", "حاسبة الجرعات (Excel)", "دخول مجتمع خاص", "دليل المكملات (هدية)"], buttonText: "الأكثر مبيعاً", isPopular: true, popularLabel: "أفضل قيمة" },
    { name: "باقة التدريب الخاص", price: "$199.99", description: "تدريب شخصي + الكتاب", features: ["كل مميزات الباقة الاحترافية", "استشارة أونلاين (30 دقيقة)", "تصميم كورس مخصص", "متابعة لمدة شهر"], buttonText: "ابدأ التحول الآن" }
  ],
  disclaimerTitle: "تنبيه هام جداً وإخلاء مسؤولية",
  disclaimerContent: fullArabicDisclaimer,
  agreeButton: "أوافق وأتحمل المسؤولية الكاملة وعمري فوق الـ 18 عاماً",
  disclaimerAcknowledgement: "بالضغط على الزر أدناه، فإنك تقر بأنك قد قرأت وفهمت ووافقت على جميع الشروط المذكورة أعلاه.",

  importantDisclaimer: "تنبيه هام",
  downloadFullBook: "تحميل الكتاب الكامل",
  purchaseSuccess: "تمت عملية الشراء بنجاح! يمكنك الآن الوصول إلى جميع الميزات الحصرية.",
  loginTitle: "تسجيل الدخول",
  signupTitle: "إنشاء حساب",
  emailLabel: "البريد الإلكتروني",
  passwordLabel: "كلمة المرور",
  nameLabel: "الاسم الكامل",
  loginBtn: "دخول",
  signupBtn: "تسجيل",
  noAccount: "ليس لديك حساب؟",
  haveAccount: "لديك حساب بالفعل؟",
  invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  signupSuccess: "تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.",
  logout: "تسجيل الخروج",
  welcomeUser: "مرحباً",
  loginWithGoogle: "دخول بحساب جوجل",
  loginWithMicrosoft: "دخول بحساب مايكروسوفت",
  orDivider: "أو",

  benefitsTitle: "لماذا يعد \"Mr. X-Steroid\" أفضل استثمار لك؟",
  benefitsSubtitle: "نحن لا نبيع مجرد صفحات؛ نحن نبيعك سنوات من الخبرة والعلوم المختصرة لتسريع طريقك نحو القمة.",
  benefits: [
    { title: "عائد استثمار أقصى: توقف عن التخمين 💰", description: "الوقت هو العضلات. بدلاً من إضاعة سنوات في التجربة والخطأ، احصل على المعادلة الدقيقة للنمو السريع.", iconKey: "roi" },
    { title: "سلامة طبية وتقليل الأضرار 🛡️", description: "تعلم كيفية إدارة الآثار الجانبية وتجاوز فترة التنظيف كمحترف باستخدام بروتوكولات طبية حقيقية.", iconKey: "safety" },
    { title: "0% خرافات، 100% حقيقة 🧪", description: "بيانات خام غير مفلترة. نزيل أكاذيب التسويق لنعطيك الحقائق العلمية التي استخدمها الأبطال فعلاً.", iconKey: "truth" },
    { title: "علوم معقدة، بساطة مرئية 🚀", description: "لقد فككنا علم الغدد الصماء المعقد إلى مخططات مرئية سهلة المتابعة لكل مستويات الخبرة.", iconKey: "simplified" },
    { title: "ميزة \"الدورة الذكية\" 🧠", description: "تضمن منهجيتنا وصول تغذيتك وتدريبك لقمتهما تماماً عندما تكون هرموناتك في ذروتها لتحول أسطوري.", iconKey: "smart" }
  ],
  labReference: {
    title: "المرجع الذكي للتحاليل",
    subtitle: "افهم أرقام تحاليلك الطبية بنفسك. هذا الدليل يساعدك على قراءة نتائج المختبر ومعرفة مؤشرات الخطر.",
    searchPlaceholder: "ابحث عن اسم التحليل (مثال: Test, ALT)...",
    noResults: "لا توجد نتائج لهذا البحث",
    analyzeBtn: "تحليل النتيجة",
    analyzeTitle: "أدخل نتيجتك",
    enterValue: "القيمة",
    resultLabel: "التصنيف",
    status: { low: "منخفض", normal: "طبيعي", high: "مرتفع" },
    categories: { all: "الكل", hormones: "هرمونات", organs: "وظائف أعضاء", blood: "دم ومناعة", vitamins: "فيتامينات", minerals: "معادن", thyroid: "الغدة الدرقية" },
    labels: { whatIsIt: "ما هو؟", normalRange: "المعدل الطبيعي", elevationMeaning: "ماذا يعني الارتفاع؟", lowMeaning: "ماذا يعني الانخفاض؟", management: "كيف تتصرف؟", cancel: "إلغاء", high: "مرتفع", low: "منخفض" },
    tests: labTestsAr,
  },
  whoIsTitle: "لمن هذا الكتاب؟",
  whoIsSubtitle: "تم تصميم هذا المحتوى بعناية ليخدم فئات محددة بفعالية قصوى",
  targetAudiences: [
    { title: "لاعب كمال الأجسام الطموح", description: "الذي يريد اختصار الطريق وبناء جسم مثالي بأسس علمية.", iconKey: "athlete" },
    { title: "المدرب المحترف", description: "الذي يبحث عن مرجع علمي موثوق لتصميم برامج لاعبيه.", iconKey: "coach" },
    { title: "الباحث عن الحقيقة", description: "الذي سئم من المعلومات المغلوطة والخرافات المنتشرة في الجيم.", iconKey: "truth" },
    { title: "المهتم بصحته", description: "الذي يريد فهم تأثير الهرمونات على الجسم وكيفية الوقاية من أضرارها.", iconKey: "shield" }
  ],
  whoIsClosing: "إذا كنت واحداً من هؤلاء، فهذا الكتاب هو استثمارك الأذكى.",
  whoIsCta: "ابدأ رحلتك الآن",
  checkoutTitle: "إتمام الشراء الآمن",
  billingDetails: "بيانات الفاتورة",
  fullName: "الاسم الكامل",
  emailAddress: "البريد الإلكتروني",
  paymentMethod: "طريقة الدفع",
  creditCard: "بطاقة الائتمان",
  cardNumber: "رقم البطاقة",
  expiryDate: "تاريخ الانتهاء",
  cvc: "رمز الأمان (CVC)",
  payNow: "ادفع الآن",
  cancel: "إلغاء",
  orderSummary: "ملخص الطلب",
  total: "الإجمالي",
  secureCheckout: "دفع آمن ومشفر 100% via Stripe",
  aboutPageTitle: "عن Mr. X-Steroid",
  aboutPageContent: "مشروع Mr. X-Steroid هو ثمرة سنوات من البحث والتجربة...",
  aboutPageStoryTitle: "قصتنا",
  aboutPageStory: "بدأنا كمدونة صغيرة لنشر الوعي...",
  aboutPageMissionTitle: "رسالتنا",
  aboutPageMission: "نشر العلم ومحاربة الجهل الهرموني...",
  contactPageTitle: "تواصل معنا",
  contactPageSubtitle: "نحن هنا لمساعدتك والإجابة على استفساراتك",
  contactFormNamePlaceholder: "اسمك",
  contactFormEmailPlaceholder: "بريدك الإلكتروني",
  contactFormMessagePlaceholder: "كيف يمكننا مساعدتك؟",
  contactFormSubjectPlaceholder: "الموضوع",
  contactFormSubmit: "إرسال الرسالة",
  contactFormSuccessMessage: "تم إرسال رسالتك بنجاح! سنرد عليك قريباً.",
  contactInfoAddress: "دبي، الإمارات العربية المتحدة",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 50 123 4567",
  contactInfoHours: "من الإثنين للجمعة، 9 صباحاً - 5 مساءً",
  homeLink: "الرئيسية",
  viewOnMap: "الموقع",
  cookieTitle: "ملفات تعريف الارتباط",
  cookieMessage: "نستخدم الكوكيز لتحسين تجربتك.",
  cookieAccept: "موافق",
  cookieReject: "رفض",
  calcTitle: "حاسبة السعرات والماكروز",
  calcSubtitle: "حدد احتياجاتك الغذائية بدقة علمية",
  calcGender: "الجنس",
  calcMale: "ذكر",
  calcFemale: "أنثى",
  calcAge: "العمر",
  calcWeight: "الوزن (كجم)",
  calcHeight: "الطول (سم)",
  calcActivity: "مستوى النشاط",
  calcTrainingStyle: "أسلوب التمرين",
  calcGoal: "الهدف",
  calcCalculate: "احسب الآن",
  calcResults: "نتائجك اليومية",
  calcCalories: "سعر حراري",
  calcProtein: "بروتين",
  calcCarbs: "كاربوهيدرات",
  calcFats: "دهون صحية",
  calcCta: "صمم خطتك الغذائية",
  calcSmartMode: "الوضع الذكي",
  calcBodyFat: "نسبة الدهون",
  calcWater: "احتياج الماء",
  calcLiters: "لتر",
  calcRecalculate: "إعادة الحساب",
  calcGenerateMealPlan: "توليد جدول غذائي بالذكاء الاصطناعي",
  calcGenerating: "جاري التوليد...",
  calcMealPlanTitle: "جدولك الغذائي المقترح",
  calcMealPlanSubtitle: "تم توليده بواسطة AI بناءً على أرقامك",
  calcDisclaimer: "هذه الأرقام تقريبية وتعتمد على معادلات رياضية. استشر أخصائي تغذية.",
  calcTdeeLabel: "إجمالي الطاقة اليومية (TDEE)",
  calcBmrLabel: "معدل الحرق الأساسي (BMR)",
  calcTefLabel: "تأثير الطعام الحراري (TEF)",
  calcBeastTitle: "تصنيف الوحش الكامن",
  calcAnalysisLabel: "تحليل المحرك الذكي",
  calcBmiStatusLabel: "حالة BMI",
  calcShuffleLabel: "تغيير الأصناف (Shuffle)",
  calcAwaitingInputLabel: "بانتظار المدخلات العضلية",
  calcAiEngineLabel: "AI POWERED ENGINE",
  calcAnalyzingLabel: "جاري التحليل...",
  calcMetabolicActiveLabel: "نشاط أيضي مفعل",
  calcAnabolicPotentialLabel: "مستوى بناء العضلات المتوقع",
  calcPredictionTitle: "توقعات الجسد بعد 12 أسبوعاً",
  calcWindowBtn: "نصيحة النافذة الأيضية",
  calcTrainingTime: "وقت التمرين المفضل",
  calcTrainingWindows: {
    morning: "صباحاً",
    afternoon: "ظهراً",
    evening: "مساءً",
    advice: "بما أن تمرينك {time}، ننصح بتركيز 40% من الكاربوهيدرات حول نافذة التمرين."
  },
  calcBeastNames: {
    cut: "Shredded Beast (الوحش الممزق)",
    maintain: "Hybrid Warrior (المحارب الهجين)",
    bulk: "Anabolic Titan (العملاق الأنابوليكي)"
  },
  calcPredictions: {
    cut: "ستظهر عضلاتك بشكل حاد، مع اختفاء الدهون العنيدة حول الخصر. ستبرز التفاصيل التي لم ترها من قبل.",
    maintain: "تطور ملحوظ في كثافة العضلات مع الحفاظ على مستوى دهون منخفض. جسد رياضي قوي ومتناسق.",
    bulk: "زيادة هائلة في الكتلة العضلية والقوة. ستبدو أضخم في ملابسك مع امتلاء عضلي واضح في الأكتاف والصدر."
  },
  calcSelectGoal: { cut: "تنشيف (حرق دهون)", maintain: "محافظة على الوزن", bulk: "تضخيم (بناء عضل)" },
  calcMealNames: ["الإفطار", "الغداء", "قبل التمرين", "العشاء"],
  calcActivityLevels: { sedentary: "خامل (لا تمرين)", light: "خفيف (1-3 أيام/أسبوع)", moderate: "متوسط (3-5 أيام/أسبوع)", active: "نشيط (6-7 أيام/أسبوع)", veryActive: "نشيط جداً (تمرين مرتين يومياً)" },
  calcTrainingStyles: { hypertrophy: "بناء عضلي (Hypertrophy)", strength: "قوة بدنية (Strength)", endurance: "تحمل (Endurance)" },
  geneticCalculator: {
    title: "حاسبة الإمكانيات الجينية",
    subtitle: "اكتشف الحد الأقصى الطبيعي لحجم عضلاتك والمستوى الذي يمكن الوصول إليه بالهرمونات بناءً على نموذج Casey Butt.",
    labels: {
      height: "الطول (سم)",
      wrist: "محيط المعصم (سم)",
      ankle: "محيط الكاحل (سم)",
      bodyFat: "نسبة الدهون المستهدفة (%)",
      frameSize: "حجم الهيكل",
      boneThickness: "سماكة العظام",
      lowerBody: "بنية الجزء السفلي",
      shoulders: "محيط الأكتاف (سم)",
      chest: "محيط الصدر (سم)",
      waist: "محيط الخصر (سم)",
      thigh: "محيط الفخذ (سم)",
      calf: "محيط البطة (سم)",
      current: "الحالي",
      potential: "الإمكانية",
      analysis: "تحليل كيسي بات",
      roadmap: "خارطة الطريق العضلية",
      ffmi: "مؤشر الكتلة الخالية من الدهون (FFMI)",
      goldenRatio: "النسبة الذهبية",
      physiqueScore: "نقاط اللياقة البدنية"
    },
    modelLabel: "بناءً على نموذج Casey Butt",
    awaitingDataTitle: "بانتظار البيانات...",
    frameOptions: { small: "صغير", medium: "متوسط", large: "ضخم" },
    unknownMeasurements: "لا تعرف قياساتك؟ قدرها تقريباً",
    cta: "تحليل إمكانياتي",
    reset: "إعادة تعيين",
    yourBodyType: "نوع جسمك",
    resultTitle: "تحليل إمكانياتك العضلية",
    naturalLabel: "أقصى وزن طبيعي",
    enhancedLabel: "أقصى وزن مع الهرمونات",
    differenceLabel: "الفرق المتوقع",
    disclaimer: "هذه الحسابات تعتمد على معادلات رياضية وإحصائية ولا تعتبر حتمية. الجينات الفردية تلعب دوراً كبيراً.",
    unlockMsg: "للوصول لهذا المستوى، تحتاج للمعرفة الصحيحة.",
    errorMsg: "الرجاء التأكد من إدخال جميع البيانات بشكل صحيح.",
    bodyTypes: {
      ecto: "نحيف (Ectomorph)",
      meso: "عضلي (Mesomorph)",
      endo: "ضخم (Endomorph)"
    }
  },
  halfLifeVisualizer: {
    title: "محاكي نصف العمر (Half-Life)",
    subtitle: "شاهد كيف يتراكم الهرمون في دمك وتجنب التذبذب.",
    compoundLabel: "المادة",
    dosageLabel: "الجرعة (ملجم)",
    durationLabel: "المدة (أسبوع)",
    frequencyLabel: "تكرار الحقن",
    yAxis: "مستوى الهرمون في الدم",
    xAxis: "الأيام",
    pctZone: "منطقة الخروج الآمن (PCT)",
    pctStartMsg: "يمكنك بدء التنظيف هنا",
    peakLevelMsg: "أعلى تركيز",
    addToStackBtn: "أضف للStack",
    activeStackTitle: "المواد المفعلة",
    serumTitle: "تركيز المادة في الدم",
    peakLabel: "القمة",
    emptyStackMsg: "أضف مواد لتشاهد منحنى التراكم",
    compounds: commonCompounds,
    frequencies: { ed: "يومياً (ED)", eod: "يوم بعد يوم (EOD)", e3d: "كل 3 أيام (E3D)", e7d: "أسبوعياً (E7D)" },
    tooltipDay: "اليوم",
    tooltipLevel: "المستوى",
    tooltipPctReady: "جاهز للـ PCT",
    tooltipWait: "انتظر",
    tooltipInject: "حقنة",
    analysis: {
      title: "تحليل الدورة الهرمونية",
      prosTitle: "المميزات المتوقعة",
      consTitle: "المخاطر المحتملة",
      adviceTitle: "رأي مستر إكس",
      pros: ["استقرار مستويات الدم", "فترات حقن مريحة", "أقل عرضة للأعراض الجانبية الحادة"],
      cons: ["تراكم بطيء للمادة", "فترة خروج طويلة (Clearance)", "يتطلب تخطيط دقيق للـ PCT"],
      advice: "هذا الرسم البياني يوضح لك كيف تتراكم المواد في دمك. الثبات هو المفتاح لتجنب الأعراض الجانبية. لاحظ متى يبدأ الـ PCT."
    }
  },
  injectionMap: {
    labels: {
      left: "يسار",
      right: "يمين",
      days: "أيام",
      injectionSteps: "خطوات الحقن",
      selectPoint: "اختر نقطة حقن",
      efficiency: "كفاءة الامتصاص",
      recovery: "وقت التعافي",
      bestFor: "ممتاز لـ",
      painLevel: "مستوى الألم"
    },
    featureCards: {
      power: { title: "انفجار القوة", desc: "في غضون دقائق، يبدأ المركب في التحرك داخل تيار الدم لزيادة تخليق البروتين." },
      tissue: { title: "بناء النسيج", desc: "تبدأ الألياف العضلية في امتصاص النيتروجين، مما يسرع عملية الاستشفاء العضلي." },
      burn: { title: "حرق ووضوح", desc: "تتحسن عملية التمثيل الغذائي، مما يعطيك مظهراً ممتلئاً وعضلات أكثر بروزاً." }
    },
    title: "خريطة الحقن الآمن",
    subtitle: "دليل تفاعلي لأماكن الحقن العضلي، المخاطر، والأدوات المناسبة.",
    viewFront: "من الأمام",
    viewBack: "من الخلف",
    needleSizeLabel: "مقاس الإبرة",
    maxVolumeLabel: "أقصى كمية",
    painLevelLabel: "مستوى الألم",
    riskLevelLabel: "مستوى الخطورة",
    recoveryLabel: "وقت التعافي",
    lastInjectedLabel: "آخر حقن",
    logInjectionBtn: "سجل حقنة هنا",
    suggestBtn: "اقترح مكاناً",
    suggesting: "جاري الاقتراح...",
    status: { ready: "جاهز", recovering: "في التعافي", warning: "تجنب" },
    riskLevel: "مستوى الخطورة",
    tapToExplore: "اضغط على أي عضلة لمعرفة التفاصيل",
    interactiveMapLabel: "خريطة تفاعلية",
    medicalInsightLabel: "رؤية طبية",
    riskLevels: {
      low: "منخفض",
      high: "عالي"
    },
    goldenHourTitle: "بعد الحقن (The Golden Hour)",
    goldenHourDesc: "بمجرد الحقن، يبدأ التحول! يتدفق المركب ليعيد صياغة أنسجتك، ويزيد من تخليق البروتين فوراً، مما يحول تمرينك القادم إلى انفجار من القوة",
    goldenAdvice: "التدوير هو السر. لا ترهق عضلة واحدة؛ اجعل جسدك خريطة متوازنة للنمو",
    rotationTrackerTitle: "تتبع التدوير الذكي",
    cumulativeGrowthLabel: "النمو التراكمي",
    efficiencyLabel: "كفاءة الامتصاص",
    stimulatedCellsLabel: "خلايا محفزة",
    rotateHint: "اسحب للتدوير ↔️",
    mrxInsightLabel: "نصيحة مستر إكس",
    closeDetailsBtn: "إغلاق التفاصيل",
    comfortableSpot: "الأكثر راحة",
    sites: injectionSitesAr,
  },
  timeUnits: {
    days: "أيام",
    hours: "ساعات",
    minutes: "دقيقة",
    seconds: "ثانية"
  },
  offerExpired: "انتهى العرض!",
  heroEditions: {
    ar: "نسخة عربية",
    en: "English Edition",
    he: "English Edition",
    fr: "English Edition",
    es: "English Edition",
    de: "English Edition",
    it: "English Edition",
    ru: "English Edition",
    tr: "English Edition",
    pt: "English Edition",
    fa: "English Edition",
    ur: "English Edition"
  },
  mealPlanTitle: "خطة الوجبات",
  mealPlanBtn: "توليد خطة",
  mealPlanLoading: "جاري التحضير...",
  mealPlanError: "حدث خطأ",
  timelineTitle: "الجدول الزمني للتحول",
  timelineSubtitle: "ماذا يحدث داخل جسمك أسبوعاً بأسبوع خلال الكورس؟ رحلة بيولوجية كاملة.",
  timelinePhases: [
    { week: "1-2", title: "مرحلة الإطلاق (The Kickstart)", shortDesc: "بداية دخول الهرمون وتغيرات أولية", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "ارتفاع حاد في مستويات الأندروجين في الدم. زيادة احتباس النيتروجين في العضلات.", feeling: "زيادة ملحوظة في الرغبة الجنسية، تحسن المزاج، وشعور بـ 'البمب' المستمر.", action: "التزم بجدول التغذية 100%. اشرب 4 لتر ماء يومياً." } },
    { week: "3-6", title: "مرحلة الانفجار (Hypertrophy Surge)", shortDesc: "النمو العضلي السريع والزيادة الوزنية", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "تشبع المستقبلات. تخليق البروتين في أقصى معدلاته.", feeling: "قوة خرافية في الجيم. الملابس تضيق. شهية مفتوحة.", action: "زد أوزان التمرين. راقب ضغط الدم والإستروجين." } },
    { week: "7-10", title: "مرحلة الصلابة (Hardening)", shortDesc: "ثبات الوزن وبداية حرق الدهون", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "استقرار مستويات الدم. الجسم يبدأ في استخدام الدهون للطاقة بكفاءة.", feeling: "شكل العضلات يصبح أصعب وأكثر تفصيلاً.", action: "ابدأ الكارديو بانتظام. راقب وظائف الكبد." } },
    { week: "11-12", title: "مرحلة الختام (Peaking)", shortDesc: "اللمسات الأخيرة قبل الخروج", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "أقصى كثافة عضلية. الاستعداد لسحب الهرمونات.", feeling: "إرهاق بسيط. جاهزية تامة.", action: "خطط للـ PCT. ابدأ في تقليل السعرات قليلاً." } }
  ],
  timelineLabels: { strength: "القوة", hypertrophy: "الضخامة", water: "احتباس الماء", fatLoss: "حرق الدهون", mood: "المزاج", biologicalTitle: "ماذا يحدث بيولوجياً؟", feelingTitle: "كيف ستشعر؟", actionTitle: "ماذا يجب أن تفعل؟", phaseLabel: "المرحلة" },
  salesToast: { purchased: "اشترى النسخة الكاملة", verified: "موثوق", justNow: "الآن", fromLabel: "من" },
  audioPlayer: { title: "مقدمة صوتية من المؤلف", subtitle: "استمع لرسالة خاصة من جورج موريس", duration: "02:15" },
  aiChat: { fabLabel: "مساعد Mr. X", title: "مستر إكس AI", subtitle: "مساعدك الذكي للإجابة عن الأسئلة", placeholder: "اكتب سؤالك هنا...", send: "إرسال", disclaimer: "الذكاء الاصطناعي قد يخطئ. استشر طبيباً دائماً.", welcomeMessage: "أهلاً يا بطل. أنا نسخة الذكاء الاصطناعي من مستر إكس. كيف أقدر أساعدك اليوم في تمرينك أو تغذيتك؟" },
  quiz: {
    title: "هل أنت جاهز للكورس؟",
    subtitle: "اختبار سريع يحدد مستواك وما إذا كنت مستعداً لدخول عالم الهرمونات أو تحتاج للمزيد من الأساسيات.",
    startBtn: "ابدأ الاختبار",
    questionLabel: "سؤال",
    totalLabel: "الإجمالي",
    questions: [
      {
        question: "كم سنة تدريب منتظم ومستمر لديك؟",
        options: [
          { text: "أقل من 3 سنوات", score: 0 },
          { text: "أكثر من 5 سنوات", score: 1 }
        ]
      },
      {
        question: "ما هي نسبة دهونك الحالية؟",
        options: [
          { text: "فوق 15% (يوجد دهون ظاهرة)", score: 0 },
          { text: "أقل من 12% (عضلات البطن ظاهرة)", score: 1 }
        ]
      },
      {
        question: "هل تزن طعامك وتحسب سعراتك بدقة يومياً؟",
        options: [
          { text: "أحياناً / آكل طعام صحي فقط", score: 0 },
          { text: "نعم، بالميزان وبالجرام", score: 1 }
        ]
      },
      {
        question: "هل تعرف ما هو الـ PCT (بروتوكول التنظيف)؟",
        options: [
          { text: "سمعت عنه / لا أعرفه جيداً", score: 0 },
          { text: "نعم، أعرف أدوية SERMs و HCG", score: 1 }
        ]
      },
      {
        question: "هل قمت بتحليل وظائف الكلى والكبد والهرمونات مؤخراً؟",
        options: [
          { text: "لا / منذ فترة طويلة", score: 0 },
          { text: "نعم، وأعرف أرقامي جيداً", score: 1 }
        ]
      }
    ],
    results: {
      natural: {
        title: "خليك طبيعي (حالياً)",
        desc: "أنت تمتلك إمكانيات كبيرة للتطور الطبيعي. استخدام الهرمونات الآن قد يضرك أكثر مما ينفعك لأن أساساتك (التغذية/التدريب) تحتاج لضبط. هذا الكتاب سيساعدك في الوصول لأقصى إمكاناتك الطبيعية وتجهيزك للمستقبل.",
        cta: "احصل على الكتاب لتعظيم نتائجك"
      },
      enhanced: {
        title: "أنت جاهز للمستوى التالي",
        desc: "لديك الخبرة والأساس القوي. الخطوة القادمة تتطلب علماً دقيقاً لحمايتك. أنت لا تحتاج لنصائح عشوائية، بل تحتاج لمنهج علمي صارم وجداول دقيقة كما في هذا الكتاب.",
        cta: "احصل على الكتاب وابدأ الكورس"
      }
    }
  },
  dailyIQ: {
    title: "تحدي الـ Steroid IQ اليومي",
    subtitle: "سؤال واحد جديد كل 24 ساعة. جاوب صح واحصل على خصم فوري.",
    challengeLabel: "تحدي اليوم",
    winTitle: "إجابة صحيحة! يا وحش",
    winDesc: "لقد أثبتت خبرتك. ها هو كود الخصم الخاص بك (صالح لمدة 60 دقيقة فقط).",
    loseTitle: "إجابة خاطئة",
    loseDesc: "لا تقلق، التعلم جزء من اللعبة. عد غداً لسؤال جديد ومحاولة أخرى.",
    explanationLabel: "الشرح:",
    copySuccess: "تم نسخ الكود بنجاح!",
    toastCorrect: "رائع! تم تفعيل كוד الخصم بنجاح.",
    couponLabel: "كود الخصم",
    claimBtn: "نسخ الكود والشراء",
    expiresIn: "ينتهي العرض في:",
    comeBackTomorrow: "السؤال القادم متاح خلال:",
    questions: [
      {
        id: 1,
        question: "ما هو الفارق الأساسي بين النولفادكس (Nolvadex) والكلوميد (Clomid) في الـ PCT؟",
        options: ["كلاهما نفس الشيء تماماً", "النولفادكس أفضل لمنع الجينو، الكلوميد أقوى لتحفيز الـ LH", "الكلوميد يمنع الجينو أفضل من النولفادكس", "النولفادكس هو مضاد أروماتيز (AI)"],
        correctIndex: 1,
        explanation: "النولفادكس يمنع ارتباط الاستروجين بالثدي (يمنع الجينو)، بينما الكلوميد يعمل بشكل أقوى على الغدة النخامية لرفع الـ LH وعودة التستوستيرون."
      },
      {
        id: 2,
        question: "ما هو متوسط فترة نصف العمر (Half-Life) لـ Testosterone Enanthate؟",
        options: ["24 ساعة", "2-3 أيام", "4.5-5 أيام", "14 يوم"],
        correctIndex: 2,
        explanation: "نصف عمر التست إنثات يتراوح علمياً بين 4.5 إلى 5 أيام، مما يجعله مناسباً للحقن مرتين أسبوعياً."
      },
      {
        id: 3,
        question: "أي من المواد التالية يعتبر الأكثر سمية للكبد (Hepatotoxic)؟",
        options: ["Testosterone Propionate", "Injectable Primobolan", "Dianabol (Oral)", "Deca Durabolin"],
        correctIndex: 2,
        explanation: "المواد الفموية (Orals) تكون معدلة بـ 17-alpha-alkylated للمرور من الكبد، مما يسبب إجهاداً عالياً له."
      }
    ]
  },
  cycleArchitect: {
    title: "المزامنة الذكية لجدول الكورس (Smart Cycle Synchronizer)",
    subtitle: "صمم بروتوكولك بدقة، واحصل على جدول تنفيذي حي (ICS) مع تدوير الحقن وتحديد موعد التنظيف.",
    presetsTitle: "قوالب جاهزة:",
    configLabel: "الإعدادات",
    stealthModeLabel: "وضع الخصوصية (أسماء وهمية)",
    rotationLabel: "تدوير أماكن الحقن تلقائياً",
    pctLabel: "تحديد موعد بداية التنظيف (PCT)",
    toggleStealth: "تبديل وضع الخصوصية",
    toggleRotation: "تبديل تدوير الحقن",
    togglePct: "تبديل التنظيف التلقائي",
    stealthAliases: ["تمرين كارديو", "فيتامينات", "اجتماع عمل", "جلسة علاج طبيعي", "موعد جيم"],
    rotationSites: ["مؤخرة يمين (Dorso)", "مؤخرة يسار (Dorso)", "كتف أيمن", "كتف أيسر", "فخذ أيمن خارجي", "فخذ أيسر خارجي"],
    presets: {
      beginnerBulk: "تضخيم للمبتدئين",
      cutting: "تنشيف متقدم",
      trt: "علاج تعويضي (TRT)"
    },
    form: {
      startDateLabel: "تاريخ البدء",
      compoundLabel: "المادة",
      dosageLabel: "الجرعة (ملجم)",
      frequencyLabel: "التكرار",
      weeksLabel: "المدة (أسبوع)",
      halfLifeLabel: "نصف العمر (أيام) - لحساب التنظيف",
      addCompoundBtn: "أضف مادة",
      removeBtn: "حذف",
      frequencies: {
        daily: "يومياً (ED)",
        eod: "يوم بعد يوم (EOD)",
        twiceWeekly: "مرتين أسبوعياً (Mon/Thu)",
        weekly: "أسبوعياً (Once)"
      }
    },
    premiumLock: {
      lockedTitle: "ميزة حصرية للمشتركين",
      lockedDesc: "تصدير الجدول الزمني الذكي مع ميزات التدوير وحماية الخصوصية وحساب الـ PCT متاح فقط للمشتركين.",
      verifyBtn: "التحقق من الشراء وفتح الميزة",
      exportBtn: "تصدير للتقويم (.ics)",
      placeholder: "أدخل بريدك الإلكتروني أو رقم الطلب",
      successMsg: "تم التحقق! الميزة مفتوحة الآن.",
      errorMsg: "لم يتم العثور على طلب بهذا البيانات.",
      demoHint: "جرّب \"demo\" للفتح الفوري"
    },
    pctEventSummary: "🔰 ابدأ بروتوكول التنظيف (PCT) 🔰",
    pctEventDescription: "انتهت فترة بقاء الهرمون في الجسم. ابدأ أدوية التنظيف (SERMs) الآن.",
    stealthPctAlias: "بداية مرحلة الاستشفاء"
  },
  units: {
    mg: "مجم",
    g: "جم",
    ml: "مل",
    kcal: "سعرة",
    days: "أيام",
    weeks: "أسابيع",
    percentage: "%",
    liters: "لتر",
    ed: "يومياً",
    eod: "يوم بعد يوم",
    twiceWeekly: "مرتين أسبوعياً",
    weekly: "أسبوعياً"
  },

};


export const heContent: ContentStrings = {
  ...enContent,
  navAiTools: "כלי AI למפתח הגוף",

  navPremiumResources: "משאבי פרימיום",
  navFeatures: "תכונות",
  navToolNames: {
    macro: "מחשבון מאקרו",
    injection: "מפת הזרקות",
    halflife: "סימולטור זמן מחצית חיים",
    lab: "פענוח בדיקות דם",
    genetic: "פוטנציאל גנטי",
    cycleArchitect: "מתכנן סייקלים",
  },
  themeNames: {
    light: "מצב בהיר",
    dark: "מצב כהה",
    system: "מצב מערכת",
  },
  backToHome: "חזרה לדף הבית",
  homeLink: "בית",
  seoTitle: "מר איקס-סטרואיד Mr. X-Steroid | המדריך המלא לפיתוח גוף וסטרואידים",
  seoDescription: "גלו את המדריך המדעי החזק ביותר לבניית שרירים וסייקלים הורמונליים. הספר מר איקס-סטרואיד מאת ג'ורג' מוריס מציע טבלאות תזונה, פרוטוקולי הגנה ומדריך תוספים מלא.",
  seoKeywords: ["פיתוח גוף", "סטרואידים", "הורמונים", "בניית שריר", "חיטוב", "מסה", "קרוספיט", "כושר", "בריאות", "ג'ורג' מוריס"],
  purchaseSuccess: "הרכישה הושלמה בהצלחה! כעת תוכל לגשת לכל תכונות הפרימיום.",
  loginTitle: "התחברות",
  signupTitle: "הרשמה",
  emailLabel: "כתובת אימייל",
  passwordLabel: "סיסמה",
  nameLabel: "שם מלא",
  loginBtn: "התחבר",
  signupBtn: "צור חשבון",
  noAccount: "אין לך חשבון?",
  haveAccount: "כבר יש לך חשבון?",
  invalidCredentials: "אימייל או סיסמה לא תקינים",
  signupSuccess: "החשבון נוצר! אנא בדוק את האימייל לאימות.",
  logout: "התנתק",
  welcomeUser: "ברוך הבא",
  loginWithGoogle: "התחבר עם גוגל",
  loginWithMicrosoft: "התחבר עם מיקרוסופט",
  orDivider: "או",

  heroTitle: "מר איקס-סטרואיד Mr. X-Steroid",
  heroSubtitle: "גלה את המדריך האולטימטיבי לבניית שרירים וסייקלים הורמונליים: גישה מדעית מקיפה המגובה בגרפים מפורטים וטבלאות קלות להבנה. גלה את סודות ההורמונים האנאבוליים עם תוכניות מעשיות וברורות שיעזרו לך להשיג כוח עצום ופיזיק מחוטב וחזק.",
  heroCta: "קבל את העותק שלך עכשיו",
  downloadPreview: "הורד הצצה חינם (PDF)",
  audioPreviewBtn: "האזן להקדמה",
  authorSection: "על המחבר",
  authorName: "ג'ורג' מוריס",
  authorBio: "המחבר ומעצב העטיפה, ג'ורג' מציג מדריך שהוא לא רק מידע – הוא שריון. ספר זה הוא מסר לכל מאמן וספורטאי שמאמין שידע ומדע הם הבסיס למצוינות.",
  featuresTitle: "מה תמצא בפנים?",
  sneakPeekTitle: "הצצה בלעדית",
  sneakPeekSubtitle: "ראה כיצד נראות טבלאות סייקל מקצועיות. חלק 1 זמין; השאר מוצפן להגנה על התוכן.",
  unlockText: "קנה את הספר לפתיחת המינונים המלאים",
  buyNow: "קנה עכשיו",
  contact: "צור קשר",
  copyright: "כל הזכויות שמורות © 2025 ג׳ורג׳ מוריס",
  features: [
    {
      title: "טבלאות הורמונים מקיפות: מאפס למקצוען",
      description: "די למנחש ולסמוך על 'עצות מחדר הכושר'. הספר מספק טבלאות סייקל מובנות מדעית, שמובילות אותך בבטחה מרמת מתחיל למתקדם. תוכניות מסה וחיטוב עם מינונים וזמנים מדויקים.",
      iconKey: "chart"
    },
    {
      title: "אמנות ה-'יציאה הבטוחה': פרוטוקולי PCT קפדניים",
      description: "להתחיל סייקל זה קל; לצאת בבטחה זו האמנות. הספר מפרט כיצד להגן על המערכת ההורמונלית ולהחזיר את ייצור הטסטוסטרון הטבעי כדי למנוע איבוד שריר ודיכאון. תוכניות PCT מוכחות עם תרופות ומינונים.",
      iconKey: "exit"
    },
    {
      title: "מדריך תוספים: האמת, ללא שיווק",
      description: "חסוך את הכסף שלך. הפסק לקנות אבקות חסרות תועלת. המדריך חושף אילו תוספים באמת עובדים (כמו קריאטין, חלבון, חומצות אמינו) וחושף את התרמיות המסחריות שמרוקנות לך את הארנק.",
      iconKey: "shield"
    }
  ],
  testimonialsTitle: "מה אומרים הלקוחות?",
  testimonials: [
    { name: "אחמד ס.", title: "מפתח גוף חובב", text: "הייתי אבוד בתוך המידע הסותר באינטרנט. הספר הזה העלה אותי על המסלול הנכון וחסך לי שנים של ניסוי וטעייה." },
    { name: "מוחמד א.", title: "מאמן אישי", text: "מקור חובה לכל מאמן שרוצה להיות ישר עם הלקוחות שלו ולהגן על בריאותם." },
    { name: "כרים מ.", title: "אלוף מקומי", text: "הטבלאות בספר הזה מדויקות להפליא ועזרו לי להגיע לצורה הטובה ביותר בחיי." }
  ],
  faqTitle: "שאלות נפוצות",
  faqSubtitle: "תשובות ישירות לשאלות הנפוצות ביותר",
  faqSearchPlaceholder: "חפש שאלות...",
  faqCategories: { all: "הכל", safety: "בטיחות", general: "כללי", legal: "חוקי", women: "נשים", strategy: "אסטרטגיה" },
  faqs: [
    { question: "האם הספר מתאים למתחילים?", answer: "כן, הספר מתחיל מהיסודות ומסביר הכל בצורה פשוטה ומדעית, כולל טבלאות למתחילים.", category: "general" },
    { question: "האם זה חוקי?", answer: "הספר הוא למטרות חינוכיות ומידע בלבד. האחריות על השימוש במידע היא על הקורא בלבד בהתאם לחוקי מדינתו.", category: "legal" },
    { question: "איך מקבלים את הספר לאחר התשלום?", answer: "מיד לאחר השלמת התשלום, יישלח אליך אימייל עם קישור ישיר להורדת הספר בפורמט PDF.", category: "general" },
    { question: "מה הופך את 'Mr. X-Steroid' לשונה ממדריכי פיתוח גוף אחרים?", answer: "רוב המדריכים מלאים במינוחים רפואיים משעממים. חוללנו מהפכה על ידי ריכוז מדע מורכב לטבלאות קלות לקריאה ולביצוע. בין אם אתה מתחיל או ספורטאי מתקדם, אתה מקבל מפת דרכים ויזואלית ברורה לפיזיק החלומות שלך בלי כאבי ראש.", category: "general" },
    { question: "האם הספר הזה מתאים למתחילים?", answer: "בהחלט! 💯 אנחנו מתחילים מאפס. אתה לא צריך תואר רפואי כדי להבין את הסייקלים שלנו. אנחנו מדריכים אותך צעד אחר צעד, ומסבירים את ה-'מה, למה ואיך' של כל חומר, מה שמבטיח שלעולם לא תרגיש אבוד.", category: "general" },
    { question: "האם זה באמת יעזור לי לשבור את הפלטו (תקיעה)?", answer: "כן. אם ההישגים שלך נעצרו, זו כנראה בעיה אסטרטגית. 'Mr. X-Steroid' מספק טכניקות שילוב (Stacking) מתקדמות והתאמות סייקל שיזרקו את השרירים בחזרה למצב צמיחה. תגיד שלום לסטגנציה! 🚀", category: "general" },
    { question: "איך אני מבטיח שאשאר בריא בזמן סייקל?", answer: "בטיחות היא האובססיה שלנו. 🛡️ אנו מספקים מדריכים מקיפים לצמצום נזקים, כולל איך לקרוא את האותות של הגוף שלך והצורך המוחלט בבדיקות דם. אנו מלמדים אותך איך להפחית סיכונים, לא להתעלם מהם.", category: "safety" },
    { question: "מה לגבי תופעות לוואי? האם אני יכול להימנע מהן?", answer: "למרות שאין סייקל ללא סיכון, ידע הוא ההגנה הטובה ביותר שלך. אנו מקדישים חלקים שלמים לניהול רמות אסטרוגן, הגנה על הכבד ומניעת נשירת שיער. אנו נותנים לך את הפרוטוקולים למזעור תופעות הלוואי ושמירה על הגוף שלך פועל בצורה חלקה.", category: "safety" },
    { question: "האם אתם מכסים טיפול שאחרי סייקל (PCT)?", answer: "סייקל לא נגמר עד שה-PCT מסתיים. 🔄 אנחנו לא משאירים אותך תלוי; אנו מספקים פרוטוקולי PCT מפורטים כדי לעזור להחזיר את ייצור הטסטוסטרון הטבעי שלך ולשמור על השריר שעמלת כל כך קשה לבנות.", category: "safety" },
    { question: "האם 'Mr. X-Steroid' מעודד פעילות בלתי חוקית?", answer: "לא. 🚫 החומר הזה מיועד אך ורק למטרות מידע, חינוך וצמצום נזקים. אנו מאמינים שאם מבוגרים בוחרים להשתמש בחומרים אלו, עליהם לקבל גישה לנתונים מדעיים מדויקים כדי למנוע טעויות מסוכנות.", category: "legal" },
    { question: "האם אני יכול להסתבך בגלל בעלות על הספר הזה?", answer: "בהחלט לא. החזקת ידע היא זכות יסוד. 📚 אתה פשוט רוכש משאב חינוכי מקיף. עם זאת, רכישה ושימוש בחומרים אנאבוליים כפופים לחוקים המקומיים, שאנו ממליצים לך לכבד.", category: "legal" },
    { question: "האם אתם מוכרים סטרואידים באתר זה?", answer: "לעולם לא. אנו מוכרים מומחיות, אסטרטגיה ומידע. אנו לא מוכרים, מפיצים או מעודדים מכירה של חומרים מבוקרים. אנחנו המאמנים שלך, לא הסוחרים שלך.", category: "legal" },
    { question: "האם שימוש באסטרטגיות אלו יגרום לי להיראות כמו גבר?", answer: "לא עם ההדרכה שלנו! 🙅‍♀️ המראה ה'מנופח' מגיע לעיתים קרובות משימוש בחומרים או במינונים לא נכונים. ה-'Women’s Zone' שלנו מתמקד בסייקלים בטוחים וידידותיים לנשים המיועדים לחיטוב, איבוד שומן ושריר רזה - שמירה על הנשיות שלך תוך הגברת הכוח שלך.", category: "women" },
    { question: "אילו חומרים בטוחים לנשים?", answer: "אנו מדגישים במיוחד חומרים עם דירוג אנדרוגני נמוך (כמו Anavar או Primobolan) הפופולריים בקרב דוגמניות פיטנס. אנו אומרים לך בדיוק ממה להימנע כדי למנוע סימני גבריות.", category: "women" },
    { question: "האם נשים יכולות לעקוב אחרי אותם סייקלים כמו גברים?", answer: "ממש לא! הפיזיולוגיה הנשית היא ייחודית. אנו מספקים טבלאות מותאמות אישית במיוחד לנשים, תוך התאמת מינונים ואורך סייקל כדי להבטיח תוצאות מבלי לפגוע באיזון ההורמונלי. 🌸", category: "women" },
    { question: "מסה (Bulking) מול חיטוב (Cutting): האם הספר מכסה את שניהם?", answer: "יש לנו 'מפות סייקל' ספציפיות לכל מטרה. אתה פשוט בוחר את היעד שלך, ואנחנו מראים לך את הדרך.", category: "strategy" },
    { question: "איך אני יודע איזה שילוב (Stack) מתאים לי?", answer: "אנו מסווגים שילובים לפי רמת ניסיון (מתחיל, בינוני, מקצוען). אתה לא תתחיל בטעות סייקל של מקצוענים ביום הראשון. אנו עוזרים לך להתקדם ברמות בצורה לוגית כדי למקסם את ההישגים ולמזער את ההפתעות.", category: "strategy" },
    { question: "מהי גישת ה-'Smart Cycle'?", answer: "מדובר בתזמון וסינרגיה. ⏱️ אנו מלמדים אותך איך לסנכרן את עוצמת האימון והתזונה שלך עם שבועות השיא של הסייקל שלך. זה לא רק לקחת משהו; זה להתאים את כל אורח החיים שלך לאפקט של 'X-Steroid'.", category: "strategy" },
    { question: "האם יש תמיכה לאחר הרכישה?", answer: "בוודאי. לקוחות חבילת הפרו מקבלים גישה לקהילה הפרטית שלנו לשאלות ותמיכה.", category: "general" }
  ],
  privacyPolicy: "מדיניות פרטיות",
  termsOfService: "תנאי שימוש",
  refundPolicy: "מדיניות החזרים",
  legalDisclaimer: "הצהרה משפטית",
  aboutUs: "עלינו",
  legal: "משפטי",
  quickLinks: "קישורים מהירים",
  privacyPolicyContent: "אנו מכבדים את הפרטיות שלך ומחויבים להגן על המידע האישי שלך. המידע שנאסף משמש אך ורק לעיבוד הזמנות ולשיפור השירות שלנו. איננו משתפים את פרטיך עם צדדים שלישיים ללא הסכמתך.",
  termsOfServiceContent: "בעצם השימוש באתר זה ובביצוע רכישה, אתה מסכים לתנאי השימוש שלנו. המידע באתר מיועד למטרות חינוכיות בלבד ואין לראות בו ייעוץ רפואי.",
  refundPolicyContent: "בשל האופי הדיגיטלי של הספר, לא ניתן לבצע החזר כספי לאחר שליחת קישור ההורדה. אם נתקלת בבעיה טכנית, אנא צור קשר עם התמיכה.",
  pricingTitle: "בחר את התוכנית שלך",
  pricingSubtitle: "השקעה קטנה בבריאות ובידע שלך תחסוך לך אלפי דולרים וסיכונים אינסופיים.",
  pricingTiers: [
    { name: "חבילת המקצוענים", price: "$49.99", originalPrice: "$79.99", description: "הספר המלא + כלים בלעדיים", features: ["הספר המלא (300+ עמודים)", "מחשבון מינונים (Excel)", "גישה לקהילה פרטית", "מדריך תוספים בונוס"], buttonText: "רב מכר", isPopular: true, popularLabel: "התמורה הטובה ביותר" },
    { name: "חבילת אימון", price: "$199.99", description: "אימון אישי + הספר", features: ["כל התכונות של המקצוענים", "ייעוץ אונליין (30 דקות)", "עיצוב סייקל מותאם אישית", "מעקב למשך חודש"], buttonText: "התחל שינוי" }
  ],
  disclaimerTitle: "אזהרה חשובה וכתב ויתור",
  disclaimerContent: fullHebrewDisclaimer,
  agreeButton: "אני מסכים ולוקח אחריות מלאה ואני מעל גיל 18",
  disclaimerAcknowledgement: "בלחיצה על הכפתור למטה, אתה מאשר שקראת, הבנת והסכמת לכל התנאים המפורטים לעיל.",
  importantDisclaimer: "אזהרה חשובה",
  downloadFullBook: "הורד את הספר המלא",
  processing: "מעבד...",

  benefitsTitle: "מדוע \"Mr. X-Steroid\" הוא ההשקעה הטובה ביותר שלך?",
  benefitsSubtitle: "אנחנו לא רק מוכרים דפים; אנחנו מוכרים לך שנים של ניסיון ומדע מזוקק כדי לקצר את הדרך שלך לפסגה.",
  benefits: [
    { title: "החזר השקעה מקסימלי 💰", description: "הפסק לנחש, תתחיל לגדול. קבל למעלה מ-100 טבלאות מחזור מוכחות כתוכנית עבודה ישירה לפיזיק החלומות שלך.", iconKey: "roi" },
    { title: "בטיחות בדרגה רפואית 🛡️", description: "למד לנהל תופעות לוואי ולבצע PCT כמו מקצוען עם פרוטוקולים רפואיים בלעדיים.", iconKey: "safety" },
    { title: "0% ברו-סיינס, 100% אמת 🧪", description: "אנחנו לא ממומנים על ידי חברות תוספים. רק עובדות מדעיות עירומות ואסטרטגיות של אלופים.", iconKey: "truth" },
    { title: "מדע מורכב, מפושט חזותית 🚀", description: "פענחנו אנדוקרינולוגיה מורכבת לתרשימים חזותיים קלים למעקב. פשטות של מדריך למשתמש.", iconKey: "simplified" },
    { title: "יתרון ה\"מחזור החכם\" 🧠", description: "סנכרן את התזונה והאימונים בדיוק לשיא ההורמונלי שלך לטרנספורמציה אגדית.", iconKey: "smart" }
  ],
  whoIsTitle: "למי מיועד הספר?",
  whoIsSubtitle: "התוכן תוכנן בקפידה עבור:",
  targetAudiences: [
    { title: "מפתח גוף מתחיל", description: "שרוצה לקצר את הדרך על בסיס מדעי.", iconKey: "athlete" },
    { title: "מאמן מקצועי", description: "שמחפש מקור אמין לבניית תוכניות.", iconKey: "coach" },
    { title: "מודע לבריאות", description: "שרוצה להבין את ההשפעות ולמנוע נזק.", iconKey: "shield" }
  ],
  whoIsClosing: "אם אתה חלק מאלה, הספר הזה הוא ההשקעה הטובה ביותר שלך.",
  whoIsCta: "התחל את השינוי עכשיו",
  checkoutTitle: "תשלום מאובטח",
  billingDetails: "פרטי חיוב",
  fullName: "שם מלא",
  emailAddress: "כתובת אימייל",
  paymentMethod: "שיטת תשלום",
  creditCard: "כרטיס אשראי",
  cardNumber: "מספר כרטיס",
  expiryDate: "תוקף",
  cvc: "CVC",
  payNow: "שלם עכשיו",
  cancel: "ביטול",
  orderSummary: "סיכום הזמנה",
  total: "סה״כ",
  secureCheckout: "תשלום מאובטח בטכנולוגיית SSL",
  aboutPageTitle: "על מר איקס-סטרואיד",
  aboutPageContent: "מר איקס-סטרואיד הוא הפרויקט המוביל במזרח התיכון להנגשת ידע מדעי בתחום פיתוח הגוף והשימוש המושכל בהורמונים. אנו מאמינים שידע הוא הכוח החזק ביותר להשגת תוצאות תוך שמירה על הבריאות.",
  aboutPageStoryTitle: "הסיפור שלנו",
  aboutPageStory: "מה שהתחיל כבלוג קטן של חובבי כושר, הפך למקור המידע האמין ביותר עבור אלפי ספורטאים. זיהינו את הפער העצומה בין המיתוסים בחדר הכושר לבין המדע האמיתי, והחלטנו לגשר עליו.",
  aboutPageMissionTitle: "המשימה שלנו",
  aboutPageMission: "המשימה שלנו היא להפסיק את הניחושים בחדר הכושר, להנגיש פרוטוקולים בטוחים המבוססים על מחקר, ולהגן על הדור הבא של הספורטאים מפני טעויות קריטיות.",
  labReference: {
    title: "המרجع החכם לבדיקות מעבדה",
    subtitle: "הבן את תוצאות בדיקות הדם שלך בעצמך. מדריך זה עוזר לזהות סימני אזהרה.",
    searchPlaceholder: "חפש שם בדיקה (למשל: Test, ALT)...",
    noResults: "לא נמצאו תוצאות",
    analyzeBtn: "נתח תוצאה",
    analyzeTitle: "הזן תוצאה",
    enterValue: "ערך",
    resultLabel: "סטטוס",
    status: { low: "נמוך", normal: "תקין", high: "גבוה" },
    categories: { all: "הכל", hormones: "הורמונים", organs: "איברים", blood: "לב וכלי דם", vitamins: "ויטמינים", minerals: "מינרלים", thyroid: "בלוטת התריס" },
    labels: { whatIsIt: "מה זה?", normalRange: "טווח תקין", elevationMeaning: "משמעות חריגה", lowMeaning: "משמעות חוסר", management: "המלצות", cancel: "ביטול", high: "גבוה", low: "נמוך" },
    tests: labTestsHe,
  },
  injectionMap: {
    labels: {
      left: "שמאל",
      right: "ימין",
      days: "ימים",
      injectionSteps: "שלבי הזרקה",
      selectPoint: "בחר נקודת הזרקה",
      efficiency: "יעילות ספיגה",
      recovery: "זמן התאוששות",
      bestFor: "מתאים ל",
      painLevel: "רמת כאב"
    },
    featureCards: {
      power: { title: "התפוצצות כוח", desc: "תוך דקות, החומר מתחיל לזרום כדי למקסם סינתזת חלבון." },
      tissue: { title: "בניית רקמות", desc: "סיבי השריר מתחילים לאגור חנקן, מה שמאיץ את ההתאוששות." },
      burn: { title: "שיפור חיטוב", desc: "חילוף החומרים מואץ, מה שמעניק מראה שרירי וחטוב יותר." }
    },
    title: "מפת הזרקות בטוחה",
    subtitle: "מדריך אינטראקטיבי לאתרי הזרקה תוך-שרירית, סיכונים וכלים.",
    viewFront: "מבט קדמי",
    viewBack: "מבט אחורי",
    needleSizeLabel: "גודל מחט",
    maxVolumeLabel: "נפח מקסימלי",
    painLevelLabel: "רמת כאב",
    riskLevelLabel: "רמת סיכון",
    recoveryLabel: "זמן התאוששות",
    lastInjectedLabel: "הזרקה אחרונה",
    logInjectionBtn: "תעד הזרקה",
    suggestBtn: "הצע אתר",
    suggesting: "מציע...",
    status: { ready: "מוכן", recovering: "בהתאוששות", warning: "הימנע" },
    riskLevel: "רמת סיכון",
    tapToExplore: "לחץ על שריר לפרטים",
    interactiveMapLabel: "מפה תפעולית אינטראקטיבית",
    medicalInsightLabel: "תובנה רפואית",
    riskLevels: {
      low: "נמוך",
      high: "גבוה"
    },
    goldenHourTitle: "אחרי ההזרקה (שעת הזהב)",
    goldenHourDesc: "השינוי מתחיל מיד! החומר זורם ומעצב מחדש את הרקמות, מגביר סינתזת חלבון מיידית והופך את האימון הבא שלך להתפרצות של כוח.",
    goldenAdvice: "רוטציה היא הסוד. אל תתיש שריר אחד; הפוך את הגוף שלך למפה מאוזנת של גדילה.",
    rotationTrackerTitle: "מעקב רוטציה חכם",
    cumulativeGrowthLabel: "גדילה מצטברת",
    efficiencyLabel: "יעילות ספיגה",
    stimulatedCellsLabel: "תאים מגורים",
    rotateHint: "גרור לסיבוב ↔️",
    mrxInsightLabel: "התובנה של מר איקס",
    closeDetailsBtn: "סגור פרטים",
    comfortableSpot: "הנוח ביותר",
    sites: injectionSitesHe,
  },
  contactPageTitle: "צור קשר",
  contactPageSubtitle: "אנחנו כאן לכל שאלה",
  contactFormNamePlaceholder: "השם שלך",
  contactFormEmailPlaceholder: "האימייל שלך",
  contactFormMessagePlaceholder: "ההודעה שלך",
  contactFormSubjectPlaceholder: "נושא",
  contactFormSubmit: "שלח הודעה",
  contactFormSuccessMessage: "הודעתך נשלחה בהצלחה!",
  contactInfoAddress: "דובאי, איחוד האמירויות",
  contactInfoEmail: "support@mrxsteroid.com",
  contactInfoPhone: "+971 XXX XXX XXX",
  contactInfoHours: "24/7 תמיכה",
  viewOnMap: "צפה במפה",
  cookieTitle: "עוגיות ופרטיות",
  cookieMessage: "אנו משתמשים בעוגיות כדי לשפר את החוויה שלך.",
  cookieAccept: "אשר",
  cookieReject: "דחה",
  calcTitle: "מחשבון מאקרו מתקדם",
  calcSubtitle: "חשב את הסעורת והמאקרו המדויקים שלך לפי היעדים",
  calcGender: "מין",
  calcMale: "גבר",
  calcFemale: "אישה",
  calcAge: "גיל",
  calcWeight: "משקל",
  calcHeight: "גובה",
  calcActivity: "רמת פעילות",
  calcTrainingStyle: "סגנון אימון",
  calcGoal: "יעד",
  calcCalculate: "חשב עכשיו",
  calcResults: "התוצאות שלך",
  calcCalories: "קלוריות",
  calcProtein: "חלבון",
  calcCarbs: "פחמימות",
  calcFats: "שומנים",
  calcCta: "קבל תוכנית מותאמת אישית",
  calcSmartMode: "מצב חכם",
  calcBodyFat: "אחוז שומן",
  calcWater: "צריכת מים מומלצת",
  calcLiters: "ליטרים",
  calcRecalculate: "חשב מחדש",
  calcGenerateMealPlan: "צור תוכנית ארוחות",
  calcGenerating: "יוצר תוכנית...",
  calcMealPlanTitle: "תוכנית תזונה מוצעת",
  calcMealPlanSubtitle: "ארוחות מבוססות על המאקרו שלך",
  calcDisclaimer: "הערכים הם הערכה בלבד. התייעץ עם תזונאי.",
  calcTdeeLabel: "הוצאה אנרגטית יומית (TDEE)",
  calcBmrLabel: "קצב חילוף חומרים בסיסי (BMR)",
  calcTefLabel: "אפקט תרמי של מזון (TEF)",
  calcBeastTitle: "מצב 'חיה' מופעל",
  calcAnalysisLabel: "ניתוח מנוע חכם",
  calcBmiStatusLabel: "סטטוס BMI",
  calcShuffleLabel: "ערבב ארוחות",
  calcAwaitingInputLabel: "ממתין לנתוני שריר",
  calcAiEngineLabel: "מנוע מבוסס AI",
  calcAnalyzingLabel: "מנתח נתונים...",
  calcMetabolicActiveLabel: "פעילות מטבולית פעילה",
  calcAnabolicPotentialLabel: "פוטנציאל אנבולי צפוי",
  calcWindowBtn: "צפה בתוכנית המלאה",
  calcTrainingTime: "זמן אימון",
  calcTrainingWindows: {
    morning: "בוקר",
    afternoon: "צהריים",
    evening: "ערב",
    advice: "מכיוון שהאימון שלך ב{time}، אנו ממליצים לרכז 40% מהפחמימות סביב חלון האימון."
  },
  calcPredictionTitle: "תחזית התקדמות",
  calcBeastNames: { cut: "לוחם חיטוב", maintain: "מכונת שימור", bulk: "ענק מסה" },
  calcPredictions: { cut: "איבוד שומן מואץ", maintain: "רה-קומפוזיציה", bulk: "צמיחת שריר מקסימלית" },
  calcSelectGoal: { cut: "חיטוב יבש", maintain: "שמירה ושיפור", bulk: "מסה נקייה" },
  calcMealNames: ["ארוחת בוקר", "ארוחת צהריים", "לפני אימון", "ארוחת ערב"],
  calcActivityLevels: { sedentary: "יושבני", light: "פעיל מעט", moderate: "פעילות מתונה", active: "פעיל מאוד", veryActive: "ספורטאי מקצועי" },
  calcTrainingStyles: { hypertrophy: "היפרטרופיה", strength: "כוח", endurance: "סיבולת" },
  geneticCalculator: {
    title: "מחשבון פוטנציאל גנטי",
    subtitle: "כמה שריר אתה יכול לבנות בפיזיולוגיה שלך?",
    labels: {
      height: "גובה",
      wrist: "היקף שורש כף יד",
      ankle: "היקף קרסול",
      bodyFat: "אחוז שומן רצוי",
      frameSize: "מבנה שלד",
      boneThickness: "עובי עצם",
      lowerBody: "מבנה גוף תחתון",
      shoulders: "היקף כתפיים (ס״מ)",
      chest: "היקף חזה (ס״מ)",
      waist: "היקף מותניים (ס״מ)",
      thigh: "היקף ירך (ס״מ)",
      calf: "היקף תאומים (ס״מ)",
      current: "נוכחי",
      potential: "פוטנציאל",
      analysis: "ניתוח קייסי באט",
      roadmap: "מפת דרכים שרירית",
      ffmi: "מדד מסה ללא שומן (FFMI)",
      goldenRatio: "יחס הזהב",
      physiqueScore: "ציון פיזיק"
    },
    modelLabel: "מבוסס על מודל Casey Butt",
    awaitingDataTitle: "ממתין לנתונים...",
    frameOptions: { small: "קטן", medium: "בינוני", large: "רחב" },
    unknownMeasurements: "לא בטוח לגבי המדידות?",
    cta: "נתח פוטנציאל",
    reset: "איפוס",
    yourBodyType: "סוג הגוף שלך",
    resultTitle: "תחזית מסה מקסימלית",
    naturalLabel: "פוטנציאל טבעי",
    enhancedLabel: "פוטנציאל 'משופר'",
    differenceLabel: "ההפרש הצפוי",
    disclaimer: "התוצאות מבוססות על נוסחאות מדעיות והערכות סטטיסטיות.",
    unlockMsg: "לפתח את הפוטנציאל המלא? קנה את הספר.",
    errorMsg: "אנא מלא את כל השדות.",
    bodyTypes: {
      ecto: "אקטומורף (Ectomorph)",
      meso: "מזומורף (Mesomorph)",
      endo: "אנדומורף (Endomorph)"
    }
  },
  halfLifeVisualizer: {
    title: "סימולטור זמן מחצית חיים",
    subtitle: "ראה כיצד רמות ההורמונים בדם משתנות בזמן אמת",
    compoundLabel: "חומר",
    dosageLabel: "מינון",
    durationLabel: "משך (שבועות)",
    frequencyLabel: "תדירות הזרקה",
    yAxis: "ריכוז בדם",
    xAxis: "ימים",
    pctZone: "אזור ניקוי (PCT)",
    pctStartMsg: "זמן מומלץ להתחלת PCT",
    peakLevelMsg: "שיא הריכוז בשימוש נכון",
    addToStackBtn: "הוסף לערימה",
    activeStackTitle: "חומרים פעילים",
    serumTitle: "ריכוז בדם",
    peakLabel: "שיא",
    emptyStackMsg: "הוסף חומרים כדי לראות את הגרף",
    compounds: enContent.halfLifeVisualizer.compounds, // Keeping technical IDs/Names
    frequencies: { ed: "כל יום", eod: "יום כן יום לא", e3d: "כל 3 ימים", e7d: "אחת לשבוע" },
    tooltipDay: "יום",
    tooltipLevel: "רמה",
    tooltipPctReady: "מוכן ל-PCT",
    tooltipWait: "יש להמתין",
    tooltipInject: "מועד הזרקה",
    analysis: {
      title: "ניתוח סייקל חכם",
      prosTitle: "יתרונות",
      consTitle: "סיכונים",
      adviceTitle: "טיפ ממר איקס",
      pros: ["רמות דם יציבות", "שיא ביו-זמינות"],
      cons: ["צורך בהזרקות תכופות", "עלייה בלחץ דם"],
      advice: "זכור לבצע בדיקות דם באמצע הסייקל."
    }
  },
  mealPlanTitle: "תוכנית תזונה",
  mealPlanBtn: "צור תוכנית",
  mealPlanLoading: "מכין...",
  mealPlanError: "אירעה שגיאה",
  timelineTitle: "ציר זמן השינוי",
  timelineSubtitle: "מה קורה בתוך הגוף שלך שבוע אחר שבוע? המסע הביולוגי המלא.",
  timelinePhases: [
    { week: "1-2", title: "שלב ההתנעה (The Kickstart)", shortDesc: "כניסת ההורמון והתחלת שינויים", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "עלייה חדה ברמות האנדרוגנים בדם. עלייה באגירת חנקן בשריר.", feeling: "שיפור ניכר במצב הרוח, חשק מיני גבוה ותחושת 'פאמפ' תמידית.", action: "היצמד לתזונה ב-100%. שתה 4 ליטר מים ביום." } },
    { week: "3-6", title: "שלב ההתפוצצות (Hypertrophy Surge)", shortDesc: "צמיחת שריר מהירה ועלייה במשקל", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "רוויה של קולטנים. סינתזת חלבון בשיא.", feeling: "כוח מטורף באימון. הבגדים נהיים צמודים. תיאבון גבוה.", action: "העלה משקלים באימון. עקוב אחר לחץ דם ואסטרוגן." } }
  ],

};

export const injectionSitesUr = injectionSitesEn;
export const labTestsUr = labTestsEn;

export const urContent = {
  ...enContent,
  faq: [
    { question: "کیا یہ واقعی مجھے جمود (Plateau) توڑنے میں مدد دے گی؟", answer: "جی ہاں۔ اگر آپ کی ترقی رک گئی ہے، تو یہ ممکنہ طور پر حکمت عملی کا مسئلہ ہے۔ 'Mr. X-Steroid' جدید اسٹیکنگ تکنیک اور سائیکل ایڈجسٹمنٹس فراہم کرتا ہے جو پٹھوں کو دوبارہ گروتھ موڈ میں لاتے ہیں۔ جمود کو الوداع کہیں! 🚀", category: "general" },
    { question: "میں سائیکل کے دوران اپنی صحت کو کیسے یقینی بناؤں؟", answer: "حفاظت ہمارا جنون ہے۔ 🛡️ ہم نقصان کو کم کرنے کے بارے میں جامع گائیڈز فراہم کرتے ہیں، بشمول آپ کے جسم کے اشاروں کو پڑھنا اور خون کے ٹیسٹ کی مطلق ضرورت۔ ہم آپ کو خطرات سے نمٹنا سکھاتے ہیں، انہیں نظر انداز کرنا نہیں۔", category: "safety" },
    { question: "مضر اثرات (Side Effects) کے بارے میں کیا خیال ہے؟ کیا میں ان سے بچ سکتا ہوں؟", answer: "اگرچہ کوئی بھی سائیکل خطرے سے خالی نہیں ہوتا، لیکن علم آپ کا بہترین دفاع ہے۔ ہم ایسٹروجن لیول کو کنٹرول کرنے، جگر کی حفاظت، اور بالوں کو گرنے سے روکنے کے لیے مکمل سیکشنز وقف کرتے ہیں۔ ہم آپ کو وہ طریقے بتاتے ہیں جن سے سائیڈ ایفیکٹس کم سے کم ہوں۔", category: "safety" },
    { question: "کیا آپ پوسٹ سائیکل تھراپی (PCT) کا احاطہ کرتے ہیں؟", answer: "سائیکل تب تک ختم نہیں ہوتا جب تک PCT مکمل نہ ہو جائے۔ 🔄 ہم آپ کو اکیلا نہیں چھوڑتے؛ ہم تفصیلی PCT پروٹوکولز فراہم کرتے تاکہ آپ کے جسم میں ٹیسٹوسٹیرون کی قدرتی پیداوار بحال ہو سکے اور آپ کے بنائے ہوئے پٹھے برقرار رہیں۔", category: "safety" },
    { question: "کیا 'Mr. X-Steroid' غیر قانونی سرگرمیوں کی حوصلہ افزائی کرتی ہے؟", answer: " نہیں۔ 🚫 یہ مواد صرف معلومات، تعلیم اور نقصان کو کم کرنے کے مقصد کے لیے ہے۔ ہمارا ماننا ہے کہ اگر بالغ افراد ان اشیاء کے استعمال کا انتخاب کرتے ہیں، تو ان کے پاس درست سائنسی ڈیٹا ہونا چاہیے تاکہ وہ خطرناک غلطیوں سے بچ سکیں۔", category: "legal" },
    { question: "کیا اس کتاب کو رکھنے سے میں کسی مشکل میں پڑ سکتا ہوں؟", answer: "بالکل نہیں۔ علم کا حصول ایک بنیادی حق ہے۔ 📚 آپ محض ایک جامع تعلیمی وسیلہ خرید رہے ہیں۔ تاہم، انابولک اشیاء کی خریداری اور استعمال مقامی قوانین کے تابع ہے، جن کا احترام کرنے کا ہم مشورہ دیتے ہیں۔", category: "legal" },
    { question: "کیا آپ اس سائٹ پر اسٹیرائڈز فروخت کر رہے ہیں؟", answer: "کبھی نہیں۔ ہم مہارت، حکمت عملی اور معلومات فروخت کرتے ہیں۔ ہم کنٹرول شدہ اشیاء کو فروخت یا تقسیم نہیں کرتے۔ ہم آپ کے کوچ ہیں، آپ کے ڈیلر نہیں۔", category: "legal" },
    { question: "کیا ان حکمت عملیوں کے استعمال سے میں مردوں جیسی نظر آؤں گی؟", answer: "ہماری رہنمائی کے ساتھ نہیں! 🙅‍♀️ 'بھاری' نظر اکثر غلط اشیاء یا غلط مقدار کے استعمال سے آتی ہے۔ ہمارا 'خواتین کا زون' محفوظ اور خواتین کے لیے موزوں سائیکلز پر توجہ مرکوز کرتا ہے جو وزن کم کرنے اور صاف پٹھے بنانے کے لیے ڈیزائن کیے گئے ہیں—تاکہ آپ کی نسائیت برقرار رہے۔", category: "women" },
    { question: "خواتین کے لیے کون سی اشیاء محفوظ ہیں؟", answer: "ہم خاص طور پر ان اشیاء کو اجاگر کرتے ہیں جن کے اینڈروجینک ریٹنگز کم ہیں (ییسے Anavar یا Primobolan) جو خواتین فٹنس ماڈلز میں مقبول ہیں۔ ہم آپ کو بتاتے ہیں کہ مردانہ علامات سے بچنے کے لیے کن چیزوں سے پرہیز کرنا چاہیے۔", category: "women" },
    { question: "کیا خواتین مردوں جیسے سائیکلز پر عمل کر سکتی ہیں؟", answer: "بالکل نہیں! خواتین کی فزیالوجی منفرد ہے۔ ہم خاص طور پر خواتین کے لیے بنائے گئے چارٹس فراہم کرتے ہیں، جس میں ہارمونل توازن کو برقرار رکھتے ہوئے نتائج حاصل کرنے کے لیے مقدار اور سائیکل کی مدت کو ایڈجسٹ کیا جاتا ہے۔ 🌸", category: "women" },
    { question: "بلکنگ بمقابلہ کٹنگ: کیا کتاب دونوں کا احاطہ کرتی ہے؟", answer: "جی ہاں، ہم مکمل رینج کا احاطہ کرتے ہیں! 📉📈 چاہے آپ آف سیزن میں وزن بڑھانا چاہتے ہوں یا گرمیوں کے لیے کٹنگ کرنا چاہتے ہوں، ہمارے پاس ہر مقصد کے لیے مخصوص 'سائیکل بلیو پرنٹس' موجود ہیں۔ آپ صرف اپنا ہدف منتخب کریں، اور ہم آپ کو راستہ دکھائیں گے۔", category: "strategy" },
    { question: "مجھے کیسے معلوم ہوگا کہ میرے لیے کون سا 'اسٹیک' درست ہے؟", answer: "ہم اسٹیکس کو تجربے کی سطح (مبتدی، انٹرمیڈیٹ، پرو) کے لحاظ سے تقسیم کرتے ہیں۔ آپ حادثاتی طور پر پہلے دن ہی پرو لیول سائیکل شروع نہیں کریں گے۔ ہم آپ کو منطقی طور پر سطحوں کے ذریعے آگے بڑھنے میں مدد کرتے ہیں۔", category: "strategy" },
    { question: "'اسمارٹ سائیکل' کا طریقہ کیا ہے؟", answer: "یہ وقت اور تال میل کے بارے میں ہے۔ ⏱️ ہم آپ کو سکھاتے ہیں کہ اپنی ٹریننگ اور غذا کو اپنے سائیکل کے عروج کے ہفتوں کے ساتھ کیسے جوڑا جائے۔ یہ صرف کچھ لینے کے بارے میں نہیں ہے؛ یہ 'X-Steroid' اثر کے لیے اپنے پورے طرز زندگی کو ترتیب دینے کے بارے میں ہے۔", category: "strategy" }
  ],
  mealPlanTitle: "غذائی منصوبہ",
  mealPlanBtn: "بنائیں",
  mealPlanLoading: "تیاری...",
  mealPlanError: "غلطی",
  timelineTitle: "تبدیلی کا ٹائم لائن",
  timelineSubtitle: "ہفتہ وار آپ کے جسم میں کیا ہوتا ہے؟",
  timelinePhases: [
    { week: "1-2", title: "آغاز", shortDesc: "ابتدائی سیرابی", iconKey: "spark", stats: { strength: 20, hypertrophy: 10, waterRetention: 30, fatLoss: 5, mood: 80 }, details: { biological: "خون میں اینڈروجن کی سطح میں تیزی سے اضافہ۔ نائٹروجن برقرار رکھنے میں بہتری۔", feeling: "اعلی خواہش، بہتر موڈ، مسلسل پمپ.", action: "غذا پر 100٪ قائم رہیں۔ روزانہ 4 لیٹر پانی پیئو." } },
    { week: "3-6", title: "پٹھوں کی نشوونما", shortDesc: "تیز رفتار ترقی", iconKey: "muscle", stats: { strength: 60, hypertrophy: 70, waterRetention: 50, fatLoss: 10, mood: 90 }, details: { biological: "سیپٹرز کی سنترپتی (Saturation)۔ پروٹین کی ترکیب زیادہ سے زیادہ۔", feeling: "دیوانہ وار طاقت۔ کپڑے تنگ محسوس ہوتے ہیں۔", action: "وزن بڑھائیں۔ بلڈ پریشر اور ایسٹروجن کی نگرانی کریں۔" } },
    { week: "7-10", title: "سختی کا مرحلہ", shortDesc: "وزن مستحکم، چربی جلنا", iconKey: "trophy", stats: { strength: 90, hypertrophy: 90, waterRetention: 40, fatLoss: 40, mood: 70 }, details: { biological: "مستحکم سطح۔ جسم چربی کو بطور ایندھن استعمال کرتا ہے۔", feeling: "زیادہ سخت اور تفصیلی عضلات۔", action: "باقاعدہ کارڈیو شروع کریں۔ جگر کی اقدار کی جانچ کریں۔" } },
    { week: "11-12", title: "عروج", shortDesc: "آخری ٹچ", iconKey: "flag", stats: { strength: 100, hypertrophy: 100, waterRetention: 20, fatLoss: 60, mood: 60 }, details: { biological: "زیادہ سے زیادہ کثافت۔ روکنے کی تیاری۔", feeling: "ہلکی تھکاوٹ۔ تیار۔", action: "PCT کی منصوبہ بندی کریں۔ معمولی کیلوری خسارہ رکھیں۔" } }
  ],
  timelineLabels: { strength: "طاقت", hypertrophy: "سائز", water: "پانی", fatLoss: "چربی میں کمی", mood: "موڈ", biologicalTitle: "حیاتیاتی اثر", feelingTitle: "احساس", actionTitle: "عمل", phaseLabel: "مرحلہ" },
  halfLifeVisualizer: {
    title: "نصف حیات سمیلیٹر",
    subtitle: "خون میں جمع ہونے کا تصور کریں۔",
    compoundLabel: "مرکب",
    dosageLabel: "خوراک",
    durationLabel: "دورانیہ",
    frequencyLabel: "تکرار",
    yAxis: "سطح",
    xAxis: "دن",
    pctZone: "PCT زون",
    pctStartMsg: "PCT شروع",
    peakLevelMsg: "چوٹی",
    addToStackBtn: "شامل کریں",
    activeStackTitle: "فعال اسٹیک",
    serumTitle: "سیرم کی سطح",
    peakLabel: "چوٹی",
    emptyStackMsg: "مرکبات شامل کریں",
    compounds: enContent.halfLifeVisualizer.compounds,
    frequencies: { ed: "روزانہ", eod: "ہر دوسرے دن", e3d: "ہر 3 دن", e7d: "ہفتہ وار" },
    tooltipDay: "دن",
    tooltipLevel: "سطح",
    tooltipPctReady: "PCT تیار",
    tooltipWait: "انتظار کریں",
    tooltipInject: "انجکشن",
    analysis: {
      title: "سائیکل کا تجزیہ",
      prosTitle: "فوائد",
      consTitle: "نقصانات",
      adviceTitle: "مشورہ",
      pros: ["مستحکم سطح", "زیادہ حیاتیاتی دستیابی"],
      cons: ["بار بار انجکشن"],
      advice: "اپنی سطح کی نگرانی کریں۔"
    }
  },
  injectionMap: {
    ...arContent.injectionMap,
    title: "انجکشن کا نقشہ",
    subtitle: "انٹرایکٹو گائیڈ.",
    sites: injectionSitesUr,
    riskLevels: { low: "کم", high: "زیادہ" },
    status: { ready: "تیار", recovering: "بحالی", warning: "پرہیز کریں" },
    featureCards: {
      power: { title: "طاقت", desc: "مرکب فوری کام کرتا ہے." },
      tissue: { title: "ٹشو", desc: "ریشے نائٹروجن جذب کرتے ہیں." },
      burn: { title: "جلانا", desc: "میٹابولزم بڑھتا ہے." }
    },
    goldenHourTitle: "سنہری گھڑی",
    goldenHourDesc: "تبدیلی فوراً شروع ہوتی ہے!",
    rotationTrackerTitle: "روٹیشن ٹریکر",
    cumulativeGrowthLabel: "مجموعی ترقی",
    efficiencyLabel: "کارکردگی",
    stimulatedCellsLabel: "متحرک خلیات",
    rotateHint: "گھمانے کے لیے سوائپ کریں ↔️",
    mrxInsightLabel: "مسٹر ایکس کی بصیرت",
    closeDetailsBtn: "بند کریں",
    comfortableSpot: "سب سے آرام دہ"
  },
  labReference: {
    ...arContent.labReference,
    title: "خون کا تجزیہ",
    subtitle: "اپنے نتائج کو سمجھیں۔",
    searchPlaceholder: "تلاش کریں...",
    tests: labTestsUr
  },
  geneticCalculator: {
    ...arContent.geneticCalculator,
    title: "جینیاتی صلاحیت",
    subtitle: "اپنی حد کا تجزیہ کریں.",
    cta: "تجزیہ کریں",
    resultTitle: "آپ کی صلاحیت",
    labels: {
      ...arContent.geneticCalculator.labels,
      analysis: "تجزیہ",
      roadmap: "روڈ میپ",
      ffmi: "فैट فری ماس انڈیکس (FFMI)",
      goldenRatio: "سنہرا تناسب",
      physiqueScore: "جسمانی سکور"
    },
  },
  cycleArchitect: {
    ...arContent.cycleArchitect,
    title: "سائیکل آرکیٹیکٹ",
    subtitle: "اپنے پروٹوکول کی منصوبہ بندی کریں.",
    configLabel: "کنفیگریشن",
    stealthModeLabel: "خفیہ موڈ",
    form: { ...arContent.cycleArchitect.form, startDateLabel: "شروعات کی تاریخ", compoundLabel: "مرکب", dosageLabel: "خوراک", frequencyLabel: "فریکوئنسی" }
  },
  disclaimerTitle: "دستبرداری", disclaimerContent: fullUrduDisclaimer, agreeButton: "میں متفق ہوں", disclaimerAcknowledgement: "میں تصدیق کرتا ہوں", importantDisclaimer: "وارننگ",
  loginTitle: "لاگ ان",
  signupTitle: "سائن اپ",
  emailLabel: "ای میل ایڈریس",
  passwordLabel: "پاس ورڈ",
  nameLabel: "پورا نام",
  loginBtn: "لاگ ان کریں",
  signupBtn: "اکاؤنٹ بنائیں",
  noAccount: "اکاؤنٹ نہیں ہے؟",
  haveAccount: "پہلے سے اکاؤنٹ ہے؟",
  invalidCredentials: "ای میل یا پاس ورڈ غلط ہے",
  signupSuccess: "اکاؤنٹ بن گیا! براہ کرم تصدیق کے لیے اپنا ای میل چیک کریں۔",
  logout: "لاگ آؤت",
  welcomeUser: "خوش آمدید",
  loginWithGoogle: "گوگل کے ساتھ لاگ ان کریں",
  loginWithMicrosoft: "مائیکروسافٹ کے ساتھ لاگ ان کریں",
  orDivider: "یا",
};


export const frContent = { ...enContent, disclaimerTitle: "Avis de non-responsabilité", disclaimerContent: fullFrenchDisclaimer, agreeButton: "J'accepte", disclaimerAcknowledgement: "Je confirme", importantDisclaimer: "AVERTISSEMENT" };
export const esContent = { ...enContent, disclaimerTitle: "Descargo de responsabilidad", disclaimerContent: fullSpanishDisclaimer, agreeButton: "Acepto", disclaimerAcknowledgement: "Confirmo", importantDisclaimer: "ADVERTENCIA" };
export const deContent = { ...enContent, disclaimerTitle: "Haftungsausschluss", disclaimerContent: fullGermanDisclaimer, agreeButton: "Ich stimme zu", disclaimerAcknowledgement: "Ich bestätige", importantDisclaimer: "WARNUNG" };
export const itContent = { ...enContent, disclaimerTitle: "Disclaimer", disclaimerContent: fullItalianDisclaimer, agreeButton: "Accetto", disclaimerAcknowledgement: "Confermo", importantDisclaimer: "AVVERTIMENTO" };
export const ruContent = { ...enContent, disclaimerTitle: "Отказ от ответственности", disclaimerContent: fullRussianDisclaimer, agreeButton: "Я согласен", disclaimerAcknowledgement: "Я подтверждаю", importantDisclaimer: "ВНИМАНИЕ" };
export const trContent = { ...enContent, disclaimerTitle: "Sorumluluk Reddi", disclaimerContent: fullTurkishDisclaimer, agreeButton: "Kabul Ediyorum", disclaimerAcknowledgement: "Onaylıyorum", importantDisclaimer: "UYARI" };
export const ptContent = { ...enContent, disclaimerTitle: "Isenção de Responsabilidade", disclaimerContent: fullPortugueseDisclaimer, agreeButton: "Aceito", disclaimerAcknowledgement: "Confirmo", importantDisclaimer: "AVISO" };
export const faContent = { ...enContent, disclaimerTitle: "سلب مسئولیت", disclaimerContent: fullPersianDisclaimer, agreeButton: "می‌پذیرم", disclaimerAcknowledgement: "تایید می‌کنم", importantDisclaimer: "هشدار مهم" };

