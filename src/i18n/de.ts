import { ContentStrings, LabTest, InjectionSite } from '../types';
import { commonCompounds, fullGermanDisclaimer } from './data';

export const labTestsDe: LabTest[] = [
    {
        id: "test_total",
        name: "Gesamt-Testosteron",
        category: "hormones",
        description: "Das primäre männliche Sexualhormon, verantwortlich für Muskelwachstum und Libido.",
        range: "300 - 1000 ng/dL",
        unit: "ng/dL",
        min: 300,
        max: 1000,
        elevationMeaning: "Hohe Werte können zu Akne, Haarausfall und Stimmungsschwankungen führen. Üblich im Zyklus.",
        lowMeaning: "Niedrige Werte verursachen Müdigkeit, Muskelabbau und geringe Libido.",
        management: "Überwachen Sie LH/FSH und erwägen Sie TRT, wenn der Wert dauerhaft niedrig ist."
    },
    {
        id: "test_free",
        name: "Freies Testosteron",
        category: "hormones",
        description: "Das bioverfügbare Testosteron, das nicht an SHBG oder Albumin gebunden ist.",
        range: "5 - 21 pg/mL",
        unit: "pg/mL",
        min: 5,
        max: 21,
        elevationMeaning: "Häufig erhöht bei exogener Testosteronzufuhr.",
        lowMeaning: "Oft ein besserer Indikator für Low-T-Symptome als der Gesamtwert.",
        management: "SHBG-Werte optimieren, um das Verhältnis zu verbessern."
    },
    {
        id: "e2",
        name: "Estradiol (E2)",
        category: "hormones",
        description: "Die primäre Form von Östrogen. Vital für Knochengesundheit und Libido bei Männern.",
        range: "20 - 45 pg/mL",
        unit: "pg/mL",
        min: 20,
        max: 45,
        elevationMeaning: "Hohes E2 verursacht Wassereinlagerungen, Gynäkomastie und emotionale Instabilität.",
        lowMeaning: "Niedriges E2 verursacht Gelenkschmerzen, niedrige Libido und trockene Haut.",
        management: "Verwenden Sie Aromatasehemmer (AI) vorsichtig, um das Gleichgewicht zu halten."
    },
    {
        id: "shbg",
        name: "SHBG",
        category: "hormones",
        description: "Protein, das Testosteron bindet und es inaktiv macht.",
        range: "16 - 55 nmol/L",
        unit: "nmol/L",
        min: 16,
        max: 55,
        elevationMeaning: "Hohes SHBG senkt den freien Testosteronspiegel.",
        lowMeaning: "Niedriges SHBG ist bei oralen Steroiden üblich und erhöht das freie T.",
        management: "Überwachen, um das Verhältnis von Gesamt- zu freiem T zu verstehen."
    },
    {
        id: "prolactin",
        name: "Prolaktin",
        category: "hormones",
        description: "Hormon, das bei Erhöhung die Libido beeinträchtigen und Gynäkomastie verursachen kann.",
        range: "4 - 15 ng/mL",
        unit: "ng/mL",
        min: 4,
        max: 15,
        elevationMeaning: "Kann durch 19-Nor-Verbindungen (Deca/Tren) erhöht werden. Verursacht Libidoprobleme.",
        lowMeaning: "Niedrige Werte sind selten und meist unbedenklich.",
        management: "Erwägen Sie P5P oder Dopaminagonisten bei dauerhafter Erhöhung."
    },
    {
        id: "lh",
        name: "Luteinisierendes Hormon (LH)",
        category: "hormones",
        description: "Signalisiert den Hoden, Testosteron zu produzieren.",
        range: "1.7 - 8.6 mIU/mL",
        unit: "mIU/mL",
        min: 1.7,
        max: 8.6,
        elevationMeaning: "Hohe Werte können auf primäres Hodenversagen hinweisen.",
        lowMeaning: "Niedrige Werte zeigen HPTA-Unterdrückung an (üblich bei Zyklen).",
        management: "Schlüsselmarker für den Erholungsstatus nach dem Zyklus."
    },
    {
        id: "fsh",
        name: "FSH",
        category: "hormones",
        description: "Follikelstimulierendes Hormon; essentiell für die Spermienproduktion.",
        range: "1.5 - 12.4 mIU/mL",
        unit: "mIU/mL",
        min: 1.5,
        max: 12.4,
        elevationMeaning: "Erhöhte Werte deuten auf primäres Hodenversagen hin.",
        lowMeaning: "Unterdrückt während medikamenteninduzierter Hormonzyklen.",
        management: "Entscheidend für die Überwachung der Fruchtbarkeit."
    },
    {
        id: "alt",
        name: "ALT (SGPT)",
        category: "organs",
        description: "Primäres Leberenzym; hohe Werte deuten auf Leberstress oder Schäden hin.",
        range: "10 - 40 U/L",
        unit: "U/L",
        min: 10,
        max: 40,
        elevationMeaning: "Typischerweise erhöht durch orale 17-alpha-alkylierte Steroide.",
        lowMeaning: "Keine klinische Bedeutung.",
        management: "Nutzen Sie TUDCA/NAC und setzen Sie orale Verbindungen ab."
    },
    {
        id: "ast",
        name: "AST (SGOT)",
        category: "organs",
        description: "Enzym in Leber und Herz; kann auch durch Muskelschäden ansteigen.",
        range: "10 - 40 U/L",
        unit: "U/L",
        min: 10,
        max: 40,
        elevationMeaning: "Steigt bei Leberstress oder intensivem Muskeltraining.",
        lowMeaning: "Keine klinische Bedeutung.",
        management: "Vergleich mit ALT zur Unterscheidung von Leber- vs. Muskelstress."
    },
    {
        id: "ggt",
        name: "GGT",
        category: "organs",
        description: "Spezifisches Enzym für die Gesundheit von Leber und Gallengängen.",
        range: "0 - 60 U/L",
        unit: "U/L",
        min: 0,
        max: 60,
        elevationMeaning: "Zeigt ernsthaften Leberstress oder Alkohol-/Drogen-Toxizität an.",
        lowMeaning: "Normal.",
        management: "Hochspezifischer Marker für Leberpathologie."
    },
    {
        id: "creatinine",
        name: "Kreatinin",
        category: "organs",
        description: "Abfallprodukt des Muskelabbaus; primärer Nierenmarker.",
        range: "0.7 - 1.3 mg/dL",
        unit: "mg/dL",
        min: 0.7,
        max: 1.3,
        elevationMeaning: "Kann auf Nierenstress, Dehydrierung oder sehr hohe Muskelmasse hinweisen.",
        lowMeaning: "Kann auf Muskelschwund oder sehr geringe Proteinzufuhr hinweisen.",
        management: "Bleiben Sie hydriert und nutzen Sie Cystatin-C für eine genaue Nierenbewertung."
    },
    {
        id: "urea",
        name: "Harnstoff / BUN",
        category: "organs",
        description: "Misst Stickstoff im Blut; spiegelt den Proteinstoffwechsel wider.",
        range: "7 - 20 mg/dL",
        unit: "mg/dL",
        min: 7,
        max: 20,
        elevationMeaning: "Hohe Proteinzufuhr, Dehydrierung oder Nierenprobleme.",
        lowMeaning: "Niedrige Proteindiät oder schwere Lebererkrankung.",
        management: "Sorgen Sie für ausreichende Hydratation während proteinreicher Zyklen."
    },
    {
        id: "hdl",
        name: "HDL (Gut)",
        category: "blood",
        description: "High-Density Lipoprotein; schützt das Herz-Kreislauf-System.",
        range: "> 40 mg/dL",
        unit: "mg/dL",
        min: 40,
        max: 100,
        elevationMeaning: "Ideal für die Herzgesundheit.",
        lowMeaning: "Extrem häufige Nebenwirkung fast aller AAS-Zyklen.",
        management: "Nutzen Sie Omega-3, Krillöl und behalten Sie Cardio bei."
    },
    {
        id: "ldl",
        name: "LDL (Schlecht)",
        category: "blood",
        description: "Low-Density Lipoprotein; hohe Werte erhöhen das Plaque-Risiko.",
        range: "< 130 mg/dL",
        unit: "mg/dL",
        min: 0,
        max: 130,
        elevationMeaning: "Erhöht das Risiko für Arteriosklerose und Herzerkrankungen.",
        lowMeaning: "Optimal für die Herzgesundheit.",
        management: "Verhältnis zu HDL überwachen und gesättigte Fette anpassen."
    },
    {
        id: "hematocrit",
        name: "Hämatokrit",
        category: "blood",
        description: "Volumenanteil der roten Blutkörperchen im Blut.",
        range: "38 - 50 %",
        unit: "%",
        min: 38,
        max: 50,
        elevationMeaning: "Hohe Werte (Polyzythämie) erhöhen Blutviskosität und Gerinnungsrisiko.",
        lowMeaning: "Anämie; reduzierte Sauerstofftransportkapazität.",
        management: "Häufige Blutspenden können erforderlich sein, wenn > 52%."
    },
    {
        id: "hemoglobin",
        name: "Hämoglobin",
        category: "blood",
        description: "Protein in roten Blutkörperchen, das Sauerstoff transportiert.",
        range: "13.5 - 17.5 g/dL",
        unit: "g/dL",
        min: 13.5,
        max: 17.5,
        elevationMeaning: "Häufig im Zyklus; deutet auf verdicktes Blut hin.",
        lowMeaning: "Potenzielle Anämie und geringe Ausdauer.",
        management: "Bleiben Sie gut hydriert und überwachen Sie den Blutdruck."
    },
    {
        id: "tsh",
        name: "TSH",
        category: "thyroid",
        description: "Thyreoidea-stimulierendes Hormon; reguliert den Stoffwechsel.",
        range: "0.4 - 4.0 mIU/L",
        unit: "mIU/L",
        min: 0.4,
        max: 4.0,
        elevationMeaning: "Deutet auf Hypothyreose (Schilddrüsenunterfunktion) hin.",
        lowMeaning: "Deutet auf Hyperthyreose (Schilddrüsenüberfunktion) hin.",
        management: "Wichtig bei der Verwendung von T3 oder bestimmten AAS wie Trenbolon."
    },
    {
        id: "vit_d",
        name: "Vitamin D",
        category: "vitamins",
        description: "Essentiell für Knochengesundheit und Hormonsynthese.",
        range: "30 - 100 ng/mL",
        unit: "ng/mL",
        min: 30,
        max: 100,
        elevationMeaning: "Vitamin-D-Toxizität (sehr selten).",
        lowMeaning: "Extrem häufig; verbunden mit niedrigem Testosteronspiegel.",
        management: "Supplementieren Sie täglich mit 5.000+ IE, wenn niedrig."
    },
    {
        id: "ferritin",
        name: "Ferritin",
        category: "minerals",
        description: "Spiegelt die gesamten Eisenspeicher des Körpers wider.",
        range: "30 - 400 ng/mL",
        unit: "ng/mL",
        min: 30,
        max: 400,
        elevationMeaning: "Kann auf Entzündung oder Eisenüberladung hinweisen.",
        lowMeaning: "Eisenmangelanämie.",
        management: "Wichtig zu verfolgen, wenn häufig Blut gespendet wird."
    },
    {
        id: "hs_crp",
        name: "hs-CRP",
        category: "inflammation",
        description: "Hochsensitives CRP; ein präziser Marker für systemische Entzündungen.",
        range: "0 - 3.0 mg/L",
        unit: "mg/L",
        min: 0,
        max: 3.0,
        elevationMeaning: "Chronische Entzündung, Übertraining oder Herzbelastung.",
        lowMeaning: "Status: Optimal. Geringe systemische Entzündung.",
        management: "Priorisieren Sie Ruhe und entzündungshemmende Ernährung, wenn hoch."
    },
    {
        id: "hba1c",
        name: "HbA1c",
        category: "metabolic",
        description: "Durchschnittlicher Blutzuckerwert der letzten 3-4 Monate.",
        range: "4.0 - 5.6 %",
        unit: "%",
        min: 4.0,
        max: 5.6,
        elevationMeaning: "Insulinresistenz oder schlechtes Glukosemanagement.",
        lowMeaning: "Chronischer Low-Carb-Stress oder Hypoglykämie-Neigung.",
        management: "Optimieren Sie Kohlenhydrat-Timing und Ballaststoffzufuhr."
    },
    {
        id: "cystatin_c",
        name: "Cystatin C",
        category: "kidney",
        description: "Hochpräziser Nierenmarker, unbeeinflusst von Muskelmasse.",
        range: "0.6 - 1.0 mg/L",
        unit: "mg/L",
        min: 0.6,
        max: 1.0,
        elevationMeaning: "Verringerte Nierenfiltrationsrate.",
        lowMeaning: "Optimale Nierengesundheit.",
        management: "Goldstandard für Athleten mit hohem Kreatinin."
    },
    {
        id: "nt_probnp",
        name: "NT-proBNP",
        category: "heart",
        description: "Marker für Herzwandbelastung und Flüssigkeitsüberladung.",
        range: "0 - 125 pg/mL",
        unit: "pg/mL",
        min: 0,
        max: 125,
        elevationMeaning: "Herzbelastung, möglicherweise durch hohen Blutdruck oder PED-Einsatz.",
        lowMeaning: "Optimal. Minimale Herzbelastung.",
        management: "Überwachen Sie den Blutdruck genau und optimieren Sie die Herzgesundheit."
    },
    {
        id: "uric_acid",
        name: "Harnsäure",
        category: "metabolic",
        description: "Nebenprodukt des Proteinabbaus; hohe Werte verursachen Gicht.",
        range: "3.5 - 7.2 mg/dL",
        unit: "mg/dL",
        min: 3.5,
        max: 7.2,
        elevationMeaning: "Dehydrierung, viel Protein oder Stoffwechselstress.",
        lowMeaning: "Status: Normal. Keine klinischen Bedenken.",
        management: "Erhöhen Sie die Wasseraufnahme und kontrollieren Sie Purine in der Nahrung."
    },
    {
        id: "igf1",
        name: "IGF-1",
        category: "hormones",
        description: "Wachstumsfaktor, primär verantwortlich für Muskelzellwachstum.",
        range: "115 - 350 ng/mL",
        unit: "ng/mL",
        min: 115,
        max: 350,
        elevationMeaning: "Hohe Werte üblich bei HGH- oder Insulin-Sekretagoga-Einsatz.",
        lowMeaning: "Reduziertes Muskelwachstumspotenzial und Erholung.",
        management: "Marker für die Wirksamkeit von Wachstumshormonen."
    }
];

