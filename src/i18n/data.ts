import { Compound, SalesNotificationData, TeaserTableData } from '@/shared/types/types';

export const commonCompounds: Compound[] = [
    { id: 'test_e', name: 'Testosterone Enanthate', nameAr: 'تيستوستيرون إينانثات', halfLife: 4.5, esterWeight: 0.72, tips: ['Use twice weekly', 'Standard base for any cycle'] },
    { id: 'test_p', name: 'Testosterone Propionate', nameAr: 'تيستوستيرون بروبيونات', halfLife: 0.8, esterWeight: 0.83, tips: ['Inject daily or EOD', 'Fast acting'] },
    { id: 'test_c', name: 'Testosterone Cypionate', nameAr: 'تيستوستيرون سيبيونات', halfLife: 5, esterWeight: 0.70, tips: ['Similar to Enanthate', 'Inject twice weekly'] },
    { id: 'deca', name: 'Deca Durabolin (Nandrolone)', nameAr: 'ديكا ديورابولين', halfLife: 7, esterWeight: 0.64, tips: ['Good for joints', 'Requires Test base'] },
    { id: 'tren_a', name: 'Trenbolone Acetate', nameAr: 'ترينبولون أسيتات', halfLife: 1, esterWeight: 0.87, tips: ['Very potent', 'Short half-life', 'Potential insomnia'] },
    { id: 'tren_e', name: 'Trenbolone Enanthate', nameAr: 'ترينبولون إينانثات', halfLife: 5.5, esterWeight: 0.70, tips: ['Powerful bulker', 'Long half-life'] },
    { id: 'bold', name: 'Equipoise (Boldenone)', nameAr: 'بولدينون (إكويبويز)', halfLife: 14, esterWeight: 0.61, tips: ['Increases appetite', 'Very long half-life'] },
    { id: 'mast_e', name: 'Masteron Enanthate', nameAr: 'ماسترون إينانثات', halfLife: 4.5, esterWeight: 0.70, tips: ['Hardener', 'Good for cutting'] },
    { id: 'mast_p', name: 'Masteron Propionate', nameAr: 'ماسترون بروبيونات', halfLife: 1, esterWeight: 0.83, tips: ['Short ester', 'Use near end of cut'] },
    { id: 'primo', name: 'Primobolan (Methenolone)', nameAr: 'بريموبولان', halfLife: 5, esterWeight: 0.70, tips: ['High quality gains', 'Very safe'] },
    { id: 'anadrol', name: 'Anadrol (Oxymetholone)', nameAr: 'أنادرول (أوكسيميثولون)', halfLife: 0.4, esterWeight: 1.0, tips: ['Oral', 'Very strong size/strength', 'High water retention'] },
    { id: 'win_o', name: 'Winstrol (Oral)', nameAr: 'وينسترول (فموي)', halfLife: 0.4, esterWeight: 1.0, tips: ['Dry gains', 'Great for cutting', 'Joint pain possible'] },
    { id: 'win_i', name: 'Winstrol (Injectable)', nameAr: 'وينسترول (حقن)', halfLife: 1.0, esterWeight: 1.0, tips: ['Similar to oral but higher bio-availability', 'Often injected daily'] },
    { id: 'npp', name: 'NPP (Nandrolone Phenylpropionate)', nameAr: 'NPP (ناندرولون فينايل)', halfLife: 2.0, esterWeight: 0.67, tips: ['Short ester Deca', 'Faster relief', 'Inject EOD'] },
    { id: 'tbol', name: 'Turinabol', nameAr: 'تورينبول', halfLife: 0.6, esterWeight: 1.0, tips: ['Lean gains', 'No water retention', 'Great for performance'] },
    { id: 'sdrol', name: 'Superdrol', nameAr: 'سوبردرول', halfLife: 0.4, esterWeight: 1.0, tips: ['extremely potent oral', 'Brutal strength', 'Liver toxic - stay under 4 weeks'] },
    { id: 'proviron', name: 'Proviron', nameAr: 'بروفيرون', halfLife: 0.5, esterWeight: 1.0, tips: ['Hardener', 'Libido boost', 'SHBG binder'] },
    { id: 'arimidex', name: 'Arimidex (Anastrozole)', nameAr: 'أريدميكس (أناستروزول)', halfLife: 2.0, esterWeight: 1.0, tips: ['Aromatase Inhibitor', 'Controls estrogen', 'Take 0.5mg EOD or as needed'] },
    { id: 'anavar', name: 'Anavar (Oxandrolone)', nameAr: 'أنافار', halfLife: 0.4, esterWeight: 1.0, tips: ['Oral', 'Great for strength/cutting'] },
    { id: 'dbol', name: 'Dianabol (Methandienone)', nameAr: 'ديانابول', halfLife: 0.2, esterWeight: 1.0, tips: ['Oral', 'Massive water retention/strength'] }
];

export const teaserTablesEN: TeaserTableData[] = [
    {
        title: "Beginner Bulking Cycle (Sample)",
        headers: ["Week", "Compound", "Dosage"],
        rows: [
            { col1: "1-12", col2: "Testosterone Enanthate", col3: "500mg / week" },
            { col1: "1-4", col2: "Dianabol (Kickstart)", col3: "30mg / day" },
            { col1: "1-12", col2: "Arimidex", col3: "0.5mg / EOD" }
        ]
    }
];

export const teaserTablesAR: TeaserTableData[] = [
    {
        title: "جدول تضخيم للمبتدئين (عيّنة)",
        headers: ["الأسبوع", "المادة", "الجرعة"],
        rows: [
            { col1: "1-12", col2: "Testosterone Enanthate", col3: "500mg / أسبوع" },
            { col1: "1-4", col2: "Dianabol (Kickstart)", col3: "30mg / يوم" },
            { col1: "1-12", col2: "Arimidex", col3: "0.5mg / يوم وترك" }
        ]
    },
    {
        title: "جدول تنشيف متقدم (عيّنة)",
        headers: ["الأسبوع", "المادة", "الجرعة"],
        rows: [
            { col1: "1-4", col2: "Testosterone Propionate", col3: "100mg / يوم بعد يوم" },
            { col1: "1-4", col2: "Trenbolone Acetate", col3: "75mg / يوم بعد يوم" },
            { col1: "1-8", col2: "Masteron Propionate", col3: "100mg / يوم بعد يوم" },
            { col1: "5-10", col2: "Winstrol (Injectable)", col3: "50mg / يوم بعد يوم" }
        ]
    }
];

