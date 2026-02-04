# خطة إعادة هيكلة وتحديث واجهة المستخدم - Mr. X Steroid

**التاريخ:** 04 فبراير 2026
**الحالة:** قيد التنفيذ

## 1. الأهداف الرئيسية

تحويل كافة مكونات الموقع (Components & Pages) من التصميم العمودي (Vertical Layout) إلى التصميم الأفقي المدمج (Compact Horizontal Layout)، مع التركيز على:

- **توحيد الهوية البصرية:** أيقونة بجانب العنوان (Icon next to title).
- **دعم ثنائي الاتجاه (Bi-directional Support):** ضبط المحاذاة تلقائياً بناءً على اللغة (RTL/LTR).
- **الضغط والرشاقة (Optimization):** تقليل المساحات الداخلية (Padding) والهوامش (Margins) بنسبة 30%.
- **تحسين التفاعلية:** إضافة تأثيرات Hover Scale و Neon Glow.

---

## 2. المسارات والملفات المستهدفة

### أ. الرأس (Header)

- **المسار:** `src/components/layout/Header.tsx`
- **التعديلات:**
  - ضغط ارتفاع الهيدر.
  - تقليل المسافات بين عناصر القائمة.
  - تحسين قوائم الموبايل (Mobile Menu) لتكون أكثر إحكاماً.

### ب. صفحات التسجيل والدخول (Auth Pages)

- **المسارات:**
  - `src/pages/SignupPage.tsx`
  - `src/pages/LoginPage.tsx`
- **التعديلات:**
  - تحويل كروت النماذج (Forms) لتكون أقل عرضاً وأكثر تركيزاً.
  - دمج أيقونات الحقول (Input Icons) بشكل مدمج.
  - تقليل الهوامش العلوية والسفلية.

### ج. مكونات الأدوات (Tools Components)

- **المسارات:**
  - `src/components/tools/SteroidReadinessQuiz.tsx` (تم البدء به، استكمال التدقيق)
  - `src/components/tools/BodyFatCalculator.tsx`
  - `src/components/tools/MacroCalculator.tsx`
  - `src/components/tools/GeneticPotentialCalculator.tsx`
  - `src/components/tools/SmartLabReference.tsx`
- **التعديلات:**
  - تحويل كروت النتائج والخيارات إلى الشكل الأفقي.
  - تصغير أزرار الإدخال والاختيار.

### د. المكونات التسويقية (Marketing - مراجعة نهائية)

- **المسارات:**
  - `src/components/marketing/PricingSection.tsx` (مراجعة توافق الكروت مع النمط الأفقي إذا أمكن، أو ضغط العمودي أكثر).
  - `src/components/marketing/FAQ.tsx` (تحسين الـ Accordion ليكون أقل ارتفاعاً).

---

## 3. خطوات التنفيذ (Implementation Steps)

### المرحلة الأولى: الهيدر والقوائم (Header & Navigation)

- [ ] **Task 1.1:** تعديل `Header.tsx` لتقليل الارتفاع (Padding Y).
- [ ] **Task 1.2:** ضبط المسافات بين الروابط (Gap) وتصغير حجم الخط قليلاً إذا لزم الأمر.
- [ ] **Task 1.3:** التحقق من سلوك القائمة في الموبايل وضغط العناصر.

### المرحلة الثانية: صفحات المصادقة (Auth Pages)

- [ ] **Task 2.1:** إعادة تصميم `LoginPage.tsx` لدمج العنوان والأيقونة أفقياً.
- [ ] **Task 2.2:** ضغط حقول الإدخال (Inputs) وتقليل الـ Padding في `LoginPage.tsx`.
- [ ] **Task 2.3:** تطبيق نفس التغييرات على `SignupPage.tsx`.
- [ ] **Task 2.4:** إضافة تأثيرات الـ Glow الخفيفة على حاوية النموذج (Form Container).

### المرحلة الثالثة: الأدوات التفاعلية (Tools)

- [ ] **Task 3.1:** تحديث `BodyFatCalculator.tsx` - تحويل خيارات الجنس والنشاط إلى كروت أفقية صغيرة.
- [ ] **Task 3.2:** تحديث `MacroCalculator.tsx` - ضغط بطاقات النتائج (Macros Cards).
- [ ] **Task 3.3:** تحديث `GeneticPotentialCalculator.tsx` - تحسين عرض النتائج.
- [ ] **Task 3.4:** تحديث `SmartLabReference.tsx` - تحويل قائمة الفحوصات إلى نمط القائمة المضغوطة.

### المرحلة الرابعة: المراجعة والتحسين (Review & Polish)

- [ ] **Task 4.1:** التأكد من عمل `rtl:space-x-reverse` بشكل صحيح في جميع المكونات المعدلة.
- [ ] **Task 4.2:** مراجعة جميع ملفات المشروع بحثاً عن أي `p-10` أو `py-24` وتقليصها إلى `p-6` أو `py-12` حيثما أمكن.
- [ ] **Task 4.3:** اختبار الـ Build للتأكد من عدم وجود أخطاء TypeScript.

---

## 4. معايير القبول (Acceptance Criteria)

1. جميع الكروت الرئيسية تظهر بتصميم أفقي (Icon | Title).
2. لا يوجد Scroll أفقي غير مقصود في أي صفحة.
3. التبديل بين العربية والإنجليزية يعكس اتجاه الأيقونات والنصوص بشكل سليم.
4. الـ Build يمر بنجاح على Vercel (`npm run build`).

---

## 5. تعليمات Git

- إنشاء فرع جديد لكل مجموعة تعديلات إذا لزم الأمر، أو الالتزام بـ `main` مع رسائل Commit واضحة.
- رسالة الـ Commit يجب أن تتبع النمط: `UI Update: Compact layout for [Component Name]`
