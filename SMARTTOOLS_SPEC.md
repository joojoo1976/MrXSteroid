```text
# ✅ النسخة النهائية الموحدة — 2gpt MASTER v3.0

دمجت الملفين بالكامل (2gpt.txt بأقسامه الـ34 + 1z.txt النسخة v2.0) دون إسقاط أي متطلب، **وأضفت نظام «توجيه شراء الكتاب والدليل»** كقسم رئيسي جديد (§13) مع نقاط ربط إلزامية في: تعريف اكتمال الأداة، أنواع الـ Registry، المساعد الذكي، صفحات الأدوات، الاختبارات، ومعايير القبول.

**نقاط دمج الكتاب (7 مواضع إلزامية لكل أداة):** BookCTA أسفل النتيجة • مرجع الصندوق التعليمي • توصية المساعد الذكي السياقية • تذييل التقارير المصدّرة • بعد الحفظ/إكمال Workflow • منطقة الأدوات ذات الصلة • خريطة فصول سياقية حسب الفئة.

انسخ البرومبت كاملًا:

```markdown
# 📘 MASTER EXECUTION PROMPT — 2gpt FINAL v3.0
# MrXSteroid SmartTools — تدقيق + معمارية + Registry + 150 أداة + ذكاء اصطناعي + نظام توجيه الكتاب + ثنائي اللغة + سلامة + تسليم مُتحقق

## 0. الدور والرسالة والهدف

تصرّف بصفتك مهندس برمجيات أولًا (Senior Software Engineer) وقائد تنفيذ تقنيًا، خبيرًا مثبتًا في: Next.js App Router وTypeScript وSupabase/PostgreSQL/RLS وTailwind CSS وواجهات AI-powered UI وبناء محركات الحساب والتحقق منها وتطبيقات الذكاء الاصطناعي (بحث/توصيات/صوت/رؤية) وواجهات عربية RTL وإنجليزية LTR والاختبارات وإمكانية الوصول والأداء وSEO والتشغيل الإنتاجي. بالإضافة إلى كونك خبيراً في صياغة المعادلة الرياضية والحسابية المتقدمة وربطها برمجياً لخدمة المنصات الذكية والتكيف مع رؤيتها المستقبلية. متوافق مع خوارزميات AI: صياغة واضحة ومباشرة تفهمها محركات البحث الذكية وتصنفها كمحتوى عالي الجودة (E-E-A-T). نفّذ العمل داخل المستودع الحالي بإصداراته وممارساته؛ لا تفترض بنية أو ملفات أو جداول أو مكونات قبل فحصها فعليًا. 

**الرسالة:** ترقية منطقة SmartTools الحالية على `https://mrxsteroid.com/smarttools` إلى منصة هرمية كاملة مدفوعة بـ Registry:

`Hub → Category → Tool → Related Tools → Reports / Insights / AI Integrations`

الهدف ليس صفحة أدوات فحسب، بل منصة كاملة تحافظ على الأدوات العاملة #1–#30 دون إعادة كتابة محركاتها أو تغيير نماذجها الرياضية، وتكمل حتى **150 أداة مميزة مصنفة قابلة للاستخدام ومختبرة**، مع طبقة ذكاء اصطناعي وظيفية حقيقية لكل أداة، ودعم كامل للعربية RTL والإنجليزية LTR، ونظام وحدات Metric/Imperial، وحفظ آمن عبر Supabase، **ونظام توجيه شراء كتاب ودليل Mr. X-Steroid Book (المؤلف: George Mourice) مدمج سياقيًا داخل كل أداة (القسم 13)**.

**المسارات الرسمية:**
- `/smarttools` (المركز — طوّر الصفحة الموجودة، لا تنشئ Hub بديلًا)
- `/smarttools/[category]`
- `/smarttools/[category]/[tool]` — مثال: `/smarttools/nutrition/macro`

**لا تعتبر وجود بطاقة أو Route أو سجل Registry أو ملف مكون دليلًا على اكتمال أداة.** لا تكتفِ بخطة أو تحليل؛ افحص، وثّق، نفّذ، اختبر، أصلح، ثم قدّم نتائج قابلة للتحقق. لا تستخدم بيانات ثابتة أو عشوائية كأنها حسابات حقيقية، ولا تدّعِ أن AI أو Supabase أو Build أو Deploy يعمل لمجرد وجود ملف أو نجاح TypeScript.

---

## 1. القواعد الحاكمة (غير قابلة للتفاوض)

1. **افحص المشروع قبل أي تعديل:** الملفات، تعليمات المشروع المحلية، حالة Git والفرع والتغييرات غير الملتزم بها، مدير الحزم وملفات القفل، إصدارات Next/React/TS، بنية App Router، Registry والكتالوجات، المكونات والمحركات، المسارات، قاعدة البيانات والمهاجرات وRLS، خدمات AI وحدودها، الاختبارات وCI/CD وبيئة النشر، SEO وsitemap والتحويلات القديمة. تدقيق مستقل حقيقي قبل أي سطر كود جديد.
2. لا تطلب من المستخدم إعادة إرسال معلومات موجودة في المستودع أو المواصفات المعتمدة.
3. **حافظ على كل أداة ومكوّن وحساب يعمل — خصوصًا #1–#30:** لا تعيد كتابة محركاتها، لا تغيّر نماذجها الرياضية أو مدخلاتها/مخرجاتها المعتمدة إلا لتحسين UI آمن توافقي. أعد استخدام كل implementation قائم عبر registry mapping؛ أضف طبقة تكامل بدل إعادة كتابة المحرك.
4. لا تغيّر معادلة أو اسمًا معتمدًا أو سلوكًا بصمت؛ أي تغيير جوهري موثق ومختبر باختبار يمنع التراجع.
5. قارن الأدوات حسب الغرض والمدخلات والخوارزمية والمخرجات والاستخدام الفعلي، لا تشابه الاسم. لا تكرر وظيفة لتحقيق رقم 150 ولا تدمج أداتين مختلفتين. يمكن مشاركة المحركات دون إلغاء هوية الوظائف.
6. **Canonical URLs هرمية إنجليزية دائمًا:** `/smarttools/[category]/[tool]` في اللغتين. ممنوع: `/smarttools/التغذية/ماكرو` أو `/smarttools/ar/...` أو `/smarttools/Categories/...` (إلا إذا فرض المشروع locale prefixes عالميًا — وحتى عندها تبقى slugs الفئة/الأداة إنجليزية).
7. **لا مسارات canonical مكررة:** الروابط القديمة Legacy تُحوّل 301 دائمًا فقط بعد التحقق من وجهتها الفعلية وعدم وجود حلقات أو سلاسل غير ضرورية. لا تخمّن وجهة أي Legacy URL ولا تضف مسارات قديمة افتراضية لم يثبت وجودها.
8. أداة جديدة تتطلب فقط: سجلًا في Registry المركزي + ربط/إضافة المكون عبر allowlist. لا Routes يدوية.
9. الـ alias لا يُحتسب أداة إضافية في العدد الكانوني.
10. إذا منع نقص اعتماد خارجي أو صلاحية إكمال وظيفة: نفّذ أفضل مسار آمن، أظهر حالة المنع بصدق، لا تختلق نجاحًا، وتابع باقي العمل الممكن. لا تستبدل النتيجة الحقيقية بمحاكاة غير معلنة.
11. لا تبدأ بخطة ثم تتوقف؛ استمر في الإنجاز حتى 150 أداة ومعايير القبول.

### قواعد فض التعارضات

1. التعليمات الصريحة الأحدث من المستخدم تحدد النطاق المصرح به.
2. الحقيقة المتعلقة بما هو منفذ تُثبت بفحص المستودع والتشغيل؛ المواصفات تحدد السلوك المطلوب ولا تثبت وجود التنفيذ.
3. الجداول المعتمدة تحدد هوية الأدوات وأسماءها وأوصافها وتصنيفها.
4. حافظ على هوية الأدوات 1–30 وترقيمها المعتمد.
5. لكل أداة فئة أساسية واحدة؛ الوسوم والعلاقات للارتباطات الإضافية.
6. افحص أي مسار سابق قبل استبداله أو إنشاء تحويل له.
7. افصل النطاق الحالي عن خريطة الطريق المستقبلية؛ المتطلبات المستقبلية لا تُحذف وتُحفظ بتفاصيلها دون تقديمها كوظائف متاحة.
8. أي تعارض غير محسوم يُسجّل مع أثره، ويُطرح فقط إذا منع تنفيذًا صحيحًا. لا توسّع نطاق النشر بصمت.
9. افصل بين المتطلبات والأمثلة التوضيحية والاقتراحات وخريطة الطريق. لا تنقل «كما سبق» دون ربط صريح. لا تخترع أسماء أو أوصافًا أو مسارات وتقدمها كمعتمدة.

---

## 2. حماية النطاق والإنتاج

هذا العمل خاص بـ SmartTools فقط. لا تغيّر: المدفوعات (Kashier/InstaPay/checkout)، المصادقة والصلاحيات، الأسرار ومفاتيح الخدمات، أو ميزات خارج النطاق. لا تكشف مفاتيح الخدمة في المتصفح. لا migrations إنتاجية أو SQL هدّام أو تعديل بيانات إنتاج دون موافقة صريحة منفصلة؛ اختبر كل تغييرات قاعدة البيانات على Staging. احفظ أعمال المستخدم المحلية؛ لا تعالج التغييرات بحذفها أو إعادة ضبطها قسرًا.

---

## 3. مصادر الحقيقة وقراءة المرجع والتتبع

**المصادر (بعد فحص وجودها):**
1. ملف مواصفات SmartTools المعتمد وملف `150 tools.txt` إن أُرفق — **مرجع ملزم يُقرأ كاملًا من أول سطر لآخر سطر** (الأقسام والملاحق وجداول التصنيف والمسارات والأمثلة وكتل الكود)، على دفعات متتابعة مع التحقق من عدم فقدان أجزاء بين الدفعات وعدم الاعتماد على نتائج بحث جزئية بوصفها قراءة كاملة.
2. الجرد المدمج أدناه (§4) — المستخرج المعتمد؛ عند أي اختلاف مع الملف المرفق يُوثّق ويُحسم وفق §1.
3. الكود الحالي بوصفه الحقيقة حول ما نُفذ فعلًا.
4. تقارير المطور السابقة — ادعاءات تحتاج تحققًا لا حقائق نهائية.
5. قاعدة Supabase الحالية وmigrations وسياسات RLS.

**وثيقة التتبع (إلزامية):** `docs/smarttools-requirements-traceability.md` — اربط كل متطلب مستقل بـ: Requirement ID ثابت / Source (الملف والقسم أو نطاق الأسطر) / نص المتطلب كاملًا / Scope (أداة، منصة، أو مستقبلي) / Implementation (الملفات الفعلية) / Verification (الاختبار أو الدليل) / Status (غير مفحوص، جارٍ، متحقق، محجوب، مستقبلي) / Notes (الاعتماديات والتعارضات). لا تعتبر أي مرحلة مكتملة وبقيت متطلباتها دون قرار موثق أو دليل تنفيذ. لا تطلب معلومات يمكن استخراجها من المصادر؛ تابع الأعمال المستقلة أثناء أي عائق.

**وثيقة التدقيق:** `docs/smarttools-audit.md` — لكل أداة: رقمها الثابت، الاسم العربي/الإنجليزي، الوصف المعتمد، الوظيفة المميزة، المكون الموجود، محرك الحساب، مسار الملف والمسار في التطبيق، الفئة والمسار الكانوني، الحالات المنفصلة، المدخلات/المخرجات، الاعتماديات، الفجوات، الاختبارات الموجودة والمطلوبة، قيود الأمان، دليل التحقق. للتتبع ولا تستبدل التنفيذ.

---

## 4. المخزون المعتمد — 150 أداة

استخدم الأرقام كهوية ثابتة، واحتفظ بالأسماء العربية والأوصاف العربية المعتمدة كاملة دون اختصار أو استبدال بنص عام.

**قواعد النطاقات:**
- **#1–#30 (الأصلية — completed):** افحص تنفيذ كل أداة على حدة، احتفظ بالمحركات العاملة، أضف طبقة تكامل عند الحاجة، اختبارات تمنع التراجع. لا تعامل وصف اكتمالها في المصدر كتحقق حديث من تكاملها.
- **#31–#100:** احتفظ بالتصنيف التطويري المعتمد مع توثيق الأدلة الفعلية؛ ابحث عن تنفيذ سابق قبل إنشاء مكون جديد؛ لا ترفع الحالة لوجود بطاقة أو صفحة.
- **#101–#150:** `planned` ما لم يثبت تنفيذ فعلي. احتفظ بمتطلباتها وواجهات التوسعة. لا نتائج مصطنعة أو محاكاة، ولا صفحات placeholder في sitemap. إن كانت ضمن النطاق المعتمد فطبّق عليها شروط الاكتمال نفسها.

### الأدوات #1–#30 (completed)
1. Adaptive Macro Calculator — حاسبة الماكروز التكيفية
2. FFMI & Body Fat Analyzer — محلل الكتلة الخالية من الدهون
3. Accumulation & Half-Life Simulator — محاكي التراكم وعمر النصف
4. PCT Timing & Washout Engine — محرك توقيت الـ PCT والتلاشي
5. Intelligent HCG & SERM Generator — مولد بروتوكول HCG و SERM
6. Estrogen & Prolactin Control Engine — محرك التحكم في الإستروجين والبرولاكتين
7. Bloodwork Analyzer — محلل تحاليل الدم
8. Side Effect Tracker — متتبع الأعراض الجانبية
9. Injection Site Rotator — موزع مواقع الحقن
10. Compound Stack Builder — باني ستاك المركبات
11. Progress Tracker — متتبع التقدم
12. Dynamic Calorie Adjuster — معدّل السعرات الديناميكي
13. Macro Optimizer — محسّن الماكروز
14. Water Retention Calculator — حاسبة احتباس الماء
15. SHBG Modulator — محسّن SHBG
16. Multi-Compound Half-Life Calculator — حاسبة عمر النصف المتعددة
17. Injection Volume Calculator — حاسبة حجم الحقنة
18. Compound Half-Life Stacker — مكدّس أعمار النصف
19. HPTA Recovery Monitor — مراقب التعافي الهرموني
20. Genetic Potential Calculator — حاسبة الإمكانات الجينية
21. Peptide Protocol Planner — مخطط بروتوكول الببتيدات
22. Oral Cycle Planner — مخطط الدورة الفموية
23. TRT Optimization Engine — محرك تحسين TRT
24. Post-Cycle Bloodwork Interpreter — مترجم تحاليل ما بعد الدورة
25. Drug Interaction Checker Pro — مدقق تداخل الأدوية المتقدم
26. Injection Pain Minimizer — مقلّل ألم الحقن
27. Ester Conversion Calculator — حاسبة تحويل الإسترات
28. Compound Stacking Synergy — محلل تآزر المركبات
29. Side Effect Early Warning — نظام إنذار مبكر للأعراض
30. Cycle Cost Calculator — حاسبة تكلفة الدورة

### الأدوات #31–#100
31. Cycle Length Optimizer — محسّن مدة الدورة
32. Advanced PCT Planner — مخطط الـ PCT المتقدم
33. Bloodwork Trend Analyzer — محلل اتجاهات التحاليل
34. Compound Clearance Calculator — حاسبة تصفية المركبات
35. Hormone Conversion Calculator — حاسبة تحويل الهرمونات
36. Injection Schedule Planner — مخطط جدول الحقن
37. Side Effect Probability Calculator — حاسبة احتمالية الأعراض
38. Stack Compatibility Checker — مدقق توافق الستاك
39. Liver Enzyme Tracker — متتبع إنزيمات الكبد
40. Lipid Profile Optimizer — محسّن ملف الدهون
41. Hematocrit Monitor — مراقب الهيماتوكريت
42. Estrogen Management Pro — مدير الإستروجين المتقدم
43. Prolactin Management Pro — مدير البرولاكتين المتقدم
44. DHT Side Effect Predictor — متنبئ أعراض DHT
45. Cycle Break Planner — مخطط راحة الدورة
46. TRT Lifetime Calculator — حاسبة عمر TRT
47. Fertility Preservation Guide — دليل الحفاظ على الخصوبة
48. Cardiovascular Risk Assessor — مقيّم خطر القلب
49. Bone Density Optimizer — محسّن كثافة العظام
50. Mental Health Monitor — مراقب الصحة النفسية
51. Peptide Dosage Calculator — حاسبة جرعة الببتيدات
52. Growth Hormone Protocol Planner — مخطط بروتوكول GH
53. Insulin Conversion Calculator — حاسبة تحويل الأنسولين
54. Glucose Tracker — متتبع الجلوكوز
55. Insulin Sensitivity Optimizer — محسّن حساسية الأنسولين
56. Mini PCT Calculator — حاسبة الـ PCT المصغّرة
57. Free Testosterone Manager — مدير التستوستيرون الحر
58. Androgenic Balance Calculator — حاسبة التوازن الأندروجيني
59. Androgen Receptor Optimizer — محسّن مستقبلات الأندروجين
60. 5-Alpha Conversion Calculator — حاسبة التحويل 5-ألفا
61. Hair Loss Tracker — متتبع تساقط الشعر
62. Prostate Health Manager — مدير صحة البروستاتا
63. Testicular Suppression Calculator — حاسبة قمع الخصية
64. Sperm Production Optimizer — محسّن إنتاج الحيوانات المنوية
65. Aromatase Conversion Calculator — حاسبة التحويل الأروماتي
66. Estrogen Sensitivity Manager — مدير حساسية الإستروجين
67. Estrogen Balance Calculator — حاسبة التوازن الإستروجيني
68. Gynecomastia Tracker — متتبع التثدي
69. Detoxification Optimizer — محسّن إزالة السموم
70. Oxidative Stress Calculator — حاسبة الإجهاد التأكسدي
71. Antioxidant Manager — مدير مضادات الأكسدة
72. Systemic Inflammation Calculator — حاسبة الالتهاب الجهازي
73. Immune System Optimizer — محسّن المناعة
74. Blood Pressure Tracker — متتبع ضغط الدم
75. Arterial Health Manager — مدير صحة الشرايين
76. Blood Viscosity Calculator — حاسبة لزوجة الدم
77. Nitric Oxide Optimizer — محسّن أكسيد النيتريك
78. Endothelial Health Manager — مدير صحة البطانة الغشائية
79. Fat Metabolism Calculator — حاسبة التمثيل الغذائي للدهون
80. Mitochondrial Optimizer — محسّن الميتوكوندريا
81. Cellular Aging Calculator — حاسبة شيخوخة الخلايا
82. Telomere Manager — مدير التيلوميرات
83. Anti-Aging Inflammation Calculator — حاسبة الالتهاب المضاد للشيخوخة
84. Cognitive Enhancer — محسّن الإدراك
85. Sleep Quality Manager — مدير النوم
86. Cortisol Stress Calculator — حاسبة التوتر والكورتيزول
87. Mood Optimizer — محسّن المزاج
88. Dopamine Tracker — متتبع الدوبامين
89. Serotonin Manager — مدير السيروتونين
90. Female Hormone Balance Calculator — حاسبة التوازن الهرموني الأنثوي
91. Female Health Optimizer — محسّن الصحة الأنثوية
92. Female Dosage Calculator — حاسبة جرعة الإناث
93. Menstrual Cycle Manager — مدير الدورة الشهرية
94. Pregnancy Risk Calculator — حاسبة خطر الحمل
95. Skin Health Optimizer — محسّن صحة الجلد
96. Hair & Nail Tracker — متتبع الشعر والأظافر
97. Hydration Balance Calculator — حاسبة التوازن المائي
98. Sodium-Potassium Manager — مدير الصوديوم والبوتاسيوم
99. Digestive Health Optimizer — محسّن الهضم
100. Comprehensive Report Generator — التقرير الشامل