// SEO Keywords Pools
export const seoKeywordsArabic: string[] = [
    "ستيرويدات لتنشيف الدهون", "هرمونات بناء العضلات", "دليل المنشطات الشامل", "كورس تضخيم للمبتدئين",
    "أعراض جانبية للستيرويد", "طريقة حقن التيستوستيرون", "افضل أنواع الهرمونات", "تجهيز بطولات كمال أجسام",
    "مكملات غذائية بديلة", "بروتينات طبيعية", "حوارق دهون قوية", "منظفات الهرمونات PCT",
    "علاج الجينو", "كورس ديكا وتيست", "أنادرول وبولديناون", "فترة عمر النصف للهرمون",
    "تحاليل الدم للاعبي كمال الأجسام", "تغذية الرياضيين", "جدول تمارين القوة", "جينات كمال الأجسام",
    "التحول الجسماني الطبيعي", "مخاطر الهرمونات", "فحوصات الكبد والكلى", "زيادة التستوستيرون طبيعياً",
    "دليل السايكل الاحترافي", "حماية المفاصل في التمرين", "معدلات الدهون المثالية", "تنشيف العضلات باحتراف",
    "أسرار الضخامة العضلية", "مدرات البول الرياضية", "هرمون النمو جي اتش", "جي اتش للتنشيف",
    "الانسولين وكمال الأجسام", "بروتوكولات التخسيس", "نظام الكيتو دايت", "الصيام المتقطع للمحترفين",
    "تمارين الصدر والظهر", "تقوية الأرجل", "توسيع عضلة الكتف", "قوة التحمل العضلي",
    "الريكفري بعد التمرين", "علاج الإصابات الرياضية", "تصارير هرمونات", "تجارب حقيقية مع الهرمونات",
    "مستر أولمبيا", "برامج تغذية مخصصة", "حساب السعرات والماكروز", "توزيع الوجبات",
    "نصائح الخبراء في الحديد", "أمان استخدام الهرمونات"
];

export const seoKeywordsEnglish: string[] = [
    "Anabolic Steroids Guide", "Muscle Building Hormones", "Fat Loss Steroids", "Steroid Cycles for Beginners",
    "Testosterone Injection Guide", "Side Effects of Steroids", "Post Cycle Therapy PCT", "Bodybuilding Supplements",
    "Natural Bodybuilding Tips", "Fat Burners for Athletes", "Liver Support Supplements", "Kidney Function for Bodybuilders",
    "Deca Durabolin Cycle", "Anadrol vs Dianabol", "Trenbolone Acetate Benefits", "Hormone Half-Life Table",
    "Bodybuilding Blood Work", "Sports Nutrition Plans", "Strength Training Routines", "Genetic Potential Calculator",
    "Natural Physique Transformation", "Hormonal Health Risks", "Boosting Testosterone Naturally", "Professional Cycle Procotols",
    "Joint Support for Lifters", "Body Fat Percentage Goals", "Ripped Muscle Definition", "Mass Gaining Secrets",
    "Diuretics in Bodybuilding", "HGH Benefits for Cutting", "Insulin Sensitivity and Muscle", "Weight Loss Protocols",
    "Keto Diet for Athletes", "Intermittent Fasting Tips", "Hypertrophy Training Manual", "Squat and Deadlift Forms",
    "Muscle Recovery Techniques", "Injury Prevention in Sports", "Steroid Profile Database", "Real Steroid Experience",
    "Mr Olympia Training", "Custom Nutrition Software", "Macro and Calorie Calc", "Meal Distribution Timing",
    "Elite Coaching Methods", "Pharmaceutical Grade Standards", "Safe AAS Usage", "Growth Hormone Cycles",
    "Cutting Cycle Ingredients", "Bulking Stack Recommendations"
];

// Footer Keywords Pools
export const footerKeywordsPoolAr: string[] = [
    "علم الستيرويد العربي", "أمان الهرمونات", "الاحتراف في كمال الأجسام", "موسوعة المكملات",
    "بروتوكول حقن الزيت", "إدارة الآثار الجانبية", "التعافي الهرموني", "قوة الأداء الرياضي",
    "نصائح التغذية الذكية", "تحليل المختبر الرياضي", "الوراثة والجينات", "مهندس السايكل",
    "دليل المواد المنشطة", "صحة القلب للرياضيين", "تجنب المغشوش", "أفضل ممارسات التدريب",
    "توازن الهرمونات", "إفراز التستوستيرون", "حماية الكبد", "الوقاية من الفشل الكلوي",
    "نظام التدريب المتقدم", "العقل والمصل", "ثقافة الحديد", "مرجع المختبرات الذكي",
    "خريطة الحقن الآمنة", "بناء الأجسام العلمي", "مستر إكس ستيرويد", "دليل المحترفين",
    "الحقن الموضعي", "امتصاص البروتين", "الميتابولزم وحرق الدهون", "زيادة الكتلة الصافية",
    "الفيتامينات للرياضيين", "المعادن وبناء العضلات", "صحة المفاصل", "الاستشفاء العضلي",
    "تدريب القوة الانفجارية", "ميكانيكا التمرين", "أسرار جينات الأبطال", "تقييم فورمة الجسم",
    "تحليل FFMI", "النسبة الذهبية للجسم", "تخطيط الوجبات الآلي", "حساب السعرات الاحترافي",
    "تقنيات تنشيف الجلد", "تحقيق البطولات", "أخلاقيات كمال الأجسام", "مستقبل الرياضة",
    "تكنولوجيا الهرمونات", "العلم والحديد"
];

export const footerKeywordsPoolEn: string[] = [
    "Steroid Science Hub", "Hormone Safety Protocols", "Bodybuilding Excellence", "Supplement Encyclopedia",
    "Oil Injection Mastery", "Side Effect Management", "Hormonal Recovery Plan", "Peak Athletic Performance",
    "Intelligent Nutrition Tips", "Sports Lab Analysis", "Genetics and Physique", "Cycle Architect Pro",
    "AAS Reference Guide", "Athlete Heart Health", "Counterfeit Prevention", "Optimal Training Methods",
    "Hormonal Balance", "Natural T-Booster", "Liver Protection Guide", "Kidney Health for Lifters",
    "Advanced Training Systems", "Mind and Muscle", "Iron Culture", "Smart Lab Reference",
    "Safe Injection Map", "Scientific Bodybuilding", "Mr X Steroid Edition", "Pros Handbook",
    "Localized Injections", "Protein Synthesis Optimization", "Metabolism Burn Rate", "Lean Mass Gains",
    "Vitamins for Lifters", "Minerals and Growth", "Joint Health Solutions", "Muscle Restoration",
    "Explosive Strength Training", "Exercise Mechanics", "Elite Genetic Secrets", "Physique Assessment",
    "FFMI Analysis Tool", "Golden Ratio Calculation", "Automated Meal Planning", "Pro Calorie Calc",
    "Skin Thinning Techniques", "Championship Preparation", "Bodybuilding Ethics", "Future of Fitness",
    "Hormonal Technology", "Science of Steel"
];