export const deContent: Partial<ContentStrings> = {
    // Navigation
    navAiTools: "KI-Tools für Bodybuilder",
    navPremiumResources: "Premium-Ressourcen",
    navFeatures: "Funktionen",
    navToolNames: {
        macro: "MacroCalc Pro - Intelligente Ernährung",
        injection: "Injektionskarte",
        halflife: "Halbwertszeit-Plotter",
        lab: "Intelligente Laborwerte-Referenz",
        genetic: "Genetisches Potenzial",
        cycleArchitect: "Zyklus-Kalender-Export",
    },
    themeNames: {
        light: "Hell",
        dark: "Dunkel",
        system: "System",
    },
    backToHome: "Zurück zur Startseite",

    // SEO
    seoTitle: "Mr. X-Steroid | Der ultimative Bodybuilding & Steroid Guide",
    seoDescription: "Entdecken Sie den weltweit mächtigsten Leitfaden für Muskelaufbau und hormonelle Zyklen. Mr. X-Steroid bietet klare Protokolle, Sicherheitshinweise und Supplement-Bibeln.",

    // Hero
    heroTitle: "Mr. X-Steroid",
    heroSubtitle: "Entdecken Sie den ultimativen Muskelaufbau-Leitfaden und das hormonelle Zyklus-Handbuch: Ein umfassender wissenschaftlicher Ansatz mit detaillierten Diagrammen und leicht verständlichen Tabellen.",
    heroCta: "Jetzt Ihre Kopie erhalten",
    downloadPreview: "Kostenlose Vorschau herunterladen (PDF)",
    audioPreviewBtn: "Intro anhören",
    heroEditions: {
        ar: "Arabische Ausgabe",
        en: "Englische Ausgabe",
        de: "Deutsche Ausgabe",
        ja: "Japanische Ausgabe"
    },

    // Author
    authorSection: "Über den Autor",
    authorName: "George Mourice",
    authorBio: "Autor und Cover-Designer, George bietet einen Leitfaden, der nicht nur Information ist - er ist ein Schild. Dieses Buch ist eine Botschaft an jeden Coach und Athleten, der glaubt, dass Wissen und Wissenschaft das Fundament der Exzellenz sind.",

    // Features
    featuresTitle: "Was ist drin?",
    features: [
        {
            title: "Umfassende Hormon-Diagramme",
            description: "Kein Rätselraten mehr. Detaillierte Protokolle von Anfänger bis Profi.",
            iconKey: "chart"
        },
        {
            title: "Die Kunst des 'Sicheren Ausstiegs'",
            description: "Lernen Sie, wie Sie Ihr Hormonsystem schützen und die Produktion schnell wiederherstellen.",
            iconKey: "exit"
        },
        {
            title: "Supplement-Bibel",
            description: "Sparen Sie Ihr Geld. Ein brutaler Leitfaden darüber, was wirklich funktioniert.",
            iconKey: "shield"
        }
    ],

    // Benefits
    benefitsTitle: "Warum ist 'Mr. X-Steroid' Ihre beste Investition?",
    benefitsSubtitle: "Wir verkaufen nicht nur Seiten; wir verkaufen Jahre komprimierter Erfahrung.",
    benefits: [
        { title: "Maximaler ROI 💰", description: "Verschwenden Sie keine Jahre mit Versuch und Irrtum. Holen Sie sich die exakte Formel.", iconKey: "roi" },
        { title: "Medizinische Sicherheit 🛡️", description: "Lernen Sie, Nebenwirkungen zu managen und PCT wie ein Profi durchzuführen.", iconKey: "safety" },
        { title: "0% Mythos, 100% Realität 🧪", description: "Rohe, ungefilterte Daten. Die wissenschaftlichen Fakten, die Champions nutzen.", iconKey: "truth" },
        { title: "Komplexe Wissenschaft, einfach 🚀", description: "Endokrinologie in visuellen Blaupausen, einfach zu folgen.", iconKey: "simplified" },
        { title: "Der 'Smart Cycle' Vorteil 🧠", description: "Ernährung und Training erreichen ihren Höhepunkt genau dann, wenn Ihre Hormone es tun.", iconKey: "smart" }
    ],

    // Testimonials
    testimonialsTitle: "Was Leser sagen",
    testimonials: [
        { name: "John S.", title: "Angehender Bodybuilder", text: "Ich war verloren in Fehlinformationen. Dieses Buch hat mich auf den richtigen Weg gebracht." },
        { name: "Michael A.", title: "Personal Trainer", text: "Ein unverzichtbares Nachschlagewerk für jeden Coach." },
        { name: "Kevin M.", title: "Lokaler Champion", text: "Die Tabellen sind sehr präzise und haben mir geholfen, meine Bestform zu erreichen." }
    ],

    // FAQ
    faqTitle: "Häufig gestellte Fragen (FAQ)",
    faqSubtitle: "Direkte Antworten auf die häufigsten Fragen",
    faqSearchPlaceholder: "Suche nach einer Frage...",
    faqCategories: { all: "Alle", safety: "Sicherheit", general: "Allgemein", legal: "Rechtlich", women: "Frauen", strategy: "Strategie" },
    faqs: [
        {
            question: "Ist dieses Buch für absolute Anfänger geeignet?",
            answer: "Ja, wir beginnen bei Null. Wir erklären medizinische Begriffe in einfacher Sprache, bevor wir zu komplexen Protokollen übergehen.",
            category: "general"
        },
        {
            question: "Brauche ich wirklich eine PCT (Post Cycle Therapy) für jeden Zyklus?",
            answer: "Absolut. Kompromittieren Sie niemals Ihre natürliche HPTA-Achse. PCT ist die Brücke, die sicherstellt, dass Sie Ihre Gewinne behalten.",
            category: "safety"
        },
        {
            question: "Wie gehe ich mit Gynäkomastie (Gyno) um?",
            answer: "Früherkennung ist der Schlüssel. Wir behandeln den Einsatz von AI und SERMs wie Tamoxifen. Das Buch enthält ein 'Notfall-Gyno-Protokoll'.",
            category: "safety"
        },
        {
            question: "Ist der Gebrauch dieser Substanzen legal?",
            answer: "Die Legalität variiert stark je nach Land. In vielen Regionen sind sie verschreibungspflichtig. Dieses Buch dient nur Bildungszwecken.",
            category: "legal"
        },
        {
            question: "Können Frauen die Protokolle in diesem Buch nutzen?",
            answer: "Wir haben ein spezielles Kapitel 'Wellness für Frauen'. Frauen haben andere hormonelle Strukturen, daher sind viele männliche Protokolle gefährlich.",
            category: "women"
        },
        {
            question: "Unterschied zwischen Orals und Injectables?",
            answer: "Orals sind bequem, aber oft lebertoxisch. Injektionen sind meist sicherer für die langfristige Gesundheit, erfordern aber Technik.",
            category: "general"
        },
        {
            question: "Wie oft sollte ich Blutbilder machen?",
            answer: "Minimum: Vor dem Zyklus, in der Mitte und nach der PCT. Unser 'Smart Lab Reference' Tool hilft Ihnen bei der Interpretation.",
            category: "safety"
        },
        {
            question: "Reichen natürliche Test-Booster für die PCT?",
            answer: "Nein. Pflanzliche Booster sind für natürliche Athleten. Sobald Sie exogene Hormone verwenden, benötigen Sie pharmazeutische SERMs (Clomid/Nolvadex).",
            category: "safety"
        },
        {
            question: "Werde ich dauerhaft unfruchtbar?",
            answer: "Während eine vorübergehende Unterdrückung garantiert ist, ist dauerhafte Unfruchtbarkeit selten, WENN HCG- und PCT-Protokolle befolgt werden.",
            category: "general"
        },
        {
            question: "Wann ist die beste Zeit für orale Steroide?",
            answer: "Wir empfehlen, die Dosis aufzuteilen, um den Blutspiegel stabil zu halten, oder die volle Dosis vor dem Training für maximale Kraft zu nehmen.",
            category: "strategy"
        },
        {
            question: "Wie erkenne ich gefälschte Produkte?",
            answer: "Wir bieten einen Abschnitt 'Fälschungs-Bibel', der zeigt, wie man Chargencodes und Verpackungsqualität prüft.",
            category: "legal"
        },
        {
            question: "Verursachen Steroide Herzvergrößerung?",
            answer: "Chronischer Hochdosis-Gebrauch kann zu LVH führen. Wir erklären, wie man den Blutdruck managt und Cardio-Protokolle nutzt.",
            category: "safety"
        },
        {
            question: "Kann ich im Zyklus Alkohol trinken?",
            answer: "Dringend abgeraten, besonders bei Orals. Beides belastet die Leber stark.",
            category: "safety"
        },
        {
            question: "Ist 'Blast and Cruise' sicherer als 'Cycle and PCT'?",
            answer: "B&C bietet Stabilität, erschwert aber die Erholung. C&P ermöglicht dem Körper einen Reset. Wir vergleichen beides in Kapitel 12.",
            category: "strategy"
        },
        {
            question: "Wie gehe ich mit dem 'Post-Cycle-Crash' um?",
            answer: "Der Crash wird durch niedriges Östrogen und null Testosteron verursacht. Eine richtige PCT minimiert diese Zeit.",
            category: "safety"
        }
    ],

    // Pricing & Purchase
    pricingTitle: "Wählen Sie Ihren Plan",
    pricingSubtitle: "Eine kleine Investition in Ihr Wissen spart Ihnen Tausende von Dollar und unzählige Gesundheitsrisiken.",
    pricingTiers: [
        {
            id: 'digital',
            name: "Basis (Digitales E-Book)",
            price: 49.99,
            description: "Vollständiges E-Book + Sofortiger Zugriff",
            features: ["Komplettes Buch (300+ Seiten)", "Sofortige Lieferung per E-Mail", "Lebenslange kostenlose Updates", "Hochauflösende Grafiken"],
            buttonText: "Digital holen",
            requiresShipping: false,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: false,
            includesCoaching: false
        },
        {
            id: 'paperback',
            name: "Standard (Taschenbuch Bundle)",
            price: 72.00,
            description: "Physisches Buch + Digital + Hörbuch",
            features: ["Hochwertiges Taschenbuch", "Digitales E-Book inklusive", "Vollständiges Hörbuch", "Heimtraining PDF Bonus"],
            buttonText: "Bundle bestellen",
            isPopular: true,
            popularLabel: "Bester Wert",
            requiresShipping: true,
            requiresBodyStats: false,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: false
        },
        {
            id: 'hardcover',
            name: "Professional (Hardcover & Coaching)",
            price: 249.99,
            description: "Premium Hardcover + Vollständiges Coaching",
            features: ["Luxus-Hardcover-Edition", "Zugang zum Hormonkurs", "VIP-Community-Mitgliedschaft", "Priorisierter Versand"],
            buttonText: "Der Elite beitreten",
            requiresShipping: true,
            requiresBodyStats: true,
            includesEbook: true,
            includesAudiobook: true,
            includesCoaching: true
        }
    ],


    disclaimerTitle: "Wichtige Warnung & Haftungsausschluss",
    disclaimerContent: fullGermanDisclaimer,
    agreeButton: "Ich stimme zu & übernehme die volle Verantwortung (18+)",
    disclaimerAcknowledgement: "Durch Klicken auf die Schaltfläche unten bestätigen Sie, dass Sie alle oben genannten Bedingungen gelesen, verstanden und akzeptiert haben.",
    secureCheckout: "100% sichere und verschlüsselte Zahlung über SpaceRemit",
    checkoutTitle: "Kasse",
    billingDetails: "Rechnungsdetails",
    fullName: "Vollständiger Name",
    emailAddress: "E-Mail-Adresse",
    payNow: "Jetzt zahlen",
    orderSummary: "Bestellübersicht",
    total: "Gesamt",
    shippingAddress: "Lieferadresse",
    city: "Stadt",
    zipCode: "Postleitzahl",
    shippingProvider: "Versanddienstleister",
    weight: "Gewicht (kg)",
    height: "Größe (cm)",
    age: "Alter",
    goal: "Fitnessziel",
    securePaymentMessage: "100% sichere und verschlüsselte Zahlung über SpaceRemit",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    transactionFee: "Transaktionsgebühr",

    // Legal & Footer


    // Tools & Interactive
    macroEcosystem: {
        syncStatus: "Synchronisierung mit Ökosystem...",
        analysisTitle: "Mehrdimensionale Analyse",
        evolutionaryTitle: "Evolutionärer Ernährungsplan",
        aiInsightTitle: "Neural Nexus Einsicht",
        stepsLabel: "Smarte Zubereitungsschritte",
        ingredientsLabel: "Bio-Aktive Zutaten"
    },
    cycleArchitect: {
        title: "Smarter Zyklus-Synchronisierer",
        subtitle: "Entwerfen Sie Ihr Protokoll mit Präzision. Erhalten Sie einen ausführbaren Zeitplan (ICS) mit Injektionsrotation.",
        presetsTitle: "Voreinstellungen:",
        configLabel: "Konfiguration",
        stealthModeLabel: "Tarnmodus (Privatsphäre)",
        rotationLabel: "Injektionsstellen automatisch rotieren",
        pctLabel: "PCT-Start automatisch berechnen",
        toggleStealth: "Tarnmodus umschalten",
        toggleRotation: "Rotation umschalten",
        togglePct: "Auto-PCT umschalten",
        stealthAliases: ["Fitnessstudio", "Vitamin-Shot", "Arbeitsmeeting", "Physio", "Cardio"],
        rotationSites: ["Rechter Gluteus", "Linker Gluteus", "Rechte Schulter", "Linke Schulter", "Rechter Quad", "Linker Quad"],
        presets: {
            beginnerBulk: "Anfänger Masseaufbau",
            cutting: "Fortgeschrittene Definition",
            trt: "TRT-Protokoll"
        },
        form: {
            startDateLabel: "Startdatum",
            compoundLabel: "Verbindung",
            dosageLabel: "Dosierung (mg)",
            frequencyLabel: "Häufigkeit",
            weeksLabel: "Dauer (Wochen)",
            halfLifeLabel: "Halbwertszeit (Tage) - Für PCT",
            addCompoundBtn: "Verbindung hinzufügen",
            removeBtn: "Entfernen",
            frequencies: {
                daily: "Täglich (ED)",
                eod: "Jeden 2. Tag (EOD)",
                twiceWeekly: "Zweimal wöchentlich",
                weekly: "Wöchentlich"
            }
        },
        premiumLock: {
            lockedTitle: "Premium-Funktion gesperrt",
            lockedDesc: "Der Export des vollständigen Zeitplans ist verifizierten Kunden vorbehalten.",
            verifyBtn: "Kauf verifizieren zum Entsperren",
            exportBtn: "Smarter Kalender Export (.ics)",
            placeholder: "E-Mail oder Bestellnummer eingeben",
            successMsg: "Verifiziert! Funktion entsperrt.",
            errorMsg: "Bestellung nicht gefunden.",
            demoHint: "Versuchen Sie \"demo\", um sofort zu entsperren"
        },
        pctEventSummary: "🔰 START PCT PROTOKOLL 🔰",
        pctEventDescription: "Wartezeit abgelaufen. Beginnen Sie jetzt mit dem SERM-Protokoll.",
        stealthPctAlias: "Erholungsphase Start"
    },
    calcTitle: "MacroCalc Pro - Intelligente Ernährung",
    calcSubtitle: "Fortgeschrittene mehrdimensionale Analyse & Vorhersage-Ökosystem",
    calcGender: "Geschlecht",
    calcCalculate: "Jetzt berechnen",
    calcAiInsightTitle: "KI-Ernährungsassistent",
    calcAiInsightText: "Basierend auf Tiefenanalyse ist Ihre Stoffwechselrate 8% höher als der Durchschnitt. Wir empfehlen, die Aufnahme komplexer Kohlenhydrate zu erhöhen.",

    // Auth
    loginTitle: "Willkommen zurück",
    signupTitle: "Treten Sie der Elite bei",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    noAccount: "Kein Konto?",
    haveAccount: "Haben Sie bereits ein Konto?",
    usernameLabel: "Benutzername",
    profileTitle: "Mein Profil",
    logout: "Abmelden",
};