### الأدوات #101–#150
101. SARM-to-AAS Transition & Bridge Predictor — حاسبة الانتقال الذكي بين SARMs والستيرويدات
102. Subcutaneous vs. Intramuscular PK Modeler — حاسبة مقارنة الحقن العضلي وتحت الجلد
103. Renal Function & Hydration Index — مؤشر وظائف الكلى والترطيب المتقدم
104. Thyroid Function & Metabolic Rate Dynamics — حاسبة ديناميكيات الغدة الدرقية ومعدل الأيض
105. AI Health Data Fusion Hub & Timeline — مركز دمج بيانات الصحة الذكي (FHIR)
106. Glycogen Supercompensation & Water Retention Modeler — حاسبة التحميل النشوي الفائق
107. Contest Prep Peak-Week Manipulator — حاسبة أسبوع الذروة قبل البطولة
108. AI Body Composition Vision Engine — محرك التحليل البصري الذكي لتكوين الجسد
109. Competition Readiness & Stage Posing OS — نظام الاستعداد للبطولات والاستعراض
110. AI Meal Vision Scanner & Portion Estimator — ماسح الوجبات الذكي بالرؤية الحاسوبية
111. Smart Food & Macro Substitution Engine — محرك استبدال الأطعمة الذكي
112. Food Quality & Micronutrient Diversity Score — مؤشر جودة الغذاء وتنوع المغذيات الدقيقة
113. AI Grocery Basket & Meal Cost Optimizer — مجمّع سلة التسوق الذكية
114. Restaurant Macro Navigator & Fast-Food Estimator — دليل الماكروز للمطاعم والوجبات السريعة
115. Supplement Evidence & Bio-Stack Navigator — المرجع العلمي للمكملات وتفاعلاتها
116. Nutrition Gap & Fasting Window Optimizer — كاشف الفجوات الغذائية ومنظم الصيام المتقطع
117. Intra-Workout Nutrient Volumizer & Transport Engine — محرك المغذيات أثناء التدريب
118. CNS Recovery Score — مؤشر استشفاء الجهاز العصبي المركزي
119. Training Volume Load & Hypertrophy Index — مؤشر حجم التدريب والتضخم العضلي
120. Progressive Overload & Adaptive Reserve Capacity Predictor — حاسبة التحميل التدريجي والاحتياطي التكيفي
121. Muscle Group Recovery Time-Course Modeler — محاكي زمن استشفاء المجموعات العضلية
122. RPE / RIR to 1RM Dynamic Velocity Modeler — حاسبة الوزن الأقصى الديناميكية
123. Joint Stress & Connective Tissue Load Risk Index — مؤشر إجهاد المفاصل والأنسجة الرابطة
124. Deload Frequency & Fatigue Accumulation Modeler — حاسبة توقيت أسبوع التفريغ
125. Fiber Type Adaptation & Mechanical Tension Score — حاسبة استهداف أنواع الألياف العضلية
126. Neuromuscular Performance & Explosiveness Modeler — حاسبة الأداء العصبي العضلي والانفجارية
127. AI Daily Readiness & Cause Explainer Engine — محرك الجاهزية اليومية وتفسير الأسباب
128. Training Load Balance & Acute-to-Chronic Ratio — حاسبة التوازن بين الحمل الحاد والتراكمي
129. AI Adaptive Training Program Planner — مصمم البرامج التدريبية الذكي المتكيف
130. AI Plateau Detective & Stagnation Analyzer — المحقق الذكي لكشف أسباب الثبات والركود
131. Transformation Forecast & Trajectory Engine — محرك التنبؤ بمسار التحول الجسدي
132. AI Pose & Exercise Form Coach — مدرب التقنية الذكي بالرؤية الحاسوبية
133. Rep Tempo & Velocity Loss Analyzer — محلل إيقاع التكرارات وفقدان السرعة
134. Mobility Intelligence & Movement Symmetry Screen — فحص المرونة الحركية والتوازن الجانبي
135. Exercise Substitution AI & Injury Workaround — بديل التمارين الذكي عند الإصابة
136. Physique Proportion & Golden Ratio Score — حاسبة التناسب العضلي والنسبة الذهبية
137. Peptide & Hormone Reconstitution Calculator — حاسبة إعادة تشكيل الببتيدات والهرمونات
138. Raw Powder Density & Oil Formulation Engine — محرك كثافة البودرة الخام وتكوين الزيوت
139. Solvent & Emulsifier Ratio Calculator (BA/BB) — حاسبة نسب المذيبات BA/BB
140. Dosage Unit Conversion Engine — Universal Labs — محرك تحويل وحدات القياس العالمي للتحاليل
141. Carrier Oil Viscosity & Syringe Pressure Estimator — حاسبة لزوجة الزيت الناقل وضغط السرنجة
142. Compound Purity & Active Yield Estimator — حاسبة النقاء والمردود الفعلي
143. Storage Stability & Thermal Degradation Estimator — حاسبة الثبات التخزيني والتلف الحراري
144. Homebrew Chemistry Mass & Density Calculator — حاسبة كيمياء التصنيع المنزلي
145. Habit Intelligence & Consistency Coach — مدرب الالتزام والانضباط الذكي
146. AI Safety Gate & Emergency Protocol — بوابة الأمان والبروتوكولات الطارئة
147. Scientific Evidence Explorer & Citation Engine — محرك البحث العلمي والمراجع
148. My Personal Fitness Memory Layer — طبقة الذاكرة الشخصية للذكاء الاصطناعي
149. Physique Trajectory Scenario Simulator — محاكي سيناريوهات المسار الجسدي المستقبلي
150. Mr. X AI Performance Command Center — مركز القيادة الذكي الأعظم (Master Orchestrator)

---

## 5. الفئات والمسارات الكانونية

| Slug | الاسم العربي | English |
|---|---|---|
| nutrition | التغذية والماكروز | Nutrition & Macros |
| body-composition | تكوين الجسم | Body Composition |
| pharmacokinetics | الحرائك الدوائية | Pharmacokinetics |
| hormonal-health | الصحة الهرمونية | Hormonal Health |
| medical-monitoring | التحاليل والمراقبة الصحية | Medical Monitoring |
| injection-formulation | الحقن والتحضير | Injection & Formulation |
| cycle-management | إدارة الدورات والستاك | Cycle & Stack Management |
| training-recovery | التدريب والاستشفاء | Training & Recovery |
| reproductive-wellbeing | الصحة الإنجابية والعافية | Reproductive & Wellbeing |
| platform-ai | الذكاء الاصطناعي وقيادة المنصة | AI & Platform |

قواعد:
- فئة أساسية واحدة لكل أداة (بالوظيفة الفعلية)؛ ارتباطات إضافية عبر الوسوم والعلاقات دون نسخ متعددة.
- أنشئ توزيعًا موثقًا للأدوات الـ150 على الفئات العشر؛ طبّق جدول التصنيف النهائي للمصدر حيث يكون كاملًا، وإن انتهى قبل اكتماله لا تفترض بقية الصفوف — استخرجها من المرجع أو سجّل النقص.
- تحقّق من تطابق الأداة مع الفئة في الرابط؛ أعد 404 حقيقية للفئات والأدوات غير الموجودة أو غير المتطابقة. لا تعرض الأداة تحت فئة خاطئة.
- اشتق المسار من category + slug ولا تخزّن نسخًا قابلة للتعارض. اختبر الروابط الداخلية والتحويلات والروابط الكانونية.

---

## 6. المعمارية والـ Registry (مصدر الحقيقة الواحد)

### 6.1 بنية المجلدات المستهدفة (أو ما يكافئها حسب اصطلاحات المشروع)

```
app/smarttools/layout.tsx
app/smarttools/page.tsx
app/smarttools/[category]/page.tsx
app/smarttools/[category]/[tool]/page.tsx
app/smarttools/[category]/[tool]/not-found.tsx

src/smarttools/registry/{categories.ts, tools.ts, legacy-routes.ts, index.ts}
src/smarttools/components/{SmartToolsHub, CategoryPage, ToolPageShell, ToolCard, CategoryCard,
  SmartToolsSearch, SmartToolsBreadcrumbs, RelatedTools, SafetyNotice}.tsx
src/smarttools/components/BookPromo/{BookCTA.tsx, BookInlineRef.tsx}
src/smarttools/loaders/tool-component-loader.ts
src/smarttools/lib/{smarttools-seo, smarttools-search, smarttools-related,
  smarttools-validation, smarttools-schema, book-link}.ts
```

### 6.2 الأنواع (TypeScript)

```ts
export const SMART_TOOL_CATEGORY_SLUGS = [
  "nutrition","body-composition","pharmacokinetics","hormonal-health",
  "medical-monitoring","injection-formulation","cycle-management",
  "training-recovery","reproductive-wellbeing","platform-ai",
] as const;
export type SmartToolCategory = (typeof SMART_TOOL_CATEGORY_SLUGS)[number];

export interface SmartToolCategoryDefinition {
  slug: SmartToolCategory;
  nameAr: string; nameEn: string;
  descriptionAr: string; descriptionEn: string;
  icon?: string; order: number;
  safetyLevel?: "general" | "health" | "high-risk";
}

export type SmartToolStatus = "completed" | "active" | "beta" | "planned";
export type SmartToolRiskLevel = "general" | "wellness" | "medical-information" | "high-risk";

/** مرجع سياقي لكتاب ودليل Mr. X-Steroid Book — إلزامي لكل أداة (انظر §13) */
export interface BookReference {
  chapterAr: string;   // اسم الفصل/القسم بالعربية من فهرس الكتاب الفعلي
  chapterEn: string;
  topicAr: string;     // جملة السياق: لماذا هذا الفصل ذو صلة بنتيجة المستخدم الآن
  topicEn: string;
}

export interface SmartToolDefinition {
  id: number;
  slug: string;
  category: SmartToolCategory;
  nameAr: string; nameEn: string;
  descriptionAr: string; descriptionEn: string;
  status: SmartToolStatus;
  riskLevel: SmartToolRiskLevel;
  tags?: string[];
  keywordsAr?: string[]; keywordsEn?: string[];
  synonyms?: string[]; intents?: string[];
  componentKey?: string; componentName?: string;
  legacyPaths?: string[];
  relatedToolIds?: number[];
  searchable?: boolean; indexable?: boolean;
  requiresDisclaimer?: boolean; requiresMedicalReview?: boolean;
  availableLocales?: string[];
  bookContext?: BookReference; // ⭐ توجيه شراء الكتاب السياقي
}
```

### 6.3 فصل الحالات (إلزامي)

افصل الحقول التالية ولا تجمعها في حقل واحد:
```ts
developmentStatus | publicationStatus | availabilityStatus | accessPolicy | reviewStatus
```
حدّد بوضوح ما يترتب عليها على: الظهور في Hub، التشغيل، البحث، التوصيات، الوصول المباشر، sitemap، الصلاحيات. يمكن حفظ التحقق التقني في تقرير منفصل:
```ts
type VerificationStatus = "not-checked" | "component-found" | "integration-verified" | "blocked";
```
هذا التقرير لا يعرّف الأدوات من جديد.

### 6.4 ما يغذيه الـ Registry (لا تكرر التعريفات في أي مكان آخر)
أقسام الـ Hub وصفحات الفئات والمسارات والبطاقات • فهرس البحث الذكي والتوصيات • Breadcrumbs وPrevious/Next وRelated • Canonical وMetadata وOpenGraph وJSON-LD • sitemap الديناميكي وخريطة تحويلات Legacy • التحقق من المسارات والحالة والاختبار • **مرجع الكتاب السياقي لكل أداة (bookContext) ومواضع ظهوره (§13)**.

### 6.5 تحقق سلامة الـ Registry (يفشل Build/CI عند الكسر)
- 150 ID فريدًا بالضبط؛ slugs فريدة عالميًا؛ فئة صحيحة وفئة واحدة لكل أداة.
- كل أداة completed لها component mapping ومحرك/وظيفة فعلية؛ لا ادعاء completed دون قبول فعلي.
- كل legacy path يشير لأداة واحدة؛ كل relatedToolId موجود؛ لا تصادم canonical.
- الأدوات #1–#30 موسومة `status: "completed"`.
- metadata عربي/إنجليزي كاملة؛ اتساق الحالات وعدم إظهار أدوات غير متاحة كعاملة؛ عدم فهرسة صفحات غير مؤهلة.
- **كل أداة completed لها bookContext مكتمل ثنائي اللغة (§13).**
- لا تخزّن بيانات مستخدم صحية في الـ Registry.

### 6.6 تحميل المكونات بأمان (Allowlist)
ممنوع بناء مسار import من route param أو مدخل مستخدم. خريطة loaders مسموحة فقط:

```ts
const toolComponentLoaders = {
  adaptiveMacro: dynamic(() => import("@/components/tools/AdaptiveMacroCalculator")),
  ffmiBodyFat: dynamic(() => import("@/components/tools/FfmiBodyFatAnalyzer")),
  // ...
} as const;
```

حمّل كود الأداة المطلوبة فقط؛ فصل Server/Client صحيح؛ تحميل كسول؛ حالات تحميل واحتواء أخطاء الأداة وعزل فشلها؛ رسائل فشل مفهومة؛ لا إخفاء نقص التنفيذ بمكون عام ينتج أرقامًا غير حقيقية.

---

## 7. الخريطة الكانونية للأدوات #1–#30

| ID | English Name | Category | Slug |
|---:|---|---|---|
| 1 | Adaptive Macro Calculator | nutrition | macro |
| 2 | FFMI & Body Fat Analyzer | body-composition | ffmi-body-fat |
| 3 | Accumulation & Half-Life Simulator | pharmacokinetics | accumulation-half-life |
| 4 | PCT Timing & Washout Engine | hormonal-health | pct-washout |
| 5 | Intelligent HCG & SERM Generator | hormonal-health | hcg-serm |
| 6 | Estrogen & Prolactin Control Engine | hormonal-health | estrogen-prolactin |
| 7 | Bloodwork Analyzer | medical-monitoring | bloodwork |
| 8 | Side Effect Tracker | medical-monitoring | side-effect-tracker |
| 9 | Injection Site Rotator | injection-formulation | injection-site-rotator |
| 10 | Compound Stack Builder | cycle-management | compound-stack |
| 11 | Progress Tracker | training-recovery | progress-tracker |
| 12 | Dynamic Calorie Adjuster | nutrition | dynamic-calorie-adjuster |
| 13 | Macro Optimizer | nutrition | macro-optimizer |
| 14 | Water Retention Calculator | body-composition | water-retention |
| 15 | SHBG Modulator | hormonal-health | shbg-modulator |
| 16 | Multi-Compound Half-Life Calculator | pharmacokinetics | multi-compound-half-life |
| 17 | Injection Volume Calculator | injection-formulation | injection-volume |
| 18 | Compound Half-Life Stacker | pharmacokinetics | half-life-stacker |
| 19 | HPTA Recovery Monitor | hormonal-health | hpta-recovery |
| 20 | Genetic Potential Calculator | body-composition | genetic-potential |
| 21 | Peptide Protocol Planner | hormonal-health | peptide-protocol-planner |
| 22 | Oral Cycle Planner | cycle-management | oral-cycle-planner |
| 23 | TRT Optimization Engine | hormonal-health | trt-optimization |
| 24 | Post-Cycle Bloodwork Interpreter | medical-monitoring | post-cycle-bloodwork |
| 25 | Drug Interaction Checker Pro | medical-monitoring | drug-interactions |
| 26 | Injection Pain Minimizer | injection-formulation | injection-pain-minimizer |
| 27 | Ester Conversion Calculator | pharmacokinetics | ester-conversion |
| 28 | Compound Stacking Synergy | cycle-management | stacking-synergy |
| 29 | Side Effect Early Warning | medical-monitoring | side-effect-early-warning |
| 30 | Cycle Cost Calculator | cycle-management | cycle-cost |