// Sales Data
export const salesDataAr: SalesNotificationData[] = [
    { name: "أحمد م.", location: "الرياض، السعودية" },
    { name: "خالد س.", location: "دبي، الإمارات" },
    { name: "عمر ج.", location: "القاهرة، مصر" },
    { name: "يوسف ع.", location: "جدة، السعودية" },
    { name: "سلطان ن.", location: "الكويت العاصمة، الكويت" },
    { name: "فيصل ح.", location: "الدوحة، قطر" },
    { name: "عبدالله ز.", location: "المنامة، البحرين" },
    { name: "ماجد ط.", location: "مسقط، عمان" },
    { name: "رامي ف.", location: "عمان، الأردن" },
    { name: "هيثم ب.", location: "بيروت، لبنان" },
    { name: "سامر ك.", location: "أربيل، العراق" },
    { name: "مشعل د.", location: "أبوظبي، الإمارات" }
];

export const salesDataEn: SalesNotificationData[] = [
    { name: "John D.", location: "New York, USA" },
    { name: "Michael S.", location: "London, UK" },
    { name: "David B.", location: "Toronto, Canada" },
    { name: "Robert K.", location: "Sydney, Australia" },
    { name: "James W.", location: "Dublin, Ireland" },
    { name: "Chris L.", location: "Auckland, New Zealand" },
    { name: "Alex P.", location: "Manchester, UK" },
    { name: "Mark H.", location: "Chicago, USA" },
    { name: "Stephen T.", location: "Vancouver, Canada" },
    { name: "Daniel R.", location: "Melbourne, Australia" },
    { name: "Kevin G.", location: "San Francisco, USA" },
    { name: "Paul M.", location: "Singapore City, Singapore" }
];

// Disclaimers
export const fullEnglishDisclaimer = `DISCLAIMER
COMPREHENSIVE DISCLAIMER
Mr. George Mourice (George Mourice) provides the maximum possible data regarding Anabolic Androgenic Steroids (AAS), Human Growth Hormone (HGH), peptides, and related substances. Anabolic Androgenic Steroids are muscle-building drugs widely known and illegal in all countries without a prescription. Anabolic Androgenic Steroids can be dangerous to your health and may lead to various types of serious side effects. We have an exceptionally detailed section on the side effects of Anabolic Androgenic Steroids, which must be read at least once. Anabolic Androgenic Steroids must only be used under the supervision of a qualified physician. We have numerous steroid profiles in the "Steroid Profile" section of our book. If you cannot find the answers you seek regarding a specific steroid, please refer to the open steroid discussion forums. Numerous individuals online are available to answer your inquiries. Please do not direct steroid-related questions to us, as we cannot and will not respond to such questions. Steroid laws vary worldwide; however, Anabolic Androgenic Steroids are illegal without a prescription. Please do not request that we sell or ship Anabolic Androgenic Steroids to you. If you find errors in our book, please contact us to report them. If you require medical assistance due to Anabolic Androgenic Steroid use, consult your physician immediately.

This book, titled "Mr. X-Steroid: The Ultimate Steroid Guide," is provided entirely by Mr. George Mourice (George Mourice). This page sets forth the terms under which you may use the book. Please read this page carefully. If you do not agree to the terms stated herein, you may not use the book. These terms may be revised at any time by updating this posting. You must visit this page periodically to review the terms, as they are binding upon you. By using this book, you agree to all terms and conditions set forth below.

Section 1: Purpose of the Book, Author’s Risk Disclaimer, and Educational Content
You hereby acknowledge that you are at least eighteen (18) years of age, or the age of full legal majority in your jurisdiction, whichever is higher, and possess full legal capacity and mental competence to understand and agree to this disclaimer in a binding manner. Use of this book is intended for adults only. This book provides customers with information of various types and formats concerning Anabolic Androgenic Steroids (AAS), including but not limited to: text, tables, charts, protocols, referenced dosages, detection times (Detection Times), injection methods, and illustrative images, presented solely for informational, educational, historical, and academic research purposes. This book does not recommend the use of steroids by any individual; it is an information-only resource. Using steroids without a specialist’s prescription violates government regulations. Moreover, using steroids or any drug without a prescription and specialist guidance can cause severe health side effects, potentially leading to death. The author did not create any statements in this book; they are presented from diverse sources, and neither the author nor publisher attests to or guarantees the accuracy of any information contained herein. Materials and information in the book may contain factual and/or typographical errors. The author makes no representations regarding the accuracy, reliability, completeness, or timeliness of the materials. Use of the book and any subsequent use of data appearing therein is at your sole and complete risk despite evident dangers. By accepting these terms and acknowledging below, you expressly acknowledge that you have been informed and agree not to hold the author liable in any manner, nor shall any person on your behalf hold the author liable, for any use of data or materials in this book. Periodic changes are made to the book and may occur at any time. Neither the author nor publisher warrants that the book will operate error-free or that the book and its server are free of computer viruses or other harmful malware. If your use of the book or materials necessitates servicing or replacing equipment or data, the author is not responsible for those costs. The book and materials are provided on an "AS IS" basis without any warranties of any kind. The author and its suppliers, to the fullest extent permitted by law, disclaim all warranties, including warranties of merchantability (Merchantability), non-infringement of third-party rights (Non-Infringement), and fitness for a particular purpose (Fitness for a Particular Purpose). Neither the author nor its suppliers warrant the accuracy, reliability, completeness, or timeliness of materials, services, software text, graphics, or links. The provided content does not constitute, and must not be considered: medical, therapeutic, or diagnostic advice; legal or regulatory advice; individualized performance enhancement or physical development guidance; or recommendation to purchase, use, or distribute any controlled substances. The author and publisher (George Mourice) make no express or implied warranties regarding the accuracy, completeness, reliability, or suitability of the information and fully disclaim liability for any errors or omissions in this content. To align with scientific advancements, users are advised to consult the latest medical studies on AAS risks, such as those published in journals like The New England Journal of Medicine or updates from the World Health Organization (WHO) on long-term hormone effects.

Section 2: Medical and Health Disclaimer
NOT MEDICAL ADVICE. Information in this book, including discussions of Anabolic Androgenic Steroids (AAS), Human Growth Hormone (HGH), peptides, or any performance-enhancing substances, does not substitute for consultation with a licensed physician or healthcare provider. Readers must always and without exception consult a qualified physician before: initiating any therapeutic, pharmaceutical, or hormonal regimen; altering diet or training programs; or using any drug, supplement, hormone, or chemical substance. 
SERIOUS AND POTENTIALLY FATAL HEALTH RISKS. Readers fully acknowledge and understand that non-therapeutic use of Anabolic Androgenic Steroids, hormones, and substances in this book (e.g., for athletic performance or muscle building) at supraphysiological doses (Supraphysiological Doses) carries extremely serious and potential risks, including but not limited to: acute and chronic liver/kidney damage; severe cardiovascular diseases (blood clots, strokes, heart attacks, cardiac hypertrophy, malignant hypertension); permanent hormonal disruptions (hypogonadism, testicular atrophy, permanent infertility, gynecomastia); severe psychiatric/neurological disorders (extreme aggression, major depression, anxiety, psychosis, suicidal ideation); irreversible damage to reproductive, nervous, and endocrine systems; cancer (especially liver and prostate); and sudden death. The author and publisher (George Mourice) fully and absolutely disclaim liability for any health consequences—temporary, permanent, or fatal—arising directly or indirectly from reading, applying, or misapplying information in this book. 
ABSOLUTE NO GUARANTEE OF RESULTS. The author and publisher (George Mourice) do not guarantee any specific outcomes from applying protocols, cycles (Cycles), dosages, exercises, diets, or supplements mentioned. Physiological responses to hormones and substances vary radically among individuals due to genetic, environmental, lifestyle, baseline health, drug interactions, and other unpredictable factors. 
MANDATORY MEDICAL SUPERVISION. Any individual considering use of mentioned substances must undergo comprehensive specialized medical evaluations (complete blood panels, cardiovascular assessment, liver/kidney function tests, full hormonal profiling, imaging studies) before, during, and after use under direct, ongoing supervision by a specialist physician.

Section 3: Legal and Regulatory Disclaimer
Anabolic Androgenic Steroids are strictly controlled substances. Readers fully acknowledge that Anabolic Androgenic Steroids and many other substances in this book are Schedule III Controlled Substances under U.S. federal law (Anabolic Steroid Control Act of 1990 and 2004), as well as under similar laws in most countries worldwide, including United Nations Conventions on Narcotic Drugs and their updates through 2025, which intensify international controls on online distribution. Possession, use, purchase, sale, distribution, importation, or exportation without a valid prescription from a licensed physician for an FDA-approved or equivalent regulatory-approved medical indication constitutes a serious federal crime punishable by imprisonment and substantial fines. 
FULL LEGAL COMPLIANCE RESPONSIBILITY RESTS WITH THE READER. Readers bear sole, absolute, and complete responsibility to verify and strictly comply with all applicable local, national, and international laws, regulations, and legislation in their jurisdiction regarding: possession, personal use, cross-border importation/exportation, purchase, sale, distribution, or transfer of mentioned substances. 
ABSOLUTE NO ENCOURAGEMENT OR SUPPORT FOR ILLEGAL USE. The author and publisher (George Mourice) do not encourage, advocate, support, facilitate, or recommend in any manner the illegal use or misuse of any substance in this book. All information on cycles (Cycles), dosages, detection times (Detection Times), injection methods, test-evasion strategies, or stacking is provided exclusively for educational, historical, and academic research purposes regarding established scientific, medical, and known practices (whether legal or illegal) and does not constitute invitation, practical guidance, or encouragement for application. 
SPORTS LAWS AND INTERNATIONAL COMPETITIONS. Readers expressly acknowledge that use of Anabolic Androgenic Steroids and mentioned substances is fully prohibited by nearly all international, national, and local sports organizations, including but not limited to: World Anti-Doping Agency (WADA) and its 2025 updates covering new synthetic peptides; International Olympic Committee (IOC); all professional sports federations (NFL, NBA, MLB, NHL, UFC, FIFA, etc.); collegiate sports federations (NCAA, etc.). Use in competitive contexts constitutes cheating, deception, and egregious ethical violation, potentially resulting in severe penalties (lifetime bans, massive fines, title/medal/award revocation, career destruction).

Section 4: Use of Materials, User Submissions, and Communications
The author authorizes you to view and download one copy of the material in this book solely for personal, non-commercial use. Special standards may apply to certain software and other items; such guidelines are recorded in the book and incorporated herein by reference. Book contents—text, designs, images, and other materials—are protected by copyright laws (Copyright Laws). Unauthorized use may violate copyright, trademark (Trademarks), and other regulations. You must retain all copyright and proprietary notices on any copies. 
You may not sell, modify, imitate, publicly display, distribute, or use the material for any public or commercial purpose. Use in another book or networked computer environment is prohibited. Violation terminates your permission automatically; you must immediately destroy all copies. Generally, communications you post in the book are non-confidential. If specific pages permit confidential submissions, this will be stated in legal notices on those pages. By submitting communications, you automatically grant the author a non-exclusive, perpetual, irrevocable, royalty-free (Royalty-Free) license to use, reproduce, modify, publish, edit, translate, distribute, perform, and display the communications alone or as part of other works in any form, media, or technology now known or later developed, and to sublicense such rights through multiple tiers. As a user, you are responsible for your communications and their posting consequences. 
You must not: post copyrighted material without ownership or permission; post trade secrets without ownership or permission; post material infringing others’ intellectual property rights (Intellectual Property Rights), privacy, or publicity; post obscene, defamatory, threatening, harassing, abusive, hateful, or embarrassing material; post explicit pornography; post advertisements or commercial solicitations; post spam or pyramid schemes; or impersonate others. The author does not endorse, guarantee integrity, accuracy, or reliability of user-posted communications or opinions expressed. Reliance on user-posted material is at your own risk. The author does not pre-screen communications and is not responsible for screening or monitoring user posts. If notified of non-compliant communications, the author may investigate and decide in good faith to remove or request removal. The author bears no liability for performing or not performing such actions. The author reserves the right to expel users, prevent further access for violating this agreement or law, and remove offensive, illegal, or disruptive communications.

Section 5: Links to Third-Party Sites, Software Licenses, and Limitation of Liability
The book contains links to third-party sites provided solely for convenience, not as endorsement. The author is not responsible for linked site content or accuracy and makes no representations regarding them. Access to linked sites is at your own risk. All downloadable software is copyrighted and may be protected by other rights. Use is subject to accompanying license agreements; downloading and use require agreement to license terms. Unless expressly stated in a product license or legal notice, the author’s total liability for all claims arising from material use (including software) is limited to US$100. Neither the author, suppliers, nor any third parties mentioned shall be liable for any damages whatsoever (including incidental, consequential, lost profits, data loss, or business interruption) arising from use or inability to use the book or materials, whether based on warranty, contract, tort, or other legal theory, regardless of notice of possibility.

Section 6: Reader’s Acknowledgment, Full Assumption of Risk, and Indemnification
By purchasing, downloading, reading, using, or accessing this book in any manner, you irrevocably acknowledge: FULL AND ABSOLUTE RESPONSIBILITY. You bear sole, absolute, and complete responsibility for: any decisions, actions, or measures taken based on book information; any damages, injuries, illnesses, or adverse consequences (health, psychological, legal, financial, social, professional, or otherwise) arising directly or indirectly from reading, applying, or misapplying information in this book. 
FULL INDEMNIFICATION AND ABSOLUTE HOLD HARMLESS. You irrevocably agree to: fully defend the author and publisher (George Mourice); fully indemnify them for losses or costs; absolutely hold them harmless from any legal or moral liability against all claims (Claims), civil/criminal lawsuits (Lawsuits), financial losses (Losses), physical/moral damages (Damages), expenses/costs (including reasonable legal/accounting fees), and liabilities arising from or related to: your use, application, or misapplication of content; your violation of local, national, or international laws/regulations; your negligence, omission, or misjudgment; or your reckless/irresponsible acts/decisions. You agree to defend, indemnify, and hold harmless the author, officers, directors, employees, and agents from all claims, actions, or demands—including reasonable legal/accounting fees—brought by you, on your behalf, or by any third party alleging harm to property or persons from your alleged use of book materials/data (including software) or breach of this agreement. The author will notify you promptly. 
VOLUNTARY AND INFORMED ASSUMPTION OF RISK. You clearly acknowledge: receiving clear, sufficient, detailed warnings on serious health and legal risks; fully understanding these risks and consequences; voluntarily assuming with full free will and awareness all associated risks; and waiving any right to sue or claim compensation from the author/publisher. 
LEGAL AGE AND FULL LEGAL CAPACITY. You warrant: being of legal age (at least 18 or full majority in your jurisdiction, whichever higher); possessing full legal capacity and mental competence to understand and bind to this disclaimer; and not being coerced, deceived, or manipulated into agreement.

Section 7: Information Currency and No Obligation to Update
The book may contain typographical, technical, scientific, or informational errors. Information may become outdated, inaccurate, or incomplete due to rapid scientific/medical research advancements, regulatory changes, or new evidence—such as recent WADA prohibited substance updates or EU Medicines Law digital control enhancements on controlled substances. The author and publisher (George Mourice) are under no obligation to update, correct, or revise content to reflect future changes or fix errors.

Section 8: Severability, Enforcement, and Final Binding Consent
If any provision is held unenforceable, invalid, or void under applicable law in any jurisdiction: it shall be modified or interpreted narrowly to be enforceable to the maximum extent permitted; remaining provisions remain fully effective and binding. This disclaimer is integral to the book and forms a binding legal agreement between reader and author/publisher. By reading, purchasing, downloading, or using this book in any way, you confirm and warrant: full careful reading of this disclaimer; complete understanding of all terms, conditions, and risks; full absolute agreement without reservation; and legal binding commitment. If you disagree with any part, you must: immediately cease reading/using the book; delete digital copies; and return physical copies for full refund (if applicable).

Publication Date: 2025
Author and Publisher: George Mourice
Platforms: Multiple (www.MrXSteroid.com  and other global publishing platforms)
© 2025 George Mourice. All Rights Reserved.`;