(تعيينات #12–#30 افتراضية كانونية بالوظيفة؛ تحقق منها مع المسارات القديمة أثناء التدقيق ووثّق أي توفيق في `docs/smarttools-audit.md`.)

---

## 8. المرحلة A — التدقيق الشامل والفحص الحقيقي

لكل أداة مكتشفة:
1. افتح المكون والاختبارات والـ route الفعليين.
2. شغّل الاختبارات والحسابات وسجّل النتيجة (baseline).
3. قارن الحسابات بالوظيفة المعتمدة ورقم الأداة.
4. صنّفها: `functional / partial / UI-only / broken / duplicate / alias`.
5. حافظ على النتائج الصحيحة؛ أصلح العيوب المثبتة باختبارات تمنع رجوعها.
6. أضف التكامل الناقص: Registry، routing، localization، RTL/LTR، وحدات، تخزين آمن، توصيات، مساعد AI، **وتوجيه الكتاب (§13)**.
7. لا تعتبرها مكتملة قبل اجتياز شروط §9.

تحقق أيضًا من: مطابقة جداول Supabase وRLS مع الـ Registry (مصدر موحد)، إزالة تعارضات Slugs/IDs، التمييز بين الأدوات الحقيقية والـ Legacy Aliases، تشغيل baseline للبناء والاختبارات، وتسجيل كل ذلك في وثيقتي التدقيق والتتبع (§3) — ثم انتقل مباشرة للتنفيذ دون توقف.

---

## 9. تعريف اكتمال الأداة ومخرجات البناء

### 9.1 مواصفات كل أداة
ID واسم عربي/إنجليزي ووصفان • الفئة والـ slug الكانوني • الغرض التشغيلي والحدود • المدخلات المطلوبة/الاختيارية بالوحدات والمدى والتحقق • المعادلة/الخوارزمية عند انطباقها • المخرجات typed وتفسيرها • الافتراضات وعدم اليقين • مصادر موثوقة حيث تلزم • المخاطر والقيود وحالة التخزين والخصوصية • الأدوات المرتبطة • اختبارات مرجعية مستقلة • **bookContext مكتمل (§13)**.

### 9.2 متطلبات كل محرك حسابي
1. يتحقق من المدخلات. 2. يحوّل لوحدات داخلية موحدة. 3. ينفّذ معادلة مناسبة مفسّرة. 4. يعيد نتائج typed منظمة. 5. يتعامل مع النواقص وغير الصالح والحدود (قسمة صفر، سالبيات غير صالحة، NaN، دقة وتقريب دون تقريب وسيط مؤثر). 6. يحدّث عند تغيير المدخلات ولا يعرض نتيجة قديمة كصالحة بعد تغيير معتمد عليها إلا مع توضيح. 7. يوضح الافتراضات والمصادر والقيود. 8. تحويل الوحدات بالاتجاهين (round-trip tests).

اختبر كل محرك على حالتين صالحتين مختلفتين على الأقل + الحالات الحدية وغير الصالحة بنتائج مرجعية مستقلة (لا تحسب expected باستدعاء نفس الدالة). لا placeholder أو رقم ثابت أو "AI estimate" لتغطية غياب محرك. الأدوات غير الحسابية تمتلك وظيفة فعلية متناسبة مع غرضها (سجل قابل للتحرير، مقارنة زمنية، بحث مصادر، ماسح عند توافره، مخطط قابل للحفظ).

### 9.3 مخرجات بناء أي أداة (عند استدعاء "Build Tool #N")
1. **Tool ID + الاسم (عربي/إنجليزي) + الغرض التشغيلي الصريح.**
2. **النموذج الرياضي الكامل** بمعادلات LaTeX صورية رسمية.
3. **Input/Output Data Schemas** بواجهات TypeScript/JSON صالحة.
4. **منطق مزامنة Supabase وربط بيانات القياسات القابلة للارتداء (Wearable Telemetry)** حيثما ينطبق (مثل #105 ببروتوكول FHIR، #118 بـ HRV/النوم).
5. **مولّد سياق AI للأداة (AI Context Payload):** حمولة سياق آمنة تعليمية تغذّي المساعد الذكي (تفسير النتائج، الفرضيات، السيناريوهات) مع الالتزام بقيود §12.
6. **بنية UI ثنائية اللغة** (Tailwind/React/Next متوافقة) مع مفاتيح وحدات ديناميكية (Metric/Imperial).
7. **الصندوق التعليمي الشامل** مع الإشارة المرجعية الإلزامية إلى كتاب ودليل **Mr. X-Steroid Book** للمؤلف **George Mourice** — الفصل/القسم المعني من `bookContext` + رابط الشراء (وفق §13).
8. **BookCTA الأساسي** وفق §13 (بطاقة توجيه الشراء أسفل النتيجة مباشرة، ثنائية اللغة).

**الشروط الـ14 للاكتمال:** وظيفة حقيقية مميزة • مكون متكامل في المسار الصحيح • مدخلات واضحة • تحقق من القيم • معالجة صحيحة للوحدات • محرك/خدمة تعمل فعليًا • نتائج مفهومة • شرح الافتراضات والقيود • حالات فشل مناسبة • دعم اللغة والاتجاه • تطبيق الخصوصية والصلاحيات • اختبارات مناسبة للمخاطر • مراجعة سلامة للمحتوى الحساس • دليل تحقق مسجل. وجود بطاقة أو Route أو Registry لا يحققها وحده.

---

## 10. ترقية المحركات الرياضية

حدّث واختبر خوارزميات الأدوات الـ150 وفق أحدث المراجع المعتمدة: نماذج الحرائك الدوائية الحُجُزية (Compartmental PK) للإسترات المتعددة • معادلات FFMI ونسبة الدهون (معايرة DEXA وطيات الجلد) • BMR/TDEE متعددة الصيغ وميزان النيتروجين والتحميل النشوي • مؤشرات التحاليل: HOMA-IR، ApoB/LDL-P، eGFR/Cystatin C، TSH/T3/T4، hs-CRP/ESR • نسبة الصوديوم/البوتاسيوم، كفاءة الأنسولين، ACWR، RPE/RIR→1RM.

قواعد الجودة: معادلة مناسبة للمدخلات والغرض مع مصدر الصيغة وإصدارها وافتراضاتها • اختبار بأمثلة مرجعية وحدود منطقية؛ تمييز القياس عن التقدير عن التنبؤ • عرض عدم اليقين عند الحاجة؛ لا دقة زائفة ولا وعود تنبؤ مؤكدة • لا تستخدم AI بديلًا عن معادلة حتمية قابلة للتحقق • عند غياب أساس موثوق لنموذج، اعرض النقص بدل اختراع صيغة • لا دمج وظيفتين لاشتراكهما في مدخلات • Unit + Integration tests على قيم وحالات حدية مختلفة وround-trip conversions. عند تصحيح معادلة موجودة: وثّق السبب والفرق والأثر واختبار يمنع الرجوع. الهدف أدوات أدق وأكثر تفسيرًا، لا أعقد بلا أساس.

---

## 11. منظومة الذكاء الاصطناعي (وظيفية حقيقية لا تجميلية)

ادمج AI عبر خدمة موحدة آمنة على الخادم؛ لا تدّعِ اتصالًا قبل اختبار المزود. كل الوظائف مبنية على بيانات Registry ومعلومات حقيقية. حدود واضحة بين: ما ينفذه المحرك الحتمي • ما يسترجعه النظام من بيانات موثوقة • ما يولّده النموذج كتفسير أو اقتراح • ما لا تتوفر له أدلة كافية.

### 11.1 قدرات AI حسب نوع الأداة
- **الحسابية (Calculators & Simulators):** مساعد يفسّر النتائج ويشرح المعاملات ويقترح السيناريوهات والفرضيات من المدخلات + إدخال بفهم اللغة الطبيعية (NLP).
- **التغذية والتتبع:** تحليل صور الوجبات والجسم (Vision)، بدائل غذائية ذكية، اكتشاف ثغرات الاستشفاء أو النظام.
- **التحاليل والمراقبة:** قراءة قيم التحاليل، شرح دلالات المرتفع/المنخفض، إبراز علامات الخطر المتطلبة تدخلًا طبيًا.
- **البحث والتنقل الذكي:** ربط النتائج بين الأدوات ذات الصلة تلقائيًا (Multi-tool workflows) + **واجهة محادثة صوتية ونصية داخل كل أداة.**

### 11.2 AI Registry
لكل أداة: كلمات بحث عربية/إنجليزية، مرادفات، intents، tags، مستوى مخاطرة، قدرات، مخرجات، روابط ذات صلة.

### 11.3 البحث الذكي
عربي/إنجليزي: تطبيع الحروف العربية وإزالة التشكيل المناسب، tokenization وتصحيح وتقارب نصي عند توفره، مرادفات وintent matching، ترتيب بالملاءمة والسياق، نتائج لأدوات مسجلة فقط مع احترام الإتاحة والصلاحيات، **fallback حتمي يعمل كاملًا عند غياب النموذج — لا يمنع تعطل AI التصفح أو البحث الأساسي أبدًا.**

### 11.4 التوصيات
أدوات موجودة فعلًا ومتاحة حسب الوظيفة والسياق وموافقة المستخدم؛ اشرح سبب التوصية؛ لا تقترح الأداة الحالية أو إجراءً طبيًا خطيرًا؛ لا استنتاج معلومات صحية حساسة دون حاجة وموافقة مناسبة.

### 11.5 مساعد الأداة + التوصية السياقية بالكتاب
يساعد على فهم الحقول والنتيجة والافتراضات والقيود. لا يغيّر المدخلات أو الحساب بصمت ولا يستبدل المحرك الرياضي بتقدير لغوي. **توصية الكتاب:** عند تفسير نتيجة معقدة أو سؤال عميق، يضيف المساعد توصية سياقية واحدة على الأكثر في الجلسة: "يغطي الفصل [X] من كتاب Mr. X-Steroid Book هذا الموضوع بالتفصيل" + الرابط من §13 — **ممنوعة في سياق نتائج مقلقة أو تحذيرات طبية عاجلة.**

### 11.6 NLP Input
حوّل كلام المستخدم لاقتراح مدخلات: اختر الأداة من Registry → استخرج القيم المذكورة فقط → طابقها مع schema حقيقي → وحّد الوحدات → اكشف الغموض والنواقص → اطلب تأكيدًا عند الغموض أو العواقب المهمة → تحقق قبل الحساب → اعرض القيم المقترحة. لا تخترع بيانات شخصية أو قيمًا ناقصة.

### 11.7 AI-Adaptive UI والتخصيص
ترتيب الأدوات، المفضلة، الاختصارات، الوحدات، اللغة، مستوى التفاصيل — من تفضيلات أو إشارات استخدام فعلية مسموح بها، مع تعطيل التخصيص وإعادة ضبطه وحذف الذاكرة. مفهوم وقابل للإلغاء؛ لا يخفي الوصول للأدوات بسبب استنتاج آلي ولا يغيّر الحسابات بصمت؛ تجربة أساسية تعمل دون ملف شخصي غني.

### 11.8 AI Navigation
Previous/Next، آخر أداة، ذات الصلة، خطوات تالية — من المسارات الكانونية الفعلية والـ Registry؛ لا تفترض أن ID التالي ينتمي لنفس الفئة.

### 11.9 Multi-tool Workflows وFallback
انقل بيانات متوافقة بين الأدوات بموافقة واضحة مع تحقق الوحدات والمصدر والحداثة؛ عقود مدخلات/مخرجات واضحة وحالة كل خطوة؛ تعامل مع الفشل الجزئي؛ امنع تكرار الكتابة بسبب retries. لا نقل بيانات حساسة أو حفظها دون اختيار المستخدم. **ضمان عمل الأدوات والمعادلات عند انقطاع AI (fallback حتمي واضح).** لمركز القيادة (#150): بحث وتوصيات وتدفقات على بيانات موافق عليها فعلًا؛ ليس صفحة روابط ولا لوحة نتائج مخترعة.

### 11.10 الصوت
أوامر عربية/إنجليزية في المتصفحات المدعومة؛ إذن الميكروفون بعد تفاعل المستخدم فقط؛ حالة تسجيل واضحة؛ إيقاف وإلغاء؛ عرض النص المستخرج للمراجعة؛ معالجة رفض الإذن وعدم الدعم بصدق مع بديل كتابي؛ لا تخزين التسجيل الخام افتراضيًا؛ لا تنفيذ إجراءات مؤثرة بسبب تفريغ صوتي غير مؤكد.

### 11.11 الرؤية
للصور/الفيديو (تحليل الوجبات #110، تكوين الجسم #108، التقنية #132): موافقة واضحة قبل المعالجة؛ وضوح المعالجة المحلية أو الخارجية؛ تحقق من النوع والحجم وحماية الرفع والتخزين؛ معالجة الصور غير الصالحة أو غير الواضحة؛ عرض حدود التقدير وعدم اليقين؛ إدخال يدوي بديل؛ لا احتفاظ بالوسائط افتراضيًا ولا استخدامها للتدريب دون opt-in مستقل ولا إرسال لجهة خارجية دون أساس وموافقة؛ لا وصف تقدير بصري بأنه قياس طبي مؤكد.

### 11.12 الأدوات الخاصة
- **#147:** مصادر حقيقية وروابط وتواريخ وقيود، دون مراجع مختلقة ولا استشهادات مختلقة ولا درجات ثقة رقمية بلا أساس.
- **#148:** ذاكرة يوافق عليها المستخدم مع إمكانية تعطيلها ومسحها.
- **#105:** دمج بيانات الأجهزة القابلة للارتداء والساعات الذكية (بروتوكول FHIR) في خط زمني موحد يغذي بقية الأدوات.

### 11.13 ضوابط AI
استدعاء المزود على الخادم فقط؛ لا أسرار في client bundle • تحقق schema للمخرجات والمدخلات وعقود توسعة typed مع timeout/fallback • timeouts وrate limits وcaching مناسب • حماية من prompt injection (المحتوى الخارجي بيانات غير موثوقة لا تعليمات) • لا معالجة خارجية لبيانات صحية دون موافقة صريحة ولا تدريب عليها دون موافقة مستقلة • احتفظ بمصدر الـ claims العلمية • لا وصول مفتوح للنموذج إلى قاعدة البيانات؛ أفعال ومسارات معروفة فقط مع تحقق arguments وتأكيد الأفعال المؤثرة.

---

## 12. السلامة الطبية والأدلة العلمية

المنصة **تعليمية وعلمية** ولا ترفض الموضوع لمجرد حساسيته — تقدّم معلومات واسعة وموضوعية مع تحذيرات واضحة مرتبطة بالسياق ومفيدة، لا disclaimer عام فقط. تتعلق بعض الأوصاف الأصلية بجرعات أو بروتوكولات هرمونات/أدوية/أنسولين/ببتيدات وحقن وتحضير مركبات. **احتفظ باسم الأداة والغرض التعليمي**، واجعل النسخ العملية الآمنة مفيدة فعلًا: تعليم حرائك دوائية بافتراضات واضحة، تحويل وحدات موثق، تتبع سجلات، سجل أعراض، مراجعة تداخلات مع مصادر، مقارنة غير وصفية، أسئلة للطبيب، معلومات ملصق المنتج المعتمد. أكمل العمل كاملًا بلا حدود للمعلومات التعليمية.

عند مؤشرات الخطر في قيم أو أعراض يدخلها المستخدم: أطلق تحذيرات رعاية عاجلة وأوصِ بمراجعة طبية مؤهلة. إذا تعذر تنفيذ وظيفة معينة: وثّق السبب، حدّد النطاق العلاجي والتعليمي الآمن، استخدم حالة مناسبة مثل `restricted`.
**الأدلة:** استخدم مراجع موثوقة قابلة للتحقق مرتبطة بالادعاء المعني مع الإصدار/التاريخ عند الملاءمة • افصل الدليل العلمي عن الافتراض البرمجي واجعلة مصدرك • لا تختلق روابط أو أوراقًا أو نسب دقة • اعرض عدم اليقين عند اختلاف الأدلة.

---

## 13. ⭐ نظام توجيه شراء الكتاب والدليل — Mr. X-Steroid Book (إلزامي في كل أداة)

### 13.1 الهدف والمبادئ
دمج توجيه شراء **كتاب ودليل Mr. X-Steroid Book (المؤلف: George Mourice)** داخل كل أداة من الأدوات الـ150 كطبقة تحويل مدروسة (Monetization Layer) تعزز الهوية التعليمية الموثوقة للمنصة.

1. **الأداة تعمل كاملة مجانًا دائمًا** — الكتاب عمق إضافي لا شرط؛ لا حجب لأي وظيفة أو نتيجة وراء الشراء أبدًا.
2. **التوجيه سياقي دائمًا:** إحالة لفصل/قسم محدد يعالج موضوع الأداة الحالية — ممنوع CTA عام بلا سياق.
3. **السلامة تتفوق على التسويق دائمًا** (Safety overrides Monetization).
4. CTA أساسي واحد بارز لكل صفحة أداة + المواضع المساندة المحددة أدناه؛ لا إزعاج أو تكرار داخل نفس العرض.
5. ثنائي اللغة بالكامل (RTL/LTR).
6. رابط الشراء من مصدر مركزي واحد.

### 13.2 المواضع الإلزامية في كل أداة مكتملة
1. **BookCTA الأساسي** — بطاقة بارزة ضمن نظام التصميم **أسفل النتيجة مباشرة**: عنوان "تعمّق في [موضوع الأداة]"، نص: "الفصل/القسم [X] من كتاب ودليل Mr. X-Steroid Book يشرح [الموضوع] بالتفصيل الكامل للمؤلف George Mourice"، زر: "احصل على نسختك الآن".
2. **مرجع الصندوق التعليمي** — كل صندوق تعليمي (§9.3) ينتهي بالفصل المعتمد من `bookContext` + رابط الشراء.
3. **توصية المساعد الذكي** — وفق §11.5: مرة كحد أقصى في الجلسة، سياقية، وممنوعة في السياقات المقلقة.
4. **تذييل التقارير المصدّرة** — أي تقرير/طباعة/تصدير يتضمن مرجع الكتاب + الرابط.
5. **بعد الحفظ / إكمال Workflow** — بطاقة "الخطوة التالية في فهمك: الفصل [X] من الكتاب".
6. **منطقة الأدوات ذات الصلة** — بند "المصدر المعتمد لهذا الموضوع" مع رابط الفصل.
7. **صفحة الفئة والـ Hub** — بطاقة عامة واحدة "الدليل الشامل: Mr. X-Steroid Book" (وليست لكل أداة).

### 13.3 البنية التقنية
- **مكونات موحدة:** `BookPromo/BookCTA.tsx` (البطاقة الأساسية) و`BookPromo/BookInlineRef.tsx` (المرجع الداخلي) — تصميمهما ضمن نظام التصميم الموحد، مميز بصريًا لكن متناسق، متجاوب.
- **الرابط المركزي:** `book-link.ts` يولّد الرابط من إعداد واحد (`NEXT_PUBLIC_BOOK_URL` أو config مركزي) — **ممنوع تكرار الرابط يدويًا في 150 مكانًا**. عند توفر رابط شريك/تتبع يُخزّن في الإعداد المركزي قابلًا للتحديث دون rebuild.
- **UTM موحدة:** `?utm_source=smarttools&utm_medium={placement: tool-page|educational-box|ai-assistant|report|workflow|related|hub}&utm_campaign=book&utm_content={tool-slug}`.
- **Registry:** الحقل `bookContext: BookReference` (§6.2) لكل أداة مكتملة؛ يفشل التحقق (§6.5) عند غيابه.

### 13.4 الخريطة السياقية حسب الفئات
اربط كل أداة بالفصل/القسم المناسب من **فهرس الكتاب الفعلي عند توفره — لا تخترع أرقام فصول غير موجودة**؛ إن لم يتوفر فهرس استخدم أسماء الأقسام الموضوعية:

| الفئة | ربط المحتوى المقترح |
|---|---|
| nutrition | فصول الماكروز والتحميل النشوي والتخسيس |
| body-composition | فصول تكوين الجسم وFFMI ونسب الدهون |
| pharmacokinetics | فصول عمر النصف والتراكم والإسترات |
| hormonal-health | فصول PCT والإستروجين والخصوبة |
| medical-monitoring | فصول قراءة وتفسير التحاليل |
| injection-formulation | فصول الحقن والسلامة والتحضير |
| cycle-management | فصول الستاك وإدارة الدورات |
| training-recovery | فصول التدريب والاستشفاء |
| reproductive-wellbeing | فصول الصحة الإنجابية والعافية |
| platform-ai | المرجع الشامل/الفهرس العام للكتاب |

### 13.5 قواعد عدم الإزعاج والأمان
- لا حجب للنتائج أو الوظائف؛ لا popups تعطيلية؛ لا ظهور فوق النتيجة.
- **عند تنشيط تحذير طبي عاجل: يُستبدل موضع BookCTA بتوجيه الرعاية الطبية، ولا يظهر CTA الكتاب إلا أسفل التحذير بعد مسافة مناسبة، أو يتأجل.**
- لا يظهر CTA في صفحات الخطأ أو 404 أو حالات الفشل.
- لا بيانات صحية شخصية في روابط الشراء أو analytics — تتبع النقرات عبر UTM فقط.
- روابط الكتاب الخارجية تحمل `rel="sponsored nofollow"` المناسب حتى لا تُفسد إشارات SEO الداخلية.
- **Graceful degradation:** عند غياب `BOOK_URL` تعمل الأداة كاملة ويختفي CTA دون أخطاء.

### 13.6 الاختبارات الخاصة
- ظهور CTA ثنائي اللغة في كل أداة مكتملة.
- صحة الرابط والـ UTM لكل placement.
- عدم الحجب/الإزعاج؛ أولوية التحذير الطبي على CTA.
- اختفاء CTA السليم عند غياب الرابط.
- التقرير النهائي يوثق تغطية bookContext لكل الأدوات المكتملة.

---

## 14. تجربة المستخدم والصفحات

### Hub `/smarttools`
الفئات العشر بأعداد صحيحة لكل فئة تعكس الأدوات المعروضة وحالاتها بصدق • بحث ذكي وفلاتر وترتيب معتمد • أرقام وأسماء وأوصاف عربية/إنجليزية وشارة الفئة وزر فتح • الأسماء البديلة والكلمات المفتاحية • أقسام مميزة/أضيفت حديثًا/شائعة • مفضلة ومستخدمة مؤخرًا فقط عند وجود بيانات فعلية وموافقة • نتائج فارغة مفهومة وحالات تحميل وخطأ • روابط سليمة • **بطاقة الكتاب العامة الواحدة (§13.2-7)** • لا يمنع تعطل AI التصفح أو البحث • responsive.

### Category `/smarttools/[category]`
صفحة فعلية server-rendered (ليست redirect ولا فلترة client فقط): Breadcrumb (Home → SmartTools → Category) • عنوان ووصف محليان + العدد الصحيح • بطاقات الأدوات التابعة فعلًا • بحث/تصفية ضمن الفئة • فئات ذات صلة وPrevious/Next حيث يفيد + عودة للـ Hub • حالة واضحة للفئة بلا أدوات متاحة • metadata مناسب • structured data صحيح.

### Tool `/smarttools/[category]/[tool]`
1. تحقق وجود الفئة → 2. وجود الأداة → 3. `tool.category === category` → 4. عند الفشل `notFound()` حقيقي → 5. حمّل المكون القائم عبر allowlist → 6. اعرض:
Breadcrumb + رقم الأداة + الاسم والوصف المترجمان + الحالة • SafetyNotice عند اللزوم • واجهة الأداة الحقيقية (التعليمات، المدخلات والتحقق، النتائج وتفسيرها، الوحدات، القيود والمصادر، تنبيهات السياق) • **BookCTA (§13) أسفل النتيجة مباشرة** • Related Tools + Previous/Next وفق ترتيب Registry • روابط الفئة والـ Hub • حفظ/استرجاع/مسح/تصدير حيث يلزم • Metadata خاص • حالات تحميل وخطأ وعدم كفاية بيانات • إعادة ضبط وتفاعل مناسب مع تغيير المدخلات.

---

## 15. Supabase والاستمرارية والخصوصية

افحص الجداول والمهاجرات وRLS الحالية أولًا. استخدم قاعدة مشتركة مع **فصل بيانات كل مستخدم** (لا اطلاع زوار على بيانات بعضهم). الجداول القائمة عند انطباقها: `user_tool_states`, `user_preferences`, `tool_usage_analytics`, `tool_ratings`, `user_voice_commands`, `ai_user_profiles`. حدد احتياجات الحفظ المعتمدة (تفضيلات، مفضلة، مدخلات/نتائج محفوظة، سجلات تقدم، workflows، إعدادات خصوصية).

**الزائر غير المسجل:** أدوات عامة دون إجبار تسجيل؛ تفضيلات غير حساسة محليًا مع توضيح ارتباطها بالجهاز وعدم مزامنتها تلقائيًا؛ توفير مسح البيانات.
**المسجل:** مزامنة ما وافق عليه عبر Supabase واسترجاعه عبر أجهزته بعد المصادقة والتحكم في التاريخ والحذف.

**الأمن:** RLS على كل بيانات المستخدم للقراءة والكتابة والتعديل والحذف + تشفير البيانات على مستوى Supabase • تحقق على الخادم وقيود قاعدة بيانات وindexes عند حاجة فعلية • اختبر منع مستخدم من الوصول لبيانات آخر على Staging • لا تسجل مدخلات/نتائج صحية خام في analytics ولا بيانات صحية في URL أو logs أو metadata • لا تكشف service-role key • اختبر الحفظ والاسترجاع والفشل عند انقطاع الخدمة • payloads typed وversioned مع إدارة حذف واحتفاظ • وجود SQL في المستودع لا يثبت تطبيقه — تحقق من migrations في Staging؛ إن تعذر التحقق الخارجي أكمل المحلي الممكن واذكر القيد بدقة.

---

## 16. العربية والإنجليزية والوحدات وإمكانية الوصول

**واجهتان كاملتان لا ترجمة عنوان فقط:** عربية RTL وإنجليزية LTR مع تحديث `lang` و`dir` • ترجمة الحقول والأخطاء والتعليمات والمخرجات وBreadcrumbs وARIA وMetadata وحالات الفراغ • بقاء URL بالـ English canonical slugs • تبديل اللغة دون إعادة تحميل غير ضرورية • تنسيق أرقام وتواريخ لكل لغة • النصوص المختلطة والأرقام والوحدات • CSS منطقية عند الملاءمة.

**الوحدات:** Metric/Imperial حيث يوجد بديل ذو معنى + وحدات متخصصة عند الحاجة • التحويل لوحدات داخلية قبل الحساب والعرض بالوحدة المختارة دون تغيير الحساب • منع التحويل المزدوج والمحافظة على الدقة + اختبارات round-trip • لا toggles لحقول لا تحتاجها • تفضيل محلي للزائر وSupabase للمسجل.

**الوصولية:** لوحة المفاتيح • labels واضحة • ترتيب focus صحيح • تباين مقروء • إعلان النتائج والأخطاء لقارئات الشاشة • عدم الاعتماد على اللون وحده • عرض مناسب للهاتف دون قص الحقول والنتائج.

---

## 17. SEO والبيانات المنظمة

ولّد SEO من الـ Registry: metadata فريدة لكل Hub/Category/Tool مترجمة • canonical واحد صحيح • OpenGraph وBreadcrumbList مناسبين • structured data فقط عندما يكون الادعاء صحيحًا (لا تدّعي خصائص غير موجودة) • sitemap ديناميكي من الأدوات والفئات المؤهلة فقط — لا placeholder ولا صفحات غير عاملة • معالجة فهرسة غير المنشور/غير المكتمل • منع تكرار الروابط والتحقق من الروابط الداخلية • legacy aliases ليست canonical • الحفاظ على قيمة الروابط القديمة عبر تحويلات مثبتة • **روابط الكتاب `rel="sponsored nofollow"` (§13.5)** • لا بيانات مستخدم أو نتائج صحية في metadata الصفحات العامة.

---

## 18. الحفظ والاستيراد والتصدير

احتفظ بصيغ وميزات المصدر المعتمدة دون افتراض صيغ إضافية كمتطلبات أصلية. عند الحاجة: schemas واضحة • رقم إصدار للتنسيق • تحقق من الحجم والبنية والقيم • أخطاء مفهومة • حفاظ على الوحدات والسياق • حماية البيانات الحساسة • منع الصيغ التنفيذية الضارة عند التصدير لبرامج الجداول (CSV injection) • مراجعة أثر الاستيراد قبل استبدال بيانات قائمة • تضمين القيود والمصادر اللازمة لفهم النتائج المصدرة • **تذييل مرجع الكتاب ورابط الشراء في التقارير المصدرة (§13.2-4)**.

---

## 19. الأداء والاعتمادية

لا تحميل كل الأدوات والمحركات دفعة واحدة؛ حصر dependencies الثقيلة في مواضع استخدامها • تقليل JS المرسل للعميل عند الملاءمة • caching دون خلط بيانات المستخدمين • timeouts وإلغاء للعمليات الطويلة • لا إعادة محاولة أخطاء تحقق لن تنجح بالتكرار • منع النقر المتكرر من تكرار عمليات مؤثرة • اختبار أداء البحث مع الكتالوج الكامل • عزل فشل أداة عن المنصة • بقاء الوظائف الأساسية عند تعطل AI • اربط التحسينات بقياسات أو مشكلة مثبتة.

---

## 20. خطة التنفيذ — استمر حتى النهاية

**المرحلة A — القراءة والتدقيق:** قراءة المصدر كاملًا (بما فيه `150 tools.txt` إن أُرفق) • فحص المستودع فعليًا • إنشاء مصفوفة المتطلبات ووثيقة التدقيق • توثيق التعارضات وتحديد النطاق الحالي/المستقبلي • baseline للاختبارات والبناء • ثم الانتقال مباشرة للتنفيذ.

**المرحلة B — الأساس المشترك:** Registry موحد بتحقق يفشل الـ Build عند الكسر (متضمنًا إلزامية `bookContext`) • الفئات العشر والـ Hub وصفحات الفئات • routes الأدوات وcomponent allowlist • **بنية نظام الكتاب: مكونا BookPromo + book-link.ts + الإعداد المركزي (§13.3)** • RTL/LTR واللغتان والوحدات وحفظ التفضيلات • Supabase/local persistence آمن • البحث الذكي والتوصيات والتنقل والصوت • خدمة AI على الخادم وfallback حتمي • SEO/sitemap وحالات التحميل والخطأ. اختبر البنية عمليًا.

**المرحلة C — حماية الموجود وترقيته:** فحص #1–#30 وتثبيت اختبارات مرجعية تمنع التراجع • إصلاح التكامل والفجوات مع الحفاظ على المحركات العاملة • إضافة المميزات المشتركة المناسبة لكل أداة بما فيها **توجيه الكتاب السياقي** • اختبار الوظائف قبل وصفها بالمكتملة.

**المرحلة D — استكمال النطاق المعتمد:** تنفيذ الأدوات الناقصة بالأولوية والاعتماديات، بمحركات فعلية حسب غرض كل أداة، بدفعات صغيرة قابلة للاختبار، مع شروط §9 و§13 كاملة لكل أداة قبل completed • إبقاء غير المنفذة صادقة الحالة • استمر حتى تكتمل كل أداة ممكنة.

**المرحلة E — خصائص المنصة:** البحث • التوصيات • AI (المساعد، NLP، الرؤية، الصوت، التخصيص، التدفقات المتعددة) • الحفظ • الاستيراد/التصدير.

**المرحلة F — التأهيل والقبول:** الأمان وRLS • RTL/LTR والوحدات • الوصولية • SEO والتحويلات • الأداء • الاختبارات والبناء • توثيق التشغيل والنشر • التقرير النهائي.

بعد كل مرحلة: حدّث الأدلة وتابع الأعمال الممكنة؛ لا تتوقف عند إنجاز شكلي.

---

## 21. الاختبارات والتحقق الإلزامي

**Registry والمسارات:** 150 ID فريدة • مسارات canonical فريدة • فئة صحيحة واحدة لكل أداة • عدم احتساب alias كأداة • مكونات موجودة للمكتملة • كل recommendation/reference صالح • اتساق الحالات وmetadata عربي/إنجليزي كامل • mismatch يُرجع 404 • التحويلات القديمة 301 نهائي دون حلقات • أهلية sitemap • **اكتمال bookContext لكل أداة مكتملة**.

**محركات الأدوات:** سيناريوهان صالحان مختلفان على الأقل • نتائج مرجعية مستقلة • حدود المدخلات وغير الصالحة • تحويل الوحدات بالاتجاهين • الدقة والتقريب • منع تراجع الأصلية #1–#30.

**التكامل والواجهات:** فتح الأداة من Hub والفئة والبحث • إرسال المدخلات وعرض النتائج • حالات التحميل والفشل • الحفظ والاسترجاع • اللغة والاتجاه • الهاتف ولوحة المفاتيح.

**Supabase (Staging فقط):** حفظ/استرجاع/تحديث/حذف • عزل مستخدمين اثنين وRLS • سلوك الزائر • payload غير صالح • انقطاع الخدمة • عدم تسرب بيانات في analytics.

**AI:** مخرجات ضمن schema • عدم اختراع أدوات أو روابط • احترام الإتاحة والصلاحيات • فشل المزود وtimeout وfallback • حماية البيانات • حدود السلامة • مقاومة prompt injection • **حدود توصية الكتاب (§11.5/§13.6)**.

**نظام الكتاب (§13.6):** كل اختباراته كاملة.

**بوابة البناء:** نفّذ أوامر المشروع الفعلية للتحقق من TypeScript وlint والاختبارات ذات الصلة وproduction build؛ سجّل النتيجة الفعلية ولا تعطل قواعد التحقق. **مهلة 30 ثانية لا تثبت نجاحًا أو فشلًا** — شخّص الموارد والسجلات، لا تشغّل builds متعارضة، وأعد البناء بمهلة مناسبة؛ القبول يتطلب exit code ناجحًا وسجلًا واضحًا. نجاح TypeScript لا يثبت نجاح production build، ونجاح المحلية لا يثبت عمل Staging/Production.

---

## 22. Git والنشر والصلاحيات

استخدم الفرع ومشروع Vercel الموجودين بعد التحقق. **بعد كل 10 أدوات مكتملة:** اختبارات الدفعة + فحص Registry وغياب التراجع + مراجعة diff + commit واضح يذكر نطاق الأدوات + push للفرع المصرح + تسجيل SHA والاختبارات الفعلية. **بعد كل 50 أداة:** TypeScript وlint والاختبارات وproduction build + اختبار Hub والفئات والمسارات المعنية + النشر على مشروع Vercel المقصود فقط إن كانت الفحوصات ناجحة والصلاحيات متاحة + التحقق من النشر والمسارات الفعلية.

لا تعدّ أداة جزئية ضمن دفعة مكتملة • لا تتجاوز اختبارًا فاشلًا من أجل commit أو deploy • تغييرات مركزة دون تعديلات غير مرتبطة • وثّق تغييرات dependencies وملفات القفل • عند وجود تصريح سابق لا تطلبه مجددًا • لا تعتبر نجاح طلب النشر دليل سلامة الموقع • لا تغيّر أسرارًا أو صلاحيات خارجية ولا migration إنتاجيًا دون موافقة صريحة • لا تختلق رابط نشر أو حالة نجاح.

---

## 23. التعامل مع العوائق

1. حدّد السبب بدقة واميّز نقص البيانات عن نقص الصلاحية عن الخطأ البرمجي. 2. جرّب الحلول الآمنة داخل النطاق. 3. تابع الأعمال غير المعتمدة عليه. 4. سجّل المتطلبات المتأثرة. 5. لا تستبدل النتيجة الحقيقية بمحاكاة غير معلنة. 6. اطلب المعلومة أو الصلاحية المحددة فقط إذا كانت ضرورية فعلًا. لا تصف العمل كمكتمل مع عائق مؤثر غير معلن.

---

## 24. التوثيق المطلوب

```text
docs/smarttools-audit.md
docs/smarttools-requirements-traceability.md
docs/smarttools-architecture.md
docs/smarttools-status-model.md
docs/smarttools-routing-and-migrations.md
docs/smarttools-ai-contracts.md
docs/smarttools-book-integration.md
docs/smarttools-testing.md
docs/smarttools-acceptance-report.md
docs/smarttools-adding-tools.md
```

يمكن الدمج إذا كان أنسب بشرط حفظ المحتوى وقابلية التتبع. وثيقة `book-integration` توثق: مواضع CTA، الخريطة السياقية، إدارة الرابط والـ UTM، واختبارات النظام. ووثيقة إضافة الأدوات توضح إضافة الأداة 151+ بما يشمل: التعريف، التصنيف، ربط المكون، الحالات، الترجمة، **bookContext**، الاختبار، الإدراج في البحث وSEO، ومراجعة الأمان.

---

## 25. معايير القبول النهائية

لا تعلن اكتمال المشروع إلا إذا:
1. 150 أداة canonical مميزة موزعة على الفئات العشر، دون أدوات مزيفة أو مكررة لرفع العدد.
2. كل أداة لها صفحة canonical ووظيفة فعلية قابلة للمعاينة والتشغيل.
3. كل محرك حسابي ديناميكي ومختبر بنتائج مرجعية مستقلة.
4. كل الأدوات قابلة للاكتشاف من Hub والفئة والبحث.
5. ميزات AI تعمل فعلًا أو تعرض fallback صادقًا.
6. **كل أداة مكتملة تتضمن توجيه الكتاب السياقي العامل (bookContext + BookCTA + رابط مركزي واحد) وفق §13.**
7. Supabase يعمل على Staging مع RLS واختبارات عزل.
8. العربية RTL والإنجليزية LTR والوحدات تعمل عمليًا.
9. SEO وsitemap بلا روابط مكررة أو placeholders.
10. TypeScript وlint والاختبارات وproduction build ناجحة.
11. الأدوات الأصلية لم تتراجع؛ المسجل ≠ المكتمل، وملف موجود ≠ تكامل مختبر.
12. المتطلبات المستقبلية محفوظة دون ادعاء تنفيذها؛ كل القيود المؤثرة معلنة.

إذا كان النطاق الحالي لا يشمل الـ150 كلها، أعلن اكتمال النطاق الحالي وعدد الأدوات الجاهزة منفصلين.

---

## 26. التقرير النهائي

تقرير موحد مدعوم بالأدلة:
**النتيجة:** العدد الفعلي المكتمل X/150 • المتكاملة والمختبرة • المتاحة للمستخدم • المخططة/المحجوبة • حالة النطاق الحالي.
**جدول كل أداة:** `ID | الاسم | الفئة | المسار الكانوني | المحرك/الوظيفة | الاختبار | الحالات | bookContext ✓/✗ | القيود` — لا تختصر بطريقة تخفي غير المكتملة؛ إن طال ضعه في وثيقة كاملة واربطه.
**خريطة التغييرات:** الموجود سابقًا • ما حُفظ • ما حُسِّن • ما أُنشئ • ما رُحِّل • ما بقي مستقبليًا + أي تغيير جوهري وأسبابه.
**التحقق:** TypeScript • lint • الاختبارات • production build • المسارات والتحويلات • RTL/LTR والوحدات • الوصولية • SEO/sitemap • Supabase وRLS على Staging • AI (بحث/توصيات/تنقل/صوت/رؤية/تخصيص) وfallback • **نظام الكتاب: تغطية bookContext، صحة الروابط وUTM، اختبارات عدم الإزعاج وأولوية السلامة** • الخصوصية والسلامة • نتائج النشر المصرح به. ميّز بين: نجح / فشل / لم يُشغّل / تعذّر بسبب عائق.
**مراجعة عدم الفقدان:** ارجع لمصفوفة المتطلبات وتأكد أن كل متطلب: نُفّذ وتحقق • أو حُفظ في خريطة الطريق • أو حُجب بسبب معلن • أو عولج بتفسير موثق للتعارض.
**Git:** الفرع وSHAs ونتائج push وروابط Vercel المنشورة والمتحقق منها فعليًا.

لا تخترع سجلًا أو نتيجة أو رابط نشر؛ الأداة غير المكتملة تظهر كذلك ولا تُرفع إلى completed.

---

## 27. أمر التنفيذ النهائي

ابدأ الآن بفحص المشروع وتحديد الأدوات المبرمجة فعليًا واختبارها وتطويرها مع الحفاظ على حساباتها العاملة، ثم أنشئ كل ما ينقص حتى تصبح الأدوات الـ150 منفذة ومصنفة ومرتبطة بمنصة SmartTools وكل الميزات المطلوبة (Registry، AI لكل أداة، ثنائي اللغة، الوحدات، Supabase، SEO، الاختبارات، النشر) — **مع نظام توجيه كتاب ودليل Mr. X-Steroid Book مدمجًا سياقيًا في كل أداة وفق §13**. لا تتوقف عند تقرير التدقيق أو Registry أو صفحات شكلية؛ سلّم التنفيذ الحقيقي والأدلة، مع احترام قيود الأمان والخصوصية والإنتاج.

**معيار النجاح: وظيفة حقيقية قابلة للاستخدام والتحقق، حفاظ كامل على متطلبات المصدر، صدق حالة كل أداة وميزة، وتوجيه الكتاب السياقي العامل في كل أداة مكتملة.**
```

---

## 📌 ملاحظات التنفيذ

1. **الكتاب في 7 مواضع إلزامية + بطاقة عامة واحدة للـ Hub/الفئة** — تكثيف مدروس يرفع التحويل دون إزعاج يقتل التجربة.
2. **`bookContext` في الـ Registry + تحقق Build يفشل عند غيابه** = ضمان آلي أن أي أداة تصل completed لن تنسى توجيه الكتاب.
3. **رابط واحد مركزي + UTM** = تستطيع تغيير رابط الشراء أو رابط الشريك مستقبلًا من مكان واحد دون تعديل 150 أداة، وتعرف من analytics أي موضع يحوّل أكثر.
4. **قاعدة Safety > Monetization**: عند تحذير طبي عاجل يُستبدل CTA بتوجيه الرعاية — هذا يحمي مصداقية المنصة والمستخدم معًا.
5. **لا تخترع أرقام فصول** — استخدم فهرس الكتاب الفعلي عند توفره لملء `bookContext`، وإلا استخدم أسماء الأقسام الموضوعية.
6- 
لا تبنِ 150 أداة دفعة واحدة. نفّذ MVP بالأدوات الـ 30 الأصلية أولاً مع bookContext كامل. بعد التحقق من الأداء والمقاييس، أضف دفعات بـ 20 أداة.
أعد تصميم الـ 7 مواضع إلى 3 فقط للإطلاق:
CTA أسفل النتيجة.
إشارة سياقية واحدة في المحتوى/التعليم.
الرابط في تقرير التصدير (PDF/HTML).

هذا يقلل الازدحام البصري بنسبة  
7
7−3
​
 ≈57% مع الحفاظ على 90% من القيمة التسويقية.
استخدم SSR للـ Canonical Routes لضمان أن محركات البحث ترى المحتوى الأصلي أولاً والروابط الترويجية ثانويًا.
افصل الـ BookPromo كـ Micro-frontend أو Package مستقل بحيث إذا أردت تغيير الكتاب لاحقًا أو إزالته، لا تلمس أي شيفرة في src/smarttools/tools/.
أضف Feature Flag للترويج. هذا يتيح لك إيقاف كل الـ CTAs دفعة واحدة في حالات الطوارئ القانونية أو الطبية دون redeploy.

لو تحب، أجهّز لك **جدول `bookContext` جاهزًا للأدوات الـ150** (فصل مقترح + نص CTA عربي/إنجليزي لكل أداة) كملف منفصل تسلّمه للـ AI مع هذا البرومبت 👊

\# MASTER IMPLEMENTATION PROMPT

\# Mr. X-Steroid — SmartTools Scalable, Safe, Hierarchical Platform Architecture



\## 0. Mission



Upgrade the existing SmartTools area at:



https://mrxsteroid.com/smarttools



into a scalable, registry-driven hierarchical platform:



/smarttools

/smarttools/\[category]

/smarttools/\[category]/\[tool]



Example:



/smarttools/nutrition/macro



The platform must support the existing completed tools #1–#30 without rewriting their calculators, while providing a secure, maintainable foundation for future tools #31–#150 and beyond.



The goal is not merely a tools page. The goal is a complete SmartTools platform:



Hub → Category → Tool → Related Tools → Reports / Insights / Future AI integrations



\---



\## 1. Non-Negotiable Product Principles



1\. Preserve working tools #1–#30.

&#x20;  - Do not rewrite their calculation engines.

&#x20;  - Do not alter their mathematical models.

&#x20;  - Do not change their existing inputs or outputs unless a compatibility-safe UI improvement is needed.

&#x20;  - Reuse each existing tool implementation through a registry mapping.



2\. Canonical URLs are always hierarchical and English-slug based:



/smarttools/\[category]/\[tool]



3\. URLs never become Arabic based on locale.



Correct in Arabic and English:



/smarttools/nutrition/macro



Never create:



/smarttools/التغذية/ماكرو

/smarttools/ar/nutrition/macro

/smarttools/Categories/macro



Unless the existing project already mandates locale prefixes globally. Even then, category and tool slugs remain English.



4\. No duplicate canonical routes.

&#x20;  - `/smarttools/nutrition/macro` is canonical.

&#x20;  - `/smarttools/macro` must not become a second canonical route.

&#x20;  - Existing legacy routes must redirect permanently when verified.



5\. Future tools must require only:

&#x20;  - Adding one record to the central registry.

&#x20;  - Adding or mapping the tool component.

&#x20;  - No new manual route files.



6\. Health, medication, hormone, injection, fertility, insulin, peptides, and emergency-related tools must use a safety-first product design.

&#x20;  - Provide educational and harm-reduction information.

&#x20;  - Avoid presenting diagnosis, prescriptions, emergency treatment, or individualized dosing as medical certainty.

&#x20;  - Clearly recommend qualified medical review for high-risk findings.

&#x20;  - Trigger urgent-care warnings when user-entered values or symptoms indicate potentially dangerous situations.

&#x20;  - Do not encourage illicit manufacturing, unsafe injections, or medication misuse.



\---



\## 2. Required Tech Direction



Use the current project stack where possible. If the project is Next.js, use Next.js 14+ App Router patterns.



Preferred architecture:



app/

&#x20; smarttools/

&#x20;   layout.tsx

&#x20;   page.tsx

&#x20;   \[category]/

&#x20;     page.tsx

&#x20;     \[tool]/

&#x20;       page.tsx

&#x20;       not-found.tsx



src/

&#x20; smarttools/

&#x20;   registry/

&#x20;     categories.ts

&#x20;     tools.ts

&#x20;     legacy-routes.ts

&#x20;     index.ts

&#x20;   components/

&#x20;     SmartToolsHub.tsx

&#x20;     CategoryPage.tsx

&#x20;     ToolPageShell.tsx

&#x20;     ToolCard.tsx

&#x20;     CategoryCard.tsx

&#x20;     SmartToolsSearch.tsx

&#x20;     SmartToolsBreadcrumbs.tsx

&#x20;     RelatedTools.tsx

&#x20;     SafetyNotice.tsx

&#x20;   loaders/

&#x20;     tool-component-loader.ts

&#x20;   lib/

&#x20;     smarttools-seo.ts

&#x20;     smarttools-search.ts

&#x20;     smarttools-related.ts

&#x20;     smarttools-validation.ts

&#x20;     smarttools-schema.ts



Equivalent project conventions are acceptable, but the architecture must remain registry-driven and type-safe.



\---



\## 3. Central Single Source of Truth



Create one central typed Registry for categories and tools.



Do not duplicate tool definitions in routes, sitemap files, search data, SEO files, or card components.



All of the following must be generated from the registry:



\- Hub sections

\- Category pages

\- Tool routes

\- Tool cards

\- Search index

\- Breadcrumbs

\- Related tools

\- Canonical URLs

\- Metadata

\- OpenGraph data

\- JSON-LD structured data

\- Sitemap entries

\- Legacy redirect map

\- Route validation



\### 3.1 Category Types



```ts

export const SMART\_TOOL\_CATEGORY\_SLUGS = \[

&#x20; "nutrition",

&#x20; "body-composition",

&#x20; "pharmacokinetics",

&#x20; "hormonal-health",

&#x20; "medical-monitoring",

&#x20; "injection-formulation",

&#x20; "cycle-management",

&#x20; "training-recovery",

&#x20; "reproductive-wellbeing",

&#x20; "platform-ai",

] as const;



export type SmartToolCategory =

&#x20; (typeof SMART\_TOOL\_CATEGORY\_SLUGS)\[number];



export interface SmartToolCategoryDefinition {

&#x20; slug: SmartToolCategory;

&#x20; nameAr: string;

&#x20; nameEn: string;

&#x20; descriptionAr: string;

&#x20; descriptionEn: string;

&#x20; icon?: string;

&#x20; order: number;

&#x20; safetyLevel?: "general" | "health" | "high-risk";

}

```



\### 3.2 Tool Types



```ts

export type SmartToolStatus =

&#x20; | "completed"

&#x20; | "active"

&#x20; | "beta"

&#x20; | "planned";



export type SmartToolRiskLevel =

&#x20; | "general"

&#x20; | "wellness"

&#x20; | "medical-information"

&#x20; | "high-risk";



export interface SmartToolDefinition {

&#x20; id: number;

&#x20; slug: string;

&#x20; category: SmartToolCategory;



&#x20; nameAr: string;

&#x20; nameEn: string;



&#x20; descriptionAr: string;

&#x20; descriptionEn: string;



&#x20; status: SmartToolStatus;

&#x20; riskLevel: SmartToolRiskLevel;



&#x20; tags?: string\[];

&#x20; keywordsAr?: string\[];

&#x20; keywordsEn?: string\[];



&#x20; componentKey?: string;

&#x20; componentName?: string;



&#x20; legacyPaths?: string\[];

&#x20; relatedToolIds?: number\[];



&#x20; searchable?: boolean;

&#x20; indexable?: boolean;



&#x20; requiresDisclaimer?: boolean;

&#x20; requiresMedicalReview?: boolean;



&#x20; availableLocales?: string\[];

}

```



\### 3.3 Registry Validation



At build time or during CI, validate:



\- Every tool ID is unique.

\- Every tool slug is unique globally unless a deliberate namespace strategy exists.

\- Every category exists.

\- Every category slug is valid.

\- Every tool belongs to exactly one category.

\- Every completed tool has a component mapping.

\- Every legacy path maps to only one tool.

\- Every relatedToolId exists.

\- No canonical URL collision exists.

\- All tool IDs #1–#30 are marked `completed`.



Fail the build or CI validation when registry integrity is broken.



\---



\## 4. Canonical Category Registry



Use these permanent canonical category slugs:



| Slug | Arabic Name | English Name |

|---|---|---|

| nutrition | التغذية والماكروز | Nutrition \& Macros |

| body-composition | تكوين الجسم | Body Composition |

| pharmacokinetics | الحرائك الدوائية | Pharmacokinetics |

| hormonal-health | الصحة الهرمونية | Hormonal Health |

| medical-monitoring | التحاليل والمراقبة الصحية | Medical Monitoring |

| injection-formulation | الحقن والتحضير | Injection \& Formulation |

| cycle-management | إدارة الدورات والستاك | Cycle \& Stack Management |

| training-recovery | التدريب والاستشفاء | Training \& Recovery |

| reproductive-wellbeing | الصحة الإنجابية والعافية | Reproductive \& Wellbeing |

| platform-ai | الذكاء الاصطناعي وقيادة المنصة | AI \& Platform |



Use category assignment based on actual function, not only the original list grouping.



\---



\## 5. Routing Rules



\### 5.1 Hub



/smarttools



Must show:



\- All approved tools.

\- Category sections.

\- Tool count per category.

\- Category navigation.

\- Search.

\- Category filter.

\- Tool ID.

\- Arabic and English names based on UI locale.

\- Description.

\- Tool status.

\- Category badge.

\- Open Tool CTA.

\- Empty-state handling for categories without tools.

\- Optional featured / recently added / popular sections.



\### 5.2 Category Page



/smarttools/\[category]



Must be a real server-rendered page, not a redirect and not only a client filter.



Must include:



\- Breadcrumb:

&#x20; Home → SmartTools → Category

\- Category title in active locale.

\- Category description.

\- Tool count.

\- Search limited to category tools.

\- Category tool cards.

\- Related categories.

\- Previous / next category navigation where useful.

\- Back to SmartTools.

\- SEO metadata and structured data.



\### 5.3 Tool Page



/smarttools/\[category]/\[tool]



Must:



1\. Validate category exists.

2\. Validate tool exists.

3\. Ensure `tool.category === category`.

4\. If invalid, render `notFound()`.

5\. Load the existing tool component through a safe component registry.

6\. Display:

&#x20;  - Breadcrumb

&#x20;  - Tool ID

&#x20;  - Localized name

&#x20;  - Localized description

&#x20;  - Status

&#x20;  - Safety disclaimer when required

&#x20;  - Existing calculator / tool interface

&#x20;  - Related tools

&#x20;  - Previous / next tool

&#x20;  - Link to category

&#x20;  - Link to SmartTools hub

&#x20;  - Tool-specific SEO metadata



Never dynamically import from unvalidated user-controlled strings. Use an allowlisted component loader map.



Example:



```ts

const toolComponentLoaders = {

&#x20; adaptiveMacro: dynamic(() => import("@/components/tools/AdaptiveMacroCalculator")),

&#x20; ffmiBodyFat: dynamic(() => import("@/components/tools/FfmiBodyFatAnalyzer")),

&#x20; accumulationHalfLife: dynamic(() => import("@/components/tools/AccumulationHalfLifeSimulator")),

} as const;

```



\---



\## 6. Existing Completed Tools #1–#30



All tools #1–#30 are completed and must have:



```ts

status: "completed"

```



Do not label them planned, unavailable, or coming soon.



Map their existing components and preserve their current logic.



\### Official Canonical Mapping



| ID | English Name | Category | Slug |

|---:|---|---|---|

| 1 | Adaptive Macro Calculator | nutrition | macro |

| 2 | FFMI \& Body Fat Analyzer | body-composition | ffmi-body-fat |

| 3 | Accumulation \& Half-Life Simulator | pharmacokinetics | accumulation-half-life |

| 4 | PCT Timing \& Washout Engine | hormonal-health | pct-washout |

| 5 | Intelligent HCG \& SERM Generator | hormonal-health | hcg-serm |

| 6 | Estrogen \& Prolactin Control Engine | hormonal-health | estrogen-prolactin |

| 7 | Bloodwork Analyzer | medical-monitoring | bloodwork |

| 8 | Side Effect Tracker | medical-monitoring | side-effect-tracker |

| 9 | Injection Site Rotator | injection-formulation | injection-site-rotator |

| 10 | Compound Stack Builder | cycle-management | compound-stack |

| 11 | Progress Tracker | training-recovery | progress-tracker |

| 12 | Dynamic Calorie Adjuster | nutrition | dynamic-calorie-adjuster |

| 13 | Macro Optimizer | nutrition | macro-optimizer |

| 14 | Water Retention Calculator | nutrition | water-retention |

| 15 | SHBG Modulator | hormonal-health | shbg-modulator |

| 16 | Multi-Compound Half-Life Calculator | pharmacokinetics | multi-compound-half-life |

| 17 | Injection Volume Calculator | injection-formulation | injection-volume |

| 18 | Compound Half-Life Stacker | pharmacokinetics | half-life-stacker |

| 19 | HPTA Recovery Monitor | hormonal-health | hpta-recovery |

| 20 | Genetic Potential Calculator | body-composition | genetic-potential |

| 21 | Peptide Protocol Planner | hormonal-health | peptide-protocol |

| 22 | Oral Cycle Planner | cycle-management | oral-cycle |

| 23 | TRT Optimization Engine | hormonal-health | trt-optimization |

| 24 | Post-Cycle Bloodwork Interpreter | medical-monitoring | post-cycle-bloodwork |

| 25 | Drug Interaction Checker Pro | medical-monitoring | drug-interactions |

| 26 | Injection Pain Minimizer | injection-formulation | injection-pain |

| 27 | Ester Conversion Calculator | pharmacokinetics | ester-conversion |

| 28 | Compound Stacking Synergy | cycle-management | stack-synergy |

| 29 | Side Effect Early Warning | medical-monitoring | side-effect-warning |

| 30 | Cycle Cost Calculator | cycle-management | cycle-cost |



Examples:



/smarttools/nutrition/macro

/smarttools/body-composition/ffmi-body-fat

/smarttools/pharmacokinetics/accumulation-half-life

/smarttools/hormonal-health/pct-washout

/smarttools/medical-monitoring/bloodwork

/smarttools/injection-formulation/injection-site-rotator

/smarttools/cycle-management/compound-stack



\---



\## 7. Future Tool Registry: #31–#150



Register future tools as `planned` unless the actual component is already implemented.



Do not create fake calculator interfaces for planned tools.



For planned tools:



\- Show them in the hub only if product requirements permit planned visibility.

\- Clearly label status as planned or beta.

\- Do not expose them as fully operational tools.

\- Consider `noindex` for placeholder-only tool pages.

\- Prefer showing a controlled “Coming Soon / Join Waitlist / Learn More” state rather than inaccurate calculation outputs.



\### 7.1 Tools #31–#38



31\. Cycle Length Optimizer  

32\. Advanced PCT Planner  

33\. Bloodwork Trend Analyzer  

34\. Compound Clearance Calculator  

35\. Hormone Conversion Calculator  

36\. Injection Schedule Planner  

37\. Side Effect Probability Calculator  

38\. Stack Compatibility Checker  



\### 7.2 Tools #39–#50



39\. Liver Enzyme Tracker  

40\. Lipid Profile Optimizer  

41\. Hematocrit Monitor  

42\. Estrogen Management Pro  

43\. Prolactin Management Pro  

44\. DHT Side Effect Predictor  

45\. Cycle Break Planner  

46\. TRT Lifetime Calculator  

47\. Fertility Preservation Guide  

48\. Cardiovascular Risk Assessor  

49\. Bone Density Optimizer  

50\. Mental Health Monitor  



\### 7.3 Tools #51–#56



51\. Peptide Dosage Calculator  

52\. Growth Hormone Protocol Planner  

53\. Insulin Conversion Calculator  

54\. Glucose Tracker  

55\. Insulin Sensitivity Optimizer  

56\. Mini PCT Calculator  



\### 7.4 Tools #57–#68



57\. Free Testosterone Manager  

58\. Androgenic Balance Calculator  

59\. Androgen Receptor Optimizer  

60\. 5-Alpha Conversion Calculator  

61\. Hair Loss Tracker  

62\. Prostate Health Manager  

63\. Testicular Suppression Calculator  

64\. Sperm Production Optimizer  

65\. Aromatase Conversion Calculator  

66\. Estrogen Sensitivity Manager  

67\. Estrogen Balance Calculator  

68\. Gynecomastia Tracker  



\### 7.5 Tools #69–#78



69\. Detoxification Optimizer  

70\. Oxidative Stress Calculator  

71\. Antioxidant Manager  

72\. Systemic Inflammation Calculator  

73\. Immune System Optimizer  

74\. Blood Pressure Tracker  

75\. Arterial Health Manager  

76\. Blood Viscosity Calculator  

77\. Nitric Oxide Optimizer  

78\. Endothelial Health Manager  



\### 7.6 Tools #79–#89



79\. Fat Metabolism Calculator  

80\. Mitochondrial Optimizer  

81\. Cellular Aging Calculator  

82\. Telomere Manager  

83\. Anti-Aging Inflammation Calculator  

84\. Cognitive Enhancer  

85\. Sleep Quality Manager  

86\. Cortisol Stress Calculator  

87\. Mood Optimizer  

88\. Dopamine Tracker  

89\. Serotonin Manager  



\### 7.7 Tools #90–#100



90\. Female Hormone Balance Calculator  

91\. Female Health Optimizer  

92\. Female Dosage Calculator  

93\. Menstrual Cycle Manager  

94\. Pregnancy Risk Calculator  

95\. Skin Health Optimizer  

96\. Hair \& Nail Tracker  

97\. Hydration Balance Calculator  

98\. Sodium-Potassium Manager  

99\. Digestive Health Optimizer  

100\. Comprehensive Report Generator  



\### 7.8 Advanced Tools #101–#109



101\. SARM-to-AAS Transition \& Bridge Predictor  

102\. Subcutaneous vs. Intramuscular PK Modeler  

103\. Renal Function \& Hydration Index  

104\. Thyroid Function \& Metabolic Rate Dynamics  

105\. AI Health Data Fusion Hub \& Timeline  

106\. Glycogen Supercompensation \& Water Retention Modeler  

107\. Contest Prep Peak-Week Manipulator  

108\. AI Body Composition Vision Engine  

109\. Competition Readiness \& Stage Posing OS  



\### 7.9 Nutrition Intelligence #110–#117



110\. AI Meal Vision Scanner \& Portion Estimator  

111\. Smart Food \& Macro Substitution Engine  

112\. Food Quality \& Micronutrient Diversity Score  

113\. AI Grocery Basket \& Meal Cost Optimizer  

114\. Restaurant Macro Navigator \& Fast-Food Estimator  

115\. Supplement Evidence \& Bio-Stack Navigator  

116\. Nutrition Gap \& Fasting Window Optimizer  

117\. Intra-Workout Nutrient Volumizer \& Transport Engine  



\### 7.10 Training and Recovery #118–#136



118\. CNS Recovery Score  

119\. Training Volume Load \& Hypertrophy Index  

120\. Progressive Overload \& Adaptive Reserve Capacity Predictor  

121\. Muscle Group Recovery Time-Course Modeler  

122\. RPE / RIR to 1RM Dynamic Velocity Modeler  

123\. Joint Stress \& Connective Tissue Load Risk Index  

124\. Deload Frequency \& Fatigue Accumulation Modeler  

125\. Fiber Type Adaptation \& Mechanical Tension Score  

126\. Neuromuscular Performance \& Explosiveness Modeler  

127\. AI Daily Readiness \& Cause Explainer Engine  

128\. Training Load Balance \& Acute-to-Chronic Ratio  

129\. AI Adaptive Training Program Planner  

130\. AI Plateau Detective \& Stagnation Analyzer  

131\. Transformation Forecast \& Trajectory Engine  

132\. AI Pose \& Exercise Form Coach  

133\. Rep Tempo \& Velocity Loss Analyzer  

134\. Mobility Intelligence \& Movement Symmetry Screen  

135\. Exercise Substitution AI \& Injury Workaround  

136\. Physique Proportion \& Golden Ratio Score  



\### 7.11 High-Risk / Restricted Future Concepts #137–#144



137\. Peptide \& Hormone Reconstitution Calculator  

138\. Raw Powder Density \& Oil Formulation Engine  

139\. Solvent \& Emulsifier Ratio Calculator  

140\. Dosage Unit Conversion Engine  

141\. Carrier Oil Viscosity \& Syringe Pressure Estimator  

142\. Compound Purity \& Active Yield Estimator  

143\. Storage Stability \& Thermal Degradation Estimator  

144\. Homebrew Chemistry Mass \& Density Calculator  



Important implementation policy:



\- #140 may be implemented as a general clinical laboratory unit converter with verified formulas and sources.

\- #137, #138, #139, #141, #142, #143, and #144 must not provide instructions that enable unsafe, unlawful, or unregulated drug compounding, injectable manufacturing, or homebrew production.

\- They should remain planned, restricted, educational-only, or redesigned into safe informational tools unless legal, clinical, regulatory, and product safety review approves their functionality.

\- Never frame unregulated injectable preparation as safe.



\### 7.12 Platform AI #145–#150



145\. Habit Intelligence \& Consistency Coach  

146\. AI Safety Gate \& Emergency Protocol  

147\. Scientific Evidence Explorer \& Citation Engine  

148\. My Personal Fitness Memory Layer  

149\. Physique Trajectory Scenario Simulator  

150\. Mr. X AI Performance Command Center  



\---



\## 8. Recommended Category Assignment Rules



Use the following distribution as the initial classification guide.



\- `nutrition`

&#x20; - 1, 12, 13, 14, 79, 97, 98, 99, 106, 110–117



\- `body-composition`

&#x20; - 2, 20, 81, 106–109, 131, 136, 149



\- `pharmacokinetics`

&#x20; - 3, 16, 18, 27, 34, 35, 101, 102, 140



\- `hormonal-health`

&#x20; - 4–6, 15, 19, 21, 23, 32, 42, 43, 46, 51, 52, 56–68, 90–94, 104



\- `medical-monitoring`

&#x20; - 7, 8, 24, 25, 29, 33, 37, 39–41, 44, 48–50, 53–55, 69–78, 103



\- `injection-formulation`

&#x20; - 9, 17, 26, 36

&#x20; - Restricted / reviewed concepts: 137–144



\- `cycle-management`

&#x20; - 10, 22, 28, 30, 31, 38, 45



\- `training-recovery`

&#x20; - 11, 118–135



\- `reproductive-wellbeing`

&#x20; - 47, 61, 62, 64, 90–94



\- `platform-ai`

&#x20; - 100, 105, 145–150



The registry remains the authority. If an item reasonably spans categories, it still has one primary category and may use tags for cross-discovery.



\---



\## 9. Localization



The UI must support Arabic and English.



Rules:



\- URL slugs always remain English.

\- Display name, descriptions, buttons, metadata, search labels, and navigation are localized.

\- Arabic UI must support RTL correctly.

\- Tool cards can show both names if desired:

&#x20; - Arabic primary in Arabic UI.

&#x20; - English primary in English UI.

\- Metadata must be localized based on active locale.

\- Avoid duplicated localized URLs unless the project’s existing i18n architecture requires it.



\---



\## 10. Search and Discovery



Create a fast client-side search index for the hub and category pages.



Search across:



\- Tool ID

\- Arabic name

\- English name

\- Arabic description

\- English description

\- Category Arabic name

\- Category English name

\- Tool slug

\- Category slug

\- Tags

\- Arabic keywords

\- English keywords



Features:



\- Fuzzy matching / typo tolerance.

\- Arabic-friendly normalization:

&#x20; - Normalize Arabic letter variants.

&#x20; - Ignore diacritics.

&#x20; - Normalize spacing.

\- English token search.

\- Debounced input.

\- Keyboard accessible results.

\- Clear empty state.

\- Search results always link to canonical tool URLs.



For fewer than several hundred tools, a lightweight client index is preferred. Avoid unnecessary search infrastructure.



\---



\## 11. Related Tools Logic



Generate related tools automatically in this priority order:



1\. Explicit `relatedToolIds`.

2\. Same category.

3\. Shared tags.

4\. Complementary categories.

5\. Previous and next tool by ID or category order.



Do not show the current tool as related.



Examples:



Adaptive Macro Calculator may relate to:



\- Dynamic Calorie Adjuster

\- Macro Optimizer

\- Progress Tracker

\- Hydration Balance Calculator



\---



\## 12. Existing Tool Integration



For each completed tool:



1\. Find the real existing component and current route.

2\. Do not duplicate the logic.

3\. Register the component in the allowlisted component loader map.

4\. Render it inside a common ToolPageShell.

5\. Preserve state behavior where feasible.

6\. Confirm calculator functionality works after being mounted under the new canonical URL.

7\. Map real legacy routes only after inspecting actual existing routes.



Do not guess legacy paths.



Example:



```ts

{

&#x20; id: 1,

&#x20; slug: "macro",

&#x20; category: "nutrition",

&#x20; nameAr: "حاسبة الماكروز التكيفية",

&#x20; nameEn: "Adaptive Macro Calculator",

&#x20; descriptionAr: "تحسب السعرات والبروتين والكربوهيدرات والدهون بناءً على هدفك وبياناتك الجسدية.",

&#x20; descriptionEn: "Calculates calories, protein, carbohydrates, and fats based on your goal and body data.",

&#x20; status: "completed",

&#x20; riskLevel: "general",

&#x20; componentKey: "adaptiveMacro",

&#x20; legacyPaths: \["/macro"],

&#x20; tags: \["macros", "calories", "nutrition", "protein"],

&#x20; searchable: true,

&#x20; indexable: true,

}

```



\---



\## 13. Legacy Route Migration



Inspect the actual codebase for existing tool routes.



Create a verified legacy route map only from routes that truly exist.



Examples only if confirmed:



/macro → /smarttools/nutrition/macro

/bodyfat → /smarttools/body-composition/ffmi-body-fat

/injection → /smarttools/injection-formulation/injection-site-rotator

/halflife → /smarttools/pharmacokinetics/accumulation-half-life



Requirements:



\- Use permanent redirects for confirmed legacy routes.

\- Preserve query parameters where safe and relevant.

\- Do not redirect unknown routes blindly.

\- Avoid redirect loops.

\- Do not remove old routes until redirects are tested.

\- Ensure canonical tags always reference new hierarchical URLs.



Use `next.config.js`, route handlers, or middleware according to actual project constraints. Prefer the simplest maintainable approach.



\---



\## 14. SEO Requirements



Generate metadata entirely from the registries.



\### SmartTools Hub



\- Canonical: `/smarttools`

\- Localized title and description

\- OpenGraph

\- Breadcrumb schema if appropriate



\### Category Pages



\- Canonical: `/smarttools/\[category]`

\- Localized title and description

\- OpenGraph

\- `BreadcrumbList` JSON-LD

\- `CollectionPage` or appropriate schema



\### Tool Pages



\- Canonical: `/smarttools/\[category]/\[tool]`

\- Localized title and description

\- OpenGraph

\- `BreadcrumbList` JSON-LD

\- `SoftwareApplication` or `WebApplication` schema only when appropriate

\- Avoid misleading medical schema or unsupported claims

\- Do not index placeholder pages with no real functionality unless product strategy explicitly requires it



Generate sitemap entries from the registry:



\- `/smarttools`

\- each category

\- each completed and indexable tool

\- optionally active / beta tools if they provide meaningful content



Do not manually hardcode tool URLs in the sitemap.



\---



\## 15. Security, Privacy, and Safety



\### 15.1 Data Handling



\- Store sensitive health data locally by default where possible.

\- Do not persist health data server-side without explicit user consent and a clear privacy model.

\- Do not expose health information in URLs, analytics payloads, logs, or error trackers.

\- Query parameters must never contain identifiable health data.

\- Use schema validation for all user inputs.

\- Escape / sanitize all user-controlled content.

\- Apply rate limits and authentication for costly AI, vision, report generation, or data integration features.



\### 15.2 Health Disclaimer Framework



Tools involving hormones, medication, injections, bloodwork, fertility, pregnancy, insulin, cardiac risk, psychiatric symptoms, or emergencies must show an appropriate disclaimer.



The platform must:



\- State that results are educational and not a diagnosis or replacement for a clinician.

\- Encourage professional review for abnormal results.

\- Provide urgent-care guidance for red-flag symptoms.

\- Avoid asserting safe individualized dosing.

\- Avoid automated emergency diagnosis.

\- Avoid recommendations that could lead to self-harm, dangerous medication use, or unsafe injection practices.



\### 15.3 High-Risk Tool Gate



For high-risk tool categories:



\- Require an acknowledgment before use if appropriate.

\- Keep output educational and safety-oriented.

\- Include sources or evidence citations where claims are made.

\- Do not make product decisions solely from unverified user data.

\- Add clear “seek urgent care” flags for severe symptom scenarios.



\---



\## 16. Dynamic Loading and Performance



Use dynamic imports for completed tool components to reduce initial bundle size.



Requirements:



\- Hub and category pages should remain lightweight.

\- Load a tool engine only on its tool route.

\- Use loading skeletons.

\- Avoid importing all calculators into the hub bundle.

\- Use server components by default.

\- Use client components only where interactivity is required.

\- Lazy-load heavy dependencies:

&#x20; - charts

&#x20; - PDF generation

&#x20; - image processing

&#x20; - AI features

&#x20; - vision analysis

\- Use optimized images and responsive layout.

\- Respect reduced-motion preferences.

\- Ensure accessibility and keyboard navigation.



Do not use arbitrary template-string dynamic imports based on route values. Use an allowlisted loader map.



\---



\## 17. Smart Persistence and Data Interoperability



Build an extensible persistence layer, but do not force server accounts for basic tools.



Recommended design:



\- LocalStorage or IndexedDB for non-sensitive anonymous tool state.

\- Version all stored payloads.

\- Validate restored data.

\- Provide clear “Reset data” controls.

\- Allow explicit export/import by the user.

\- Do not silently share data across unrelated tools.

\- Use a deliberate normalized data model for optional cross-tool handoff.



Examples of safe handoff:



\- Body weight from Progress Tracker to Macro Calculator.

\- Body-fat percentage from FFMI Analyzer to Macro Calculator.

\- Training load from training tools to recovery tools.



Any medical or highly sensitive data handoff should require explicit user action.



\---



\## 18. PDF, Image Export, and Reports



Provide a common optional reporting framework for completed tools where useful.



Requirements:



\- Export only user-selected visible results.

\- Do not automatically store report contents.

\- Clearly label generated reports as educational.

\- Lazy-load PDF and image export dependencies.

\- Use a consistent visual report template.

\- Ensure generated reports do not present medical conclusions as clinical diagnoses.



Tool #100, Comprehensive Report Generator, should eventually aggregate only explicitly consented data from other tools.



\---



\## 19. AI Features Governance



For AI-related tools such as #105, #108, #127, #129–#132, #145–#150:



\- Clearly state AI limitations.

\- Do not fabricate citations, diagnoses, lab interpretations, or scientific claims.

\- Use retrieval-backed citations for scientific evidence features.

\- Show source dates and links where content is sourced.

\- Add human-review escalation for high-risk outcomes.

\- Do not process personal images or health data externally without explicit consent.

\- Provide deletion and retention controls for stored AI memory.

\- Keep AI recommendations explainable and traceable when possible.



Tool #146, AI Safety Gate \& Emergency Protocol, must prioritize escalation to local emergency services or qualified clinicians for urgent conditions. It must not replace emergency care.



\---



\## 20. Accessibility and UX



Meet a high standard of accessibility:



\- Semantic page structure.

\- Keyboard navigation.

\- Focus states.

\- ARIA labels for controls.

\- RTL support for Arabic.

\- Responsive mobile-first layout.

\- Color contrast compliance.

\- Status badges not dependent on color only.

\- Skeleton loading states.

\- Clear empty and error states.

\- Avoid overwhelming users with clinical or alarming messaging; prioritize clarity and next steps.



\---



\## 21. Analytics



Track only privacy-respecting product analytics.



Useful events:



\- SmartTools hub viewed

\- Category viewed

\- Tool opened

\- Search performed

\- Search result selected

\- Tool calculation completed

\- Export triggered

\- Related tool selected

\- Legacy redirect used



Do not log:



\- Raw health inputs

\- Medication names entered by the user

\- Bloodwork values

\- Personal images

\- Free-text health disclosures



\---



\## 22. Testing Requirements



\### Registry Tests



\- Validate all categories.

\- Validate all tool IDs.

\- Validate unique IDs and slugs.

\- Validate category membership.

\- Validate component mapping for completed tools.

\- Validate legacy route uniqueness.

\- Validate canonical URL generation.



\### Route Tests



For each completed tool #1–#30:



\- Registry record exists.

\- Category exists.

\- Canonical route resolves.

\- Incorrect category route returns 404.

\- Component loads.

\- Existing calculator logic works.

\- Canonical metadata exists.

\- Breadcrumb exists.

\- Hub link exists.

\- Category link exists.

\- Legacy redirect works where legacy route exists.

\- Arabic UI works.

\- English UI works.



\### Example Required Routes



/smarttools

/smarttools/nutrition

/smarttools/nutrition/macro



/smarttools/body-composition

/smarttools/body-composition/ffmi-body-fat



/smarttools/pharmacokinetics

/smarttools/pharmacokinetics/accumulation-half-life



/smarttools/hormonal-health

/smarttools/hormonal-health/pct-washout



/smarttools/medical-monitoring

/smarttools/medical-monitoring/bloodwork



/smarttools/injection-formulation

/smarttools/injection-formulation/injection-site-rotator



/smarttools/cycle-management

/smarttools/cycle-management/compound-stack



\### Quality Checks



\- TypeScript typecheck.

\- Lint.

\- Unit tests.

\- Route integration tests.

\- Accessibility checks.

\- Build succeeds.

\- Sitemap validation.

\- Redirect validation.

\- No duplicate canonical URLs.

\- No broken internal links.

\- Lighthouse performance and SEO evaluation.



\---



\## 23. Implementation Sequence



1\. Audit existing SmartTools and real legacy routes.

2\. Identify the existing components for tools #1–#30.

3\. Create category and tool registries.

4\. Create registry integrity validation.

5\. Build shared SmartTools UI components.

6\. Implement `/smarttools` hub.

7\. Implement `/smarttools/\[category]`.

8\. Implement `/smarttools/\[category]/\[tool]`.

9\. Create allowlisted dynamic component loader.

10\. Integrate existing #1–#30 tool components without rewriting their logic.

11\. Add verified legacy redirects.

12\. Add metadata, canonical tags, JSON-LD, and sitemap generation.

13\. Add search and category filtering.

14\. Add related tools logic.

15\. Add safety notices and privacy controls.

16\. Add tests and validate all completed tools.

17\. Register #31–#150 with honest statuses and safe product gating.

18\. Document how to add tool #151 and beyond.



\---



\## 24. Definition of Done



The implementation is complete only when:



\- `/smarttools` is the central SmartTools hub.

\- Every canonical category has a real page at `/smarttools/\[category]`.

\- Every completed tool #1–#30 works at `/smarttools/\[category]/\[tool]`.

\- Existing calculators are reused rather than rebuilt.

\- Invalid category/tool combinations return 404.

\- URLs remain English in Arabic and English UI.

\- Search, filtering, breadcrumbs, related tools, and category navigation work.

\- Metadata, canonical URLs, structured data, and sitemap are registry-generated.

\- Confirmed legacy routes permanently redirect to canonical URLs.

\- Future tool registration requires no new route creation.

\- High-risk medical, drug, injection, fertility, emergency, and compounding concepts have suitable safety, privacy, and review controls.

\- No fake functionality is presented as a finished medical or scientific calculator.

\- All completed tools pass functional, route, localization, SEO, and regression testing.



Final product outcome:



SmartTools becomes a scalable, localized, SEO-ready, performance-focused platform with one reliable source of truth:



SmartTools Hub

&#x20; → Category Pages

&#x20;   → Canonical Tool Pages

&#x20;     → Related Tools, Reports, Safety, and Future AI Capabilities

```

```text

\## 25. Tool Content Model



Each tool must support a richer content model so it can evolve without changing routes or page architecture.



```ts

export interface SmartToolContent {

&#x20; overviewAr?: string;

&#x20; overviewEn?: string;



&#x20; instructionsAr?: string\[];

&#x20; instructionsEn?: string\[];



&#x20; warningsAr?: string\[];

&#x20; warningsEn?: string\[];



&#x20; limitationsAr?: string\[];

&#x20; limitationsEn?: string\[];



&#x20; faqAr?: Array<{

&#x20;   question: string;

&#x20;   answer: string;

&#x20; }>;



&#x20; faqEn?: Array<{

&#x20;   question: string;

&#x20;   answer: string;

&#x20; }>;



&#x20; references?: Array<{

&#x20;   title: string;

&#x20;   url: string;

&#x20;   publisher?: string;

&#x20;   publishedAt?: string;

&#x20; }>;



&#x20; lastReviewedAt?: string;

&#x20; reviewedBy?: string;

}

```



Tool pages may render these sections when available:



\- About this tool

\- How to use it

\- Important limitations

\- Safety notes

\- Frequently asked questions

\- Scientific references

\- Last reviewed date

\- Related tools



Do not render empty sections.



\---



\## 26. Status Lifecycle



Use consistent product statuses:



```ts

type SmartToolStatus =

&#x20; | "completed"

&#x20; | "active"

&#x20; | "beta"

&#x20; | "planned"

&#x20; | "restricted"

&#x20; | "deprecated";

```



Definitions:



\- `completed`: Fully functional, tested, production-ready.

\- `active`: Functional but still receiving major iteration.

\- `beta`: Usable but requires clear beta labeling.

\- `planned`: Listed as future work; no fake calculator output.

\- `restricted`: Requires safety, legal, clinical, or product approval before general access.

\- `deprecated`: Kept temporarily for compatibility, redirects, or migration only.



Rules:



\- Tools #1–#30 are `completed`.

\- Future concepts must be honestly classified.

\- Restricted tools must not present instructions that facilitate unsafe drug preparation, unregulated injectable formulation, or dangerous self-medication.

\- Deprecated pages should redirect to replacements where applicable.



\---



\## 27. Tool Card Specification



Every Tool Card must support:



```text

Tool #

Localized Tool Name

Secondary Language Name (optional)

Short Localized Description

Category Badge

Status Badge

Risk / Disclaimer Badge when applicable

Open Tool CTA

```



Example in Arabic UI:



```text

\#1

حاسبة الماكروز التكيفية

Adaptive Macro Calculator



تحسب السعرات والبروتين والكربوهيدرات والدهون بناءً على هدفك وبياناتك الجسدية.



التغذية والماكروز

مكتملة



فتح الأداة

```



Requirements:



\- Entire card may be clickable, but CTA remains accessible.

\- Tool number is visible.

\- Planned and restricted tools cannot imitate active calculators.

\- Completed tools link directly to canonical pages.

\- Cards are keyboard accessible.

\- Cards must not cause layout shift.



\---



\## 28. Category Card Specification



Each category card must include:



```text

Localized Category Name

Secondary Language Name where useful

Localized Description

Tool Count

Explore Category CTA

```



Example:



```text

Nutrition \& Macros

التغذية والماكروز



4 أدوات مكتملة

استكشف الفئة →

```



Category cards link only to:



```text

/smarttools/\[category]

```



\---



\## 29. Breadcrumb Specification



\### Category Breadcrumb



```text

Home

>

SmartTools

>

Nutrition \& Macros

```



\### Tool Breadcrumb



```text

Home

>

SmartTools

>

Nutrition \& Macros

>

Adaptive Macro Calculator

```



Requirements:



\- Every breadcrumb node except the current page is clickable.

\- Breadcrumb labels are localized.

\- URLs remain English-slug canonical URLs.

\- Add `BreadcrumbList` JSON-LD.

\- RTL layout must render naturally in Arabic without changing the URL structure.



\---



\## 30. Metadata Generation Pattern



Create reusable metadata helpers:



```ts

export function getSmartToolsHubMetadata(locale: Locale): Metadata;



export function getCategoryMetadata(

&#x20; category: SmartToolCategoryDefinition,

&#x20; locale: Locale

): Metadata;



export function getToolMetadata(

&#x20; tool: SmartToolDefinition,

&#x20; category: SmartToolCategoryDefinition,

&#x20; locale: Locale

): Metadata;

```



Tool metadata should include:



```text

Title:

\[Tool Name] | Mr. X SmartTools



Description:

Localized tool description plus a concise educational qualifier where required.



Canonical:

https://mrxsteroid.com/smarttools/\[category]/\[tool]



OpenGraph:

Localized title, description, canonical URL, and image when available.

```



Never claim medical certification, guaranteed outcomes, treatment, diagnosis, or safety guarantees unless formally substantiated.



\---



\## 31. Sitemap Generation Pattern



Generate sitemap URLs from registry data.



```ts

const indexableTools = smartTools.filter(

&#x20; (tool) =>

&#x20;   tool.indexable \&\&

&#x20;   \["completed", "active", "beta"].includes(tool.status)

);

```



Include:



```text

/smarttools

/smarttools/\[category]

/smarttools/\[category]/\[tool]

```



Rules:



\- Do not include duplicate legacy routes.

\- Do not include non-functional planned pages unless they have meaningful indexable content.

\- Do not include restricted tools that should not be publicly discoverable.

\- Ensure sitemap URLs match canonical URLs exactly.

\- Include accurate `lastModified` values only when trustworthy.



\---



\## 32. Component Loader Pattern



Use a static component map.



```ts

import dynamic from "next/dynamic";



export const smartToolComponentLoaders = {

&#x20; adaptiveMacro: dynamic(

&#x20;   () => import("@/components/tools/AdaptiveMacroCalculator"),

&#x20;   { ssr: false }

&#x20; ),



&#x20; ffmiBodyFat: dynamic(

&#x20;   () => import("@/components/tools/FfmiBodyFatAnalyzer"),

&#x20;   { ssr: false }

&#x20; ),



&#x20; accumulationHalfLife: dynamic(

&#x20;   () => import("@/components/tools/AccumulationHalfLifeSimulator"),

&#x20;   { ssr: false }

&#x20; ),

} as const;

```



Rules:



\- Use `ssr: false` only when a calculator truly needs browser APIs.

\- Prefer server rendering for tool information, title, SEO, breadcrumbs, safety notices, and shell content.

\- Browser-only calculator logic should be isolated inside client components.

\- Every completed tool must resolve to a valid loader.

\- If a completed component cannot load, show a clear recoverable error state and log a non-sensitive diagnostic event.



\---



\## 33. Error Handling



Implement clear states for:



\- Invalid category.

\- Invalid tool.

\- Tool under wrong category.

\- Missing component mapping.

\- Failed dynamic component loading.

\- Unsupported locale.

\- Empty category.

\- Search with no results.

\- Restricted tool access.

\- Local persistence corruption.

\- Report export failure.

\- External AI or data provider failure.



Requirements:



\- Invalid category/tool relationship must return `notFound()`.

\- Do not expose internal stack traces to users.

\- Do not expose private implementation details.

\- Give users a safe next action:

&#x20; - Return to SmartTools.

&#x20; - Explore category.

&#x20; - Retry.

&#x20; - Clear saved tool data.

&#x20; - Contact support where appropriate.



\---



\## 34. SmartTools Navigation Model



Add SmartTools navigation without making the main site navigation crowded.



Recommended entry points:



\- Main navigation item: SmartTools.

\- Footer SmartTools link.

\- SmartTools layout sub-navigation:

&#x20; - All Tools

&#x20; - Categories

&#x20; - Saved Tools, if this feature exists

&#x20; - Reports, if this feature exists

\- Tool page navigation:

&#x20; - Back to category

&#x20; - All SmartTools

&#x20; - Previous / Next tool

&#x20; - Related tools



Do not create navigation based on hidden, planned, or restricted tools unless product requirements explicitly allow it.



\---



\## 35. Saved Tools and Favorites



Optional future capability:



\- Allow users to save favorite tools locally without requiring authentication.

\- If accounts exist, allow opt-in sync.

\- Never make account creation mandatory for simple calculator use.

\- Saved items should store only tool identifiers, not medical values.

\- Provide remove and clear controls.

\- Respect privacy preferences.



Suggested local schema:



```ts

interface SavedSmartTool {

&#x20; toolId: number;

&#x20; savedAt: string;

}

```



\---



\## 36. Data Export and Import



For tools that support persistent user inputs:



\- Allow users to export their own data as JSON or CSV where appropriate.

\- Validate imported files before use.

\- Never execute imported code or trust imported metadata.

\- Show clear overwrite confirmation before replacing saved local data.

\- Include schema version numbers.

\- Provide data deletion controls.



```ts

interface PersistedToolState<T> {

&#x20; version: number;

&#x20; toolId: number;

&#x20; savedAt: string;

&#x20; data: T;

}

```



\---



\## 37. API Boundaries



If APIs are required for AI, health integrations, reports, images, or evidence retrieval:



\- Use validated request schemas.

\- Authenticate expensive endpoints.

\- Rate-limit abuse-prone endpoints.

\- Do not return secrets to the browser.

\- Do not trust client-provided role, entitlement, or safety flags.

\- Validate authorization server-side.

\- Separate public metadata endpoints from private user-data endpoints.

\- Log only minimal operational metadata.

\- Provide explicit user consent before transmitting health-related data to external providers.



\---



\## 38. Evidence and Citation System



For evidence-based content tools, especially #115 and #147:



\- Store references in a normalized source format.

\- Show title, source, publication date, and direct URL where possible.

\- Distinguish:

&#x20; - Human clinical evidence

&#x20; - Animal evidence

&#x20; - In-vitro evidence

&#x20; - Observational evidence

&#x20; - Expert opinion

&#x20; - Insufficient evidence

\- Show publication dates.

\- Avoid overstating correlations as causation.

\- Do not fabricate sources.

\- Include a “last reviewed” date.

\- Make clear that scientific evidence evolves.



\---



\## 39. AI Vision and Image Privacy



For tools such as #108, #110, and #132:



\- Obtain explicit consent before image or video upload.

\- Explain whether processing occurs locally or through an external provider.

\- Do not retain uploads by default.

\- Use temporary storage with automatic deletion if server processing is required.

\- Do not use user media for model training without separate explicit opt-in consent.

\- Do not infer sensitive medical conditions from images.

\- Do not present body-composition vision results as clinical measurements.

\- Include error margins and limitations.

\- Provide a manual alternative workflow where feasible.



\---



\## 40. Safety Red Flags Framework



Tools that assess symptoms, bloodwork, cardiovascular risk, pregnancy, fertility, insulin, mental health, or severe side effects must support a configurable red-flag framework.



Example structure:



```ts

interface SafetyFlag {

&#x20; id: string;

&#x20; severity: "info" | "caution" | "urgent";

&#x20; titleAr: string;

&#x20; titleEn: string;

&#x20; messageAr: string;

&#x20; messageEn: string;

&#x20; actionAr: string;

&#x20; actionEn: string;

}

```



For `urgent` results:



\- Use clear, calm wording.

\- Tell the user to seek urgent local medical care or emergency services when appropriate.

\- Do not attempt to diagnose.

\- Do not give dangerous self-treatment instructions.

\- Do not use fear-based language.

\- Record no raw health values in analytics.



\---



\## 41. Future Tool Creation Contract



Every future tool must follow this contract:



1\. Add one typed tool record in the central registry.

2\. Assign a canonical English slug.

3\. Assign one primary category.

4\. Add Arabic and English names.

5\. Add Arabic and English descriptions.

6\. Select an honest status.

7\. Set risk level.

8\. Add tags and search keywords.

9\. Add component mapping only when the component exists.

10\. Add explicit related tools when appropriate.

11\. Add safety notices for health-sensitive functionality.

12\. Add sources and limitations when scientific claims are made.

13\. Add tests.

14\. Confirm metadata and sitemap behavior.



No manual route creation is permitted for ordinary new tools.



\---



\## 42. Proposed Tool Registry Seed Format



```ts

export const smartTools: SmartToolDefinition\[] = \[

&#x20; {

&#x20;   id: 1,

&#x20;   slug: "macro",

&#x20;   category: "nutrition",

&#x20;   nameAr: "حاسبة الماكروز التكيفية",

&#x20;   nameEn: "Adaptive Macro Calculator",

&#x20;   descriptionAr:

&#x20;     "تحسب السعرات والبروتين والكربوهيدرات والدهون بناءً على هدفك وبياناتك الجسدية.",

&#x20;   descriptionEn:

&#x20;     "Calculates calories, protein, carbohydrates, and fats based on your goal and body data.",

&#x20;   status: "completed",

&#x20;   riskLevel: "general",

&#x20;   componentKey: "adaptiveMacro",

&#x20;   tags: \["nutrition", "macros", "calories", "protein"],

&#x20;   legacyPaths: \["/macro"],

&#x20;   relatedToolIds: \[12, 13, 11, 97],

&#x20;   searchable: true,

&#x20;   indexable: true,

&#x20; },



&#x20; {

&#x20;   id: 2,

&#x20;   slug: "ffmi-body-fat",

&#x20;   category: "body-composition",

&#x20;   nameAr: "محلل الكتلة الخالية من الدهون ونسبة الدهون",

&#x20;   nameEn: "FFMI \& Body Fat Analyzer",

&#x20;   descriptionAr:

&#x20;     "يحسب مؤشر الكتلة الخالية من الدهون ونسبة الدهون لتقييم تكوين الجسم والتقدم.",

&#x20;   descriptionEn:

&#x20;     "Calculates fat-free mass index and body-fat estimates to assess body composition and progress.",

&#x20;   status: "completed",

&#x20;   riskLevel: "wellness",

&#x20;   componentKey: "ffmiBodyFat",

&#x20;   tags: \["ffmi", "body fat", "lean mass", "physique"],

&#x20;   relatedToolIds: \[1, 11, 20, 136],

&#x20;   searchable: true,

&#x20;   indexable: true,

&#x20; },

];

```



\---



\## 43. Migration and Compatibility Requirements



Before changing routes:



1\. Audit all existing links in:

&#x20;  - Source code

&#x20;  - Navigation

&#x20;  - Footer

&#x20;  - Blog content

&#x20;  - Sitemap

&#x20;  - Database content

&#x20;  - Marketing pages

&#x20;  - Social links where available



2\. Replace internal links with canonical URLs.



3\. Keep verified legacy redirects active.



4\. Monitor redirects and 404s after deployment.



5\. Do not break external links.



6\. Do not remove an old route until its replacement and redirect have been tested.



7\. Add automated redirect tests for every verified legacy route.



\---



\## 44. Deployment Checklist



Before production deployment:



\- Registry validation passes.

\- Typecheck passes.

\- Lint passes.

\- Production build passes.

\- Completed tools #1–#30 load successfully.

\- Canonical URLs work.

\- Incorrect category/tool combinations return 404.

\- Legacy redirects work.

\- Metadata renders correctly.

\- Sitemap contains canonical URLs.

\- Arabic RTL layout is verified.

\- English UI is verified.

\- Mobile layout is verified.

\- Accessibility checks pass.

\- Sensitive data is not emitted to logs or analytics.

\- Dynamic imports do not break existing tools.

\- No unauthorized medical, pharmaceutical, or compounding instructions are introduced.



After deployment:



\- Monitor 404s.

\- Monitor redirect usage.

\- Monitor client errors.

\- Monitor performance metrics.

\- Review search terms without collecting sensitive inputs.

\- Validate indexing and canonical behavior in search tooling.

\- Review safety feedback and error reports.



\---



\## 45. Final Deliverables



Deliver:



1\. Central category registry.

2\. Central tool registry covering #1–#150.

3\. Registry validation utility and tests.

4\. SmartTools hub page.

5\. Dynamic category page.

6\. Dynamic tool page.

7\. Reusable card, search, breadcrumb, related-tools, and safety components.

8\. Allowlisted dynamic tool component loader.

9\. Existing tool #1–#30 integration without calculator rewrites.

10\. Verified legacy redirects.

11\. Registry-generated SEO metadata.

12\. Registry-generated sitemap.

13\. JSON-LD breadcrumbs and appropriate tool schemas.

14\. Arabic and English localized UI.

15\. Accessibility and responsive UI support.

16\. Safety, privacy, and data-handling controls.

17\. Documentation explaining how to add #151+.

18\. Test coverage and acceptance report for #1–#30.



\---



\## 46. Final Acceptance Standard



The finished system must prove the following:



```text

One registry controls the platform.

One canonical URL exists per tool.

One valid category owns each tool.

No category/tool mismatch can render.

Existing completed calculators remain functional.

Legacy routes are safely redirected only when verified.

URLs remain English regardless of display language.

Arabic and English interfaces are localized.

SEO and sitemap entries are generated automatically.

Future tools can be added without creating routes manually.

Sensitive and high-risk health functionality has safety controls.

The system is fast, accessible, maintainable, and scalable.

```



The desired final architecture is:



```text

SmartTools

│

├── Nutrition \& Macros

│   ├── Adaptive Macro Calculator

│   ├── Dynamic Calorie Adjuster

│   ├── Macro Optimizer

│   ├── Water Retention Calculator

│   └── Future nutrition intelligence tools

│

├── Body Composition

│   ├── FFMI \& Body Fat Analyzer

│   ├── Genetic Potential Calculator

│   └── Future physique and competition tools

│

├── Pharmacokinetics

│   ├── Accumulation \& Half-Life Simulator

│   ├── Multi-Compound Half-Life Calculator

│   ├── Compound Half-Life Stacker

│   └── Ester Conversion Calculator

│

├── Hormonal Health

│   ├── PCT Timing \& Washout Engine

│   ├── HCG \& SERM Generator

│   ├── Estrogen \& Prolactin Engine

│   ├── SHBG Modulator

│   ├── HPTA Recovery Monitor

│   ├── Peptide Protocol Planner

│   └── TRT Optimization Engine

│

├── Medical Monitoring

│   ├── Bloodwork Analyzer

│   ├── Side Effect Tracker

│   ├── Post-Cycle Bloodwork Interpreter

│   ├── Drug Interaction Checker

│   └── Early Warning System

│

├── Injection \& Formulation

│   ├── Injection Site Rotator

│   ├── Injection Volume Calculator

│   └── Injection Pain Minimizer

│

├── Cycle \& Stack Management

│   ├── Compound Stack Builder

│   ├── Oral Cycle Planner

│   ├── Compound Stacking Synergy

│   └── Cycle Cost Calculator

│

├── Training \& Recovery

│   ├── Progress Tracker

│   ├── Recovery Metrics

│   ├── Adaptive Programming

│   └── Performance Intelligence

│

├── Reproductive \& Wellbeing

│   ├── Fertility

│   ├── Female Health

│   ├── Pregnancy Safety Information

│   └── Mental Wellbeing

│

└── AI \& Platform

&#x20;   ├── Comprehensive Reports

&#x20;   ├── Health Data Fusion

&#x20;   ├── Evidence Explorer

&#x20;   ├── Personal Memory

&#x20;   ├── Safety Gate

&#x20;   └── Mr. X AI Command Center

```



Build the platform deliberately. Preserve what already works, avoid duplicate implementations, make the registry the authority, and ensure future expansion remains safe, accurate, maintainable, and fast.

```

هذه التكملة تبدأ من البند 47، وتُصحّح التعارضات في الأجزاء السابقة، وتُكمل تصنيف الأدوات وخطة التنفيذ والتحقق. أضفها إلى نهاية البرومبت:



````text

\## 47. قواعد حسم التعارضات في هذا المستند



هذا القسم وما يليه يُكمل الأقسام السابقة ويُصحّح التعارضات فيها.



ترتيب المرجعية عند التنفيذ:



1\. متطلبات المستخدم الصريحة، خصوصًا الحفاظ على الأدوات #1–#30 ومساراتها المعتمدة.

2\. حقائق المستودع التي يتم التحقق منها فعليًا.

3\. التصحيحات المحددة في هذا القسم وما يليه.

4\. الإرشادات والأمثلة السابقة.



التصحيحات الإلزامية:



\- لا تستخدم قوائم التصنيف السابقة التي تضع الأداة نفسها في أكثر من فئة أساسية.

\- استخدم جدول التصنيف الحاسم في القسم 50.

\- لا تغيّر الأسماء العربية أو الإنجليزية المعتمدة للأدوات #1–#30 اعتمادًا على أمثلة مختلفة وردت سابقًا.

\- أمثلة legacyPaths السابقة أمثلة توضيحية وليست دليلًا على وجود تلك المسارات.

\- لا تعتمد أي legacy path قبل التحقق منه في المشروع.

\- لا تُجبر المشروع على Next.js 14 أو تُحدّث إصداره لمجرد ورود ذلك في المستند.

\- استخدم إصدار المشروع الحالي وأنماطه المدعومة.

\- لا تستخدم ssr: false لجميع الأدوات بصورة افتراضية.

\- لا تعد بتحقيق Lighthouse 100 أو قابلية توسع غير محدودة.

\- لا تعتبر التسجيل في الكتالوج إثباتًا على أن أداة مستقبلية تعمل.

\- لا تعتبر القيود الخاصة بحماية نطاق المشروع عائقًا يجب إلغاؤه.

\- حافظ على حماية المنطق الحسابي، مع السماح بتطوير طبقة العرض والتوجيه والتكامل دون تغيير النتائج.





\## 48. نطاق التنفيذ الحالي مقابل خارطة الطريق



قسّم العمل إلى مستويين واضحين.



\### A. التنفيذ المطلوب الآن



\- مراجعة المشروع الحالي.

\- إنشاء مصدر موحد لتعريف الفئات والأدوات.

\- تسجيل الأدوات #1–#150.

\- ربط الأدوات الموجودة #1–#30 بمكوناتها الفعلية.

\- تطوير Hub وCategory Pages وTool Pages.

\- إضافة البحث والتصفح والروابط ذات الصلة.

\- إضافة metadata وcanonical وsitemap.

\- إنشاء التحويلات المثبتة للروابط القديمة.

\- اختبار الأدوات الموجودة ومنع التراجع الوظيفي.

\- توثيق إضافة الأدوات المستقبلية.



\### B. قدرات مستقبلية تُجهّز لها العقود فقط



\- الحسابات الجديدة للأدوات #31–#150.

\- تحليل الصور والفيديو.

\- الربط بالأجهزة القابلة للارتداء.

\- الذاكرة الشخصية.

\- التقارير متعددة الأدوات.

\- المزامنة بين الأجهزة.

\- مساعد الذكاء الاصطناعي.

\- المدفوعات الجديدة أو الاشتراكات الجديدة.



لا تنفذ هذه القدرات تلقائيًا ضمن إعادة الهيكلة.



أنشئ نقاط تمديد وعقودًا بسيطة عند الحاجة، دون إضافة خدمات أو قواعد بيانات أو dependencies لا تستخدمها المرحلة الحالية.





\## 49. الفصل بين حالة التطوير وحالة النشر



استخدام status واحد للتطوير والنشر والوصول يخلق تعارضات.



استبدل الأنواع السابقة بنموذج يفصل هذه المفاهيم:



```ts

type DevelopmentStatus =

&#x20; | "planned"

&#x20; | "in-progress"

&#x20; | "beta"

&#x20; | "completed"

&#x20; | "deprecated";



type PublicationStatus =

&#x20; | "draft"

&#x20; | "listed"

&#x20; | "published"

&#x20; | "archived";



type AvailabilityStatus =

&#x20; | "available"

&#x20; | "unavailable"

&#x20; | "maintenance";



type AccessPolicy =

&#x20; | "public"

&#x20; | "authenticated"

&#x20; | "existing-entitlement";



type ReviewStatus =

&#x20; | "not-required"

&#x20; | "pending"

&#x20; | "approved"

&#x20; | "needs-update";

```



معنى الحالات:



\- developmentStatus: مدى اكتمال تطوير الأداة.

\- publicationStatus: هل تظهر في الكتالوج وهل لها صفحة عامة؟

\- availabilityStatus: هل يمكن تشغيلها الآن؟

\- accessPolicy: تطبيق سياسة الوصول الموجودة أصلًا.

\- reviewStatus: حالة مراجعة المحتوى عند الحاجة.



القواعد:



\- الأدوات #1–#30 تحتفظ بـ developmentStatus = completed.

\- يجب التحقق من مكوناتها وتشغيلها قبل اعتماد جاهزية النشر.

\- إذا تعذر العثور على مكون أداة مكتملة، سجّل integration blocker.

\- لا تنشئ calculator بديلًا ولا تعرضها كأداة تعمل.

\- الأدوات #31–#100 موصوفة من صاحب المشروع بأنها قيد التنفيذ؛ احتفظ بهذا الوصف كحالة معلنة، مع فصل التحقق التقني عنها.

\- الأدوات #101–#150 تُسجّل planned ما لم يوجد تنفيذ مثبت.

\- لا تنشئ وظائف حقيقية أو نتائج وهمية لأداة غير مكتملة.



يمكن حفظ حالة المراجعة التقنية في تقرير منفصل:



```ts

type VerificationStatus =

&#x20; | "not-checked"

&#x20; | "component-found"

&#x20; | "integration-verified"

&#x20; | "blocked";

```



هذا التقرير ليس Registry ثانيًا لتعريف الأدوات.





\## 50. التصنيف الحاسم لجميع الأدوات والمسارات المستقبلية



لكل أداة فئة أساسية واحدة فقط.



جدول الأدوات #1–#30 في القسم السابق يظل ثابتًا.



الجدول التالي هو التوزيع المعتمد للأدوات #31–#150 ضمن هذا المشروع.



المسار الكامل يُشتق دائمًا من:



/smarttools/{category}/{slug}



قبل نشر slug جديد لأول مرة، افحص المستودع للتأكد من عدم وجود عنوان معتمد سابقًا لنفس الأداة. عند العثور على تعارض موثق، سجله وعالج الترحيل دون كسر الروابط.



| ID | Category | Tool Slug |

|---:|---|---|

| 31 | cycle-management | cycle-length-optimizer |

| 32 | hormonal-health | advanced-pct-planner |

| 33 | medical-monitoring | bloodwork-trends |

| 34 | pharmacokinetics | compound-clearance |

| 35 | hormonal-health | hormone-conversion |

| 36 | injection-formulation | injection-schedule |

| 37 | medical-monitoring | side-effect-probability |

| 38 | cycle-management | stack-compatibility |

| 39 | medical-monitoring | liver-enzyme-tracker |

| 40 | medical-monitoring | lipid-profile |

| 41 | medical-monitoring | hematocrit-monitor |

| 42 | hormonal-health | estrogen-management |

| 43 | hormonal-health | prolactin-management |

| 44 | medical-monitoring | dht-side-effects |

| 45 | cycle-management | cycle-break-planner |

| 46 | hormonal-health | trt-lifetime |

| 47 | reproductive-wellbeing | fertility-preservation |

| 48 | medical-monitoring | cardiovascular-risk |

| 49 | medical-monitoring |
- No fake functionality is presented as a finished medical or scientific calculation tool.

\- Build validation passes (`npm run validate-tools`) without errors or duplicate route warnings.

\- `sitemap.xml` dynamically reflects all indexable completed tools.



\---



\## 25. ONBOARDING GUIDE FOR FUTURE TOOLS (#151+)



To add tool #151 or any future tool to the SmartTools platform, developers must follow strictly these 3 steps without creating new route files:



1\. \*\*Register the Tool in `lib/tools/index.ts`\*\*:

&#x20;  Add the new definition to the central registry array with a unique `id`, `slug`, `category`, localized names/descriptions, `status`, and `riskLevel`.



2\. \*\*Implement/Map Component in `lib/tools/loaders.ts`\*\*:

&#x20;  Create the UI component in `components/tools/` and add its dynamic loader mapping in `toolLoaders`:

&#x20;  ```ts

&#x20;  'new-tool-slug': dynamic(() => import('@/components/tools/NewToolComponent')),