export const fullArabicDisclaimer = `إخلاء مسؤولية
إخلاء مسؤولية شامل
يقدم السيد جورج موريس (George Mourice) أقصى قدر ممكن من البيانات المتعلقة بالستيرويدات الابتنائية الأندروجينية (AAS)، وهرمون النمو البشري (HGH)، والببتيدات، والمواد ذات الصلة. الستيرويدات الابتنائية الأندروجينية هي أدوية بناء للعضلات معروفة على نطاق واسع وهي غير قانونية في جميع البلدان بدون وصفة طبية. يمكن أن تكون الستيرويدات الابتنائية الأندروجينية خطرة على صحتك وقد تؤدي إلى أنواع مختلفة من الآثار الجانبية الخطيرة. لدينا قسم مفصل بشكل استثنائي حول الآثار الجانبية للستيرويدات الابتنائية الأندروجينية، والذي يجب قراءته مرة واحدة على الأقل. يجب استخدام الستيرويدات الابتنائية الأندروجينية فقط تحت إشراف طبيب مؤهل. لدينا العديد من ملفات الستيرويد في قسم "ملف الستيرويد" في كتابنا. إذا لم تتمكن من العثور على الإجابات التي تبحث عنها بخصوص ستيرويد معين، يرجى الرجوع إلى منتديات النقاش المفتوحة حول الستيرويدات. هناك العديد من الأفراد المتاحين عبر الإنترنت للإجابة على استفساراتك. يرجى عدم توجيه الأسئلة المتعلقة بالستيرويد إلينا، لأننا لا نستطيع ولن نجيب على مثل هذه الأسئلة. تختلف قوانين الستيرويد في جميع أنحاء العالم؛ ومع ذلك، تعتبر الستيرويدات الابتنائية الأندروجينية غير قانونية بدون وصفة طبية. يرجى عدم الطلب منا بيع أو شحن الستيرويدات الابتنائية الأندروجينية إليك. إذا وجدت أخطاء في كتابنا، يرجى الاتصال بنا للإبلاغ عنها. إذا كنت بحاجة إلى مساعدة طبية بسبب استخدام الستيرويدات الابتنائية الأندروجينية، فاستشر طبيبك على الفور.

هذا الكتاب، بعنوان "Mr. X-Steroid: The Ultimate Steroid Guide"، مقدم بالكامل من قبل السيد جورج موريس (George Mourice). تحدد هذه الصفحة الشروط التي يمكنك بموجبها استخدام الكتاب. يرجى قراءة هذه الصفحة بعناية. إذا كنت لا توافق على الشروط المذكورة هنا، فلا يجوز لك استخدام الكتاب. يمكن مراجعة هذه الشروط في أي وقت عن طريق تحديث هذا المنشور. يجب عليك زيارة هذه الصفحة بشكل دوري لمراجعة الشروط، لأنها ملزمة لك. باستخدام هذا الكتاب، فإنك توافق على جميع الشروط والأحكام الموضحة أدناه.

القسم 1: غرض الكتاب، إخلاء مسؤولية المؤلف من المخاطر، والمحتوى التعليمي
تقر بموجب هذا بأنك لا تقل عن ثمانية عشر (18) عاماً، أو سن الأغلبية القانونية الكاملة في ولايتك القضائية، أيهما أعلى، وتمتلك الأهلية القانونية الكاملة والكفاءة العقلية لفهم والموافقة على إخلاء المسؤولية هذا بطريقة ملزمة. استخدام هذا الكتاب مخصص للبالغين فقط. يقدم هذا الكتاب للعملاء معلومات من أنواع وتنسيقات مختلفة تتعلق بالستيرويدات الابتنائية الأندروجينية (AAS)، بما في ذلك على سبيل المثال لا الحصر: النصوص، الجداول، المخططات، البروتوكولات، الجرعات المرجعية، أوقات الكشف (Detection Times)، طرق الحقن، والصور التوضيحية، المقدمة حصرياً لأغراض البحث التاريخي والأكاديمي والتعليمي والإعلامي. لا يوصي هذا الكتاب باستخدام الستيرويدات من قبل أي فرد؛ إنه مورد للمعلومات فقط. استخدام الستيرويدات بدون وصفة طبية من أخصائي ينتهك اللوائح الحكومية. علاوة على ذلك، فإن استخدام الستيرويدات أو أي دواء بدون وصفة طبية وإرشادات أخصائي يمكن أن يسبب آثاراً جانبية صحية شديدة، مما قد يؤدي إلى الوفاة. لم يقدم المؤلف أي ادعاءات في هذا الكتاب؛ يتم تقديمها من مصادر متنوعة، ولا يشهد المؤلف ولا الناشر أو يضمنان دقة أي معلومات واردة هنا. قد تحتوي المواد والمعلومات الموجودة في الكتاب على أخطاء واقعية و/أو مطبعية. لا يقدم المؤلف أي تعهدات فيما يتعلق بدقة أو موثوقية أو اكتمال أو حداثة المواد. استخدام الكتاب وأي استخدام لاحق للبيانات التي تظهر فيه يقع على مسؤوليتك الشخصية والكاملة رغم المخاطر الواضحة. بقبول هذه الشروط والإقرار أدناه، فإنك تقر صراحةً بأنه قد تم إبلاغك وتوافق على عدم تحميل المؤلف المسؤولية بأي شكل من الأشكال، كما لا يجوز لأي شخص نيابة عنك تحميل المؤلف المسؤولية، عن أي استخدام للبيانات أو المواد في هذا الكتاب. يتم إجراء تغييرات دورية على الكتاب وقد تحدث في أي وقت. لا يضمن المؤلف ولا الناشر أن الكتاب سيعمل بدون أخطاء أو أن الكتاب وخادمه خاليان من فيروسات الكمبيوتر أو البرامج الضارة الأخرى. إذا استلزم استخدامك للكتاب أو المواد صيانة أو استبدال المعدات أو البيانات، فإن المؤلف غير مسؤول عن تلك التكاليف. يتم تقديم الكتاب والمواد على أساس "كما هي" دون أي ضمانات من أي نوع. يتنصل المؤلف وموردوه، إلى أقصى حد يسمح به القانون، من جميع الضمانات، بما في ذلك ضمانات القابلية للتسويق (Merchantability)، وعدم انتهاك حقوق الأطراف الثالثة (Non-Infringement)، والملاءمة لغرض معين (Fitness for a Particular Purpose). لا يضمن المؤلف ولا موردوه دقة أو موثوقية أو اكتمال أو حداثة المواد أو الخدمات أو نصوص البرامج أو الرسومات أو الروابط. لا يشكل المحتوى المقدم، ولا يجب اعتباره: نصيحة طبية أو علاجية أو تشخيصية؛ نصيحة قانونية أو تنظيمية؛ إرشادات فردية لتعزيز الأداء أو التطوير البدني؛ أو توصية بشراء أو استخدام أو توزيع أي مواد خاضعة للرقابة. لا يقدم المؤلف والناشر (جورج موريس) أي ضمانات صريحة أو ضمنية فيما يتعلق بدقة أو اكتمال أو موثوقية أو ملاءمة المعلومات، ويتنصلان تماماً من المسؤولية عن أي أخطاء أو سهو في هذا المحتوى. لمواكبة التطورات العلمية، يُنصح المستخدمون باستشارة أحدث الدراسات الطبية حول أخطار AAS، مثل تلك المنشورة في مجلات مثل The New England Journal of Medicine أو تحديثات منظمة الصحة العالمية (WHO) حول آثار الهرمونات طويلة المدى.

القسم 2: إخلاء المسؤولية الطبي والصحي
ليست نصيحة طبية. المعلومات الواردة في هذا الكتاب، بما في ذلك مناقشات الستيرويدات الابتنائية الأندروجينية (AAS)، وهرمون النمو البشري (HGH)، والببتيدات، أو أي مواد محسنة للأداء، لا تغني عن استشارة طبيب مرخص أو مقدم رعاية صحية. يجب على القراء دائماً وبدون استثناء استشارة طبيب مؤهل قبل: البدء في أي نظام علاجي أو دوائي أو هرموني؛ تغيير النظام الغذائي أو برامج التدريب؛ أو استخدام أي دواء أو مكمل أو هرمون أو مادة كيميائية.
مخاطر صحية خطيرة وربما قاتلة. يقر القراء تماماً ويفهمون أن الاستخدام غير العلاجي للستيرويدات الابتنائية الأندروجينية والهرمونات والمواد الواردة في هذا الكتاب (على سبيل المثال، للأداء الرياضي أو بناء العضلات) بجرعات فوق فسيولوجية (Supraphysiological Doses) ينطوي على مخاطر جسيمة ومحتملة للغاية، بما في ذلك على سبيل المثال لا الحصر: تلف الكبد/الكلى الحاد والمزمن؛ أمراض القلب والأوعية الدموية الشديدة (الجلطات الدموية، السكتات الدماغية، النوبات القلبية، تضخم القلب، ارتفاع ضغط الدم الخبيث)؛ اضطرابات هرمونية وفطرية دائمة (قصور الغدد التناسلية، ضمور الخصية، العقم الدائم، التثدي)؛ اضطرابات نفسية/عصبية شديدة (عدوانية شديدة، اكتئاب حاد، قلق، ذهان، أفكار انتحارية)؛ أضرار لا يمكن إصلاحها في الأنظمة التناسلية والعصبية والغدد الصماء؛ السرطان (خاصة الكبد والبروستاتا)؛ والموت المفاجئ. يتنصل المؤلف والناشر (جورج موريس) تماماً وبشكل مطلق من المسؤولية عن أي عواقب صحية - مؤقتة أو دائمة أو قاتلة - تنشأ بشكل مباشر أو غير مباشر عن قراءة أو تطبيق أو سوء تطبيق المعلومات الواردة في هذا الكتاب.
عدم وجود ضمان مطلق للنتائج. لا يضمن المؤلف والناشر (جورج موريس) أي نتائج محددة من تطبيق البروتولات أو الدورات (Cycles) أو الجرعات أو التمارين أو الأنظمة الغذائية أو المكملات المذكورة. تختلف الاستجابة الفسيولوجية للهرمونات والمواد بشكل جذري بين الأفراد بسبب العوامل الوراثية والبيئية ونمط الحياة والصحة الأساسية والتفاعلات الدوائية وغيرها من العوامل غير المتوقعة.
الإشراف الطبي الإلزامي. يجب على أي فرد يفكر في استخدام المواد المذكورة الخضوع لتقييمات طبية متخصصة شاملة (لوحات دم كاملة، تقييم القلب والأوعية الدموية، اختبارات وظائف الكبد/الكلى، ملف هرموني كامل، دراسات التصوير) قبل وأثناء وبعد الاستخدام تحت إشراف مباشر ومستمر من قبل طبيب متخصص.

القسم 3: إخلاء المسؤولية القانوني والتنظيمي
الستيرويدات الابتنائية الأندروجينية هي مواد خاضعة لرقابة صارمة. يقر القراء تماماً بأن الستيرويدات الابتنائية الأندروجينية والعديد من المواد الأخرى في هذا الكتاب هي مواد خاضعة للرقابة من الجدول الثالث بموجب القانون الفيدرالي الأمريكي (قانون التحكم في الستيرويدات الابتنائية لعام 1990 و2004)، وكذلك بموجب قوانين مماثلة في معظم البلدان حول العالم، بما في ذلك اتفاقيات الأمم المتحدة بشأن المخدرات وتتحديثاتها حتى عام 2025، والتي تكثف الضوابط الدولية على التوزيع عبر الإنترنت. إن حيازة أو استخدام أو شراء أو بيع أو توزيع أو استيراد أو تصدير هذه المواد بدون وصفة طبية صالحة من طبيب مرخص لدواعٍ طبية معتمدة من إدارة الغذاء والدواء (FDA) أو ما يعادلها من الجهات التنظيمية المعتمدة يشكل جريمة فيدرالية خطيرة يعاقب عليها بالسجن وغرامات باهظة.
مسؤولية الامتثال القانوني الكامل تقع على عاتق القارئ. يتحمل القراء المسؤولية الفردية والمطلقة والكاملة للتحقق والامتثال الصارم لجميع القوانين واللوائح والتشريعات المحلية والوطنية والدولية المعمول بها في ولايتهم القضائية فيما يتعلق بـ: حيازة، أو استخدام شخصي، أو استيراد/تصدير عبر الحدود، أو شراء، أو بيع، أو توزيع، أو نقل المواد المذكورة.
لا يوجد تشجيع أو دعم للاستخدام غير القانوني. لا يشجع المؤلف والناشر (جورج موريس) أو يدافعان أو يدعمان أو يسهلان أو يوصيان بأي شكل من الأشكال بالاستخدام غير القانوني أو سوء الاستخدام لأي مادة في هذا الكتاب. يتم تقديم جميع المعلومات المتعلقة بالدورات (Cycles)، والجرعات، وأوقات الكشف (Detection Times)، وطرق الحقن، واستراتيجيات التهرب من الاختبارات، أو الدمج (Stacking) حصرياً لأغراض البحث الأكاديمي والتاريخي والتعليمي فيما يتعلق بالممارسات العلمية والطبية والمعروفة (سواء كانت قانونية أو غير قانونية) ولا تشكل دعوة أو إرشادات عملية أو تشجيعاً للتطبيق.
قوانين الرياضة والمسابقات الدولية. يقر القراء صراحةً بأن استخدام الستيرويدات الابتنائية الأندروجينية والمواد المذكورة محظور تماماً من قبل جميع المنظمات الرياضية الدولية والوطنية والمحلية تقريباً، بما في ذلك على سبيل المثال لا الحصر: الوكالة العالمية لمكافحة المنشطات (WADA) وتحديثاتها لعام 2025 التي تغطي الببتيدات الاصطناعية الجديدة؛ اللجنة الأولمبية الدولية (IOC)؛ جميع الاتحادات الرياضية المهنية (NFL, NBA, MLB, NHL, UFC, FIFA، إلخ)؛ الاتحادات الرياضية الجامعية (NCAA، إلخ). يشكل الاستخدام في السياقات التنافسية غشاً وخداعاً وانتهاكاً أخلاقياً صارخاً، مما قد يؤدي إلى عقوبات شديدة (حظر مدى الحياة، غرامات باهظة، سحب الألقاب/الميداليات/الجوائز، تدمير المسيرة المهنية).

القسم 4: استخدام المواد، مساهمات المستخدمين، والاتصالات
يأذن لك المؤلف بعرض وتنزيل نسخة واحدة من المادة الموجودة في هذا الكتاب حصرياً للاستخدام الشخصي غير التجاري. قد تنطبق معايير خاصة على برامج معينة وعناصر أخرى؛ يتم تسجيل هذه الإرشادات في الكتاب ودمجها هنا بالرجوع إليها. محتويات الكتاب - النصوص، التصاميم، الصور، وغيرها من المواد - محمية بموجب قوانين حقوق النشر (Copyright Laws). قد يؤدي الاستخدام غير المصرح به إلى انتهاك حقوق النشر والعلامات التجارية (Trademarks) واللوائح الأخرى. يجب عليك الاحتفاظ بجميع حقوق النشر وإشعارات الملكية في أي نسخ.
لا يجوز لك بيع أو تعديل أو تقليد أو عرض علني أو توزيع أو استخدام المادة لأي غرض عام أو تجاري. يُحظر الاستخدام في كتاب آخر أو بيئة كمبيوتر شبكية. الانتهاك ينهي إذنك تلقائياً؛ يجب عليك تدمير جميع النسخ فوراً. بشكل عام، الاتصالات التي تنشرها في الكتاب غير سرية. إذا كانت صفحات معينة تسمح بتقديم مساهمات سرية، فسيتم ذكر ذلك في الإشعارات القانونية لتلك الصفحات. بتقديم الاتصالات، فإنك تمنح المؤلف تلقائياً ترخيصاً غير حصري، دائماً، غير قابل للإلغاء، ومعفى من الإتاوات (Royalty-Free) لاستخدام وإعادة إنتاج وتعديل ونشر وتحرير وترجمة وتوزيع وأداء وعرض الاتصالات بمفردها أو كجزء من أعمال أخرى في أي شكل أو وسيط أو تقنية معروفة الآن أو تم تطويرها لاحقاً، وترخيص هذه الحقوق من خلال مستويات متعددة. كمستخدم، أنت مسؤول عن اتصالاتك وعواقب نشرها.
يجب عليك عدم: نشر مواد محمية بحقوق النشر دون ملكية أو إذن؛ نشر أسرار تجارية دون ملكية أو إذن؛ نشر مواد تنتهك حقوق الملكية الفكرية للآخرين (Intellectual Property Rights)، أو الخصوصية، أو العلانية؛ نشر مواد مسيئة، تشهيرية، تهديدية، مضايقة، مسيئة، كراهية، أو محرجة؛ نشر إباحية صريحة؛ نشر إعلانات أو التماسات تجارية؛ نشر بريد عشوائي أو مخططات هرمية؛ أو انتحال شخصية الآخرين. لا يؤيد المؤلف أو يضمن سلامة أو دقة أو موثوقية الاتصالات المنشورة من قبل المستخدمين أو الآراء المعبر عنها. الاعتماد على المواد المنشورة من قبل المستخدم يكون على مسؤوليتك الخاصة. لا يقوم المؤلف بفحص الاتصالات مسبقاً وغير مسؤول عن فحص أو مراقبة منشورات المستخدمين. إذا تم إخطاره باتصالات غير ممتثلة، يجوز للمؤلف التحقيق واتخاذ قرار بحسن نية بإزالتها أو طلب إزالتها. لا يتحمل المؤلف أي مسؤولية عن القيام بهذه الإجراءات أو عدم القيام بها. يحتفظ المؤلف بالحق في طرد المستخدمين، ومنع الوصول الإضافي لانتهاك هذا الاتفاق أو القانون، وإزالة الاتصالات المسيئة أو غير القانونية أو المزعجة.

القسم 208: الروابط لمواقع الطرف الثالث، تراخيص البرامج، وحدود المسؤولية
يحتوي الكتاب على روابط لمواقع طرف ثالث مقدمة حصرياً للملائمة، وليس كدعم لها. المؤلف غير مسؤول عن محتوى المواقع المرتبطة أو دقتها ولا يقدم أي تعهدات بشأنها. الوصول إلى المواقع المرتبطة يكون على مسؤوليتك الخاصة. جميع البرامج القابلة للتنزيل محمية بحقوق النشر وقد تكون محمية بحقوق أخرى. الاستخدام يخضع لاتفاقيات الترخيص المصاحبة؛ التنزيل والاستخدام يتطلبان الموافقة على شروط الترخيص. ما لم يتم النص صراحةً في ترخيص منتج أو إشعار قانوني، فإن التزام المؤلف الإجمالي عن جميع المطالبات الناشئة عن استخدام المواد (بما في ذلك البرامج) يقتصر على 100 دولار أمريكي. لن يكون المؤلف أو الموردون أو أي أطراف ثالثة مذكورة مسؤولين عن أي أضرار مهما كانت (بما في ذلك الأضرار العرضية أو التبعية أو الأرباح المفقودة أو فقدان البيانات أو انقطاع الأعمال) الناشئة عن استخدام أو عدم القدرة على استخدام الكتاب أو المواد، سواء كان ذلك بناءً على ضمان أو عقد أو ضرر أو أي نظرية قانونية أخرى، بغض النظر عن الإخطار بالاحتمالية.

القسم 6: إقرار القارئ، الاحتمال الكامل للمخاطر، والتعويض
بشراء هذا الكتاب، أو تنزيله، أو قراءته، أو استخدامه، أو الوصول إليه بأي شكل من الأشكال، فإنك تقر بشكل لا رجعة فيه بـ: المسؤولية الكاملة والمطلقة. تتحمل المسؤولية الفردية والمطلقة والكاملة عن: أي قرارات أو أفعال أو تدابير يتم اتخاذها بناءً على معلومات الكتاب; أي أضرار أو إصابات أو أمراض أو عواقب سلبية (صحية، نفسية، قانونية، مالية، اجتماعية، مهنية، أو غير ذلك) تنشأ بشكل مباشر أو غير مباشر عن قراءة أو تطبيق أو سوء تطبيق أو سوء فهم المحتوى.
التعويض الكامل وإبراء الذمة المطلق. توافق بشكل لا رجعة فيه على: الدفاع الكامل عن المؤلف والناشر (جورج موريس)؛ تعويضهم بالكامل عن الخسائر أو التكاليف؛ وإبراء ذمتهم تماماً من أي مسؤولية قانونية أو أخلاقية ضد جميع المطالبات (Claims)، والدعاوى المدنية/الجنائية (Lawsuits)، والخسائر المالية (Losses)، والأضرار المادية/المعنوية (Damages)، والنفقات/التكاليف (بما في ذلك الأتعاب القانونية/المحاسبية المعقولة)، والالتزامات الناشئة عن أو المتعلقة بـ: استخدامك أو تطبيقك أو سوء تطبيقك للمحتوى؛ انتهاكك للقوانين/اللوائح المحلية أو الوطنية أو الدولية؛ إهمالك، أو حذفك، أو سوء تقديرك؛ أو أفعالك/قراراتك المتهورة/غير المسؤولة. توافق على الدفاع عن المؤلف والمسؤولين والمديرين والموظفين والوكلاء وتعويضهم وإبراء ذمتهم من جميع المطالبات أو الأفعال أو الطلبات - بما في ذلك الأتعاب القانونية والمحاسبية المعقولة - التي ترفعها أو ترفع نيابة عنك أو من قبل أي طرف ثالث بدعوى حدوث ضرر للممتلكات أو الأشخاص من استخدامك المزعوم لمواد/بيانات الكتاب (بما في ذلك البرامج) أو خرق هذا الاتفاق. سيقوم المؤلف بإخطارك على الفور.
الاحتمال الطوعي والمستنير للمخاطر. تقر بوضوح بـ: تلقي تحذيرات واضحة وكافية ومفصلة حول المخاطر الصحية والقانونية الجسيمة؛ الفهم الكامل لهذه المخاطر والعواقب؛ الاحتمال الطوعي بملء إرادتك الحرة ووعيك الكامل لجميع المخاطر المرتبطة؛ والتنازل عن أي حق في مقاضاة أو طلب تعويض من المؤلف/الناشر.
السن القانوني والأهلية القانونية الكاملة. تضمن: كونك في السن القانوني (على الأقل 18 أو الأغلبية الكاملة في ولايتك القضائية، أيهما أعلى)؛ امتلاك الأهلية القانونية الكاملة والكفاءة العقلية لفهم والالتزام بإخلاء المسؤولية هذا؛ وعدم تعرضك للإكراه أو الخداع أو التلاعب في الاتفاق.

القسم 7: حداثة المعلومات وعدم الالتزام بالتحديث
قد يحتوي الكتاب على أخطاء مطبعية أو فنية أو علمية أو إعلامية. قد تصبح المعلومات قديمة أو غير دقيقة أو غير كاملة بسبب التطورات السريعة في الأبحاث العلمية/الطبية، أو التغييرات التنظيمية، أو الأدلة الجديدة - مثل تحديثات المواد المحظورة الأخيرة من WADA أو تحسينات الرقابة الرقمية لقانون الأدوية في الاتحاد الأوروبي على المواد الخاضعة للرقابة. لا يلتزم المؤلف والناشر (جورج موريس) بتحديث أو تصحيح أو مراجعة المحتوى ليعكس التغييرات المستقبلية أو إصلاح الأخطاء.

القسم 8: قابلية الفصل، التنفيذ، والموافقة الملزمة النهائية
إذا اعتبر أي حكم غير قابل للتنفيذ أو غير صالح أو باطل بموجب القانون المعمول به في أي ولاية قضائية: يجب تعديله أو تفسيره بشكل ضيق ليكون قابلاً للتنفيذ إلى أقصى حد مسموح به؛ تظل الأحكام المتبقية فعالة وملزمة بالكامل. إخلاء المسؤولية هذا جزء لا يتجزأ من الكتاب ويشكل اتفاقية قانونية ملزمة بين القارئ والمؤلف/الناشر. بقراءة الكتاب أو شرائه أو تنزيله أو استخدامه بأي شكل من الأشكال، فإنك تؤكد وتضمن: القراءة الكاملة والمتأنية لإخلاء المسؤولية هذا؛ الفهم الكامل لجميع الشروط والأحكام والمخاطر؛ الموافقة المطلقة الكاملة دون تحفظ؛ والالتزام القانوني الملزم. إذا كنت لا توافق على أي جزء، يجب عليك: التوقف فوراً عن قراءة/استخدام الكتاب؛ حذف النسخ الرقمية؛ وإعادة النسخ المادية لاسترداد المبلغ بالكامل (إن أطبق).

تاريخ النشر: 2025
المؤلف والناشر: جورج موريس
المنصات: متعددة (www.MrXSteroid.com ومنصات النشر العالمية الأخرى)
© 2025 جورج موريس. جميع الحقوق محفوظة.`;
