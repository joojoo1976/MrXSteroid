# MASTER PROMPT v7 - 252 أداة - التطوير العبقري + معمارية الفهرس المطلوبة

## الترقية: v6 (150) -> v7 (252)

### معمارية هيكل البرومبت (Prompt Architecture Design) - حسب طلبك:

#### 1. صفحة الفهرس الشاملة (smarttools) - /smarttools

التجميع والتقسيم: عرض كافة الأدوات مقسمة حسب التصنيف/الفئة (14 فئة SEO)
- كل فئة: id, nameAr, nameEn, seoKeywords, count, icon, description
- كل قسم: <section id="category-{slug}">

روابط الأدوات الفردية: كل أداة توفر رابطاً لصفحتها المستقلة /tools/{tool-slug}
- صفحة الأداة تتضمن المكونات الموحدة للـ Prompt Genius:
  - Header (logo + search + lang + units)
  - Footer
  - Breadcrumb: الرئيسية > الفئة > الأداة
  - Previous/Next Tool: تنقل 1-252
  - Category Badge
  - Super Intelligence Layer (confidence, reasoning, scenarios, whatIf, warnings, nextActions, crossToolLinks, adaptiveWeights)
  - Dynamic Results (7 قواعد ذهبية)
  - Cross-Tool Widget + Freshness
  - SEO Meta

#### 2. منطق التفاعل والتنقل (Navigation Logic)

قائمة الفئات أعلى الصفحة: تظهر جميع الفئات 14 في البداية مرتبة
- sticky nav
- كل فئة: <a href="#category-{slug}" data-category="{slug}">

النقر المفرد (Single Click): ينقل داخل نفس الصفحة سفلياً إلى قسم الفئة (Smooth Scroll / Anchor Link)
```ts
const handleSingleClick = (slug) => {
  document.getElementById(`category-${slug}`)?.scrollIntoView({behavior:'smooth'});
  window.history.pushState(null,'',`#category-${slug}`);
}
```

النقر المزدوج (Double Click): يوجه إلى صفحة مخصصة مستقلة لتلك الفئة (Category Page)
- /categories/{slug} تعرض حصرياً أدوات تلك الفئة
```ts
const handleDoubleClick = (slug) => router.push(`/categories/${slug}`);
```

التفريق:
```ts
let clickTimeout;
const handleCategoryClick = (e, slug) => {
  e.preventDefault();
  if(clickTimeout){ clearTimeout(clickTimeout); clickTimeout=null; router.push(`/categories/${slug}`); }
  else { clickTimeout=setTimeout(()=>{ document.getElementById(`category-${slug}`)?.scrollIntoView({behavior:'smooth'}); window.history.pushState(null,'',`#category-${slug}`); clickTimeout=null; },300); }
};
```

Previous/Next Tool: في صفحة الأداة /tools/{slug}
Previous/Next Category: في صفحة الفئة /categories/{slug}
Back to Index: يعود لـ /smarttools#category-{slug}

## Brain Types v7 (14 فئة):
- body-composition: diagnostic+comparative, freshness 7d
- nutrition: generative+adaptive, 1d
- training: predictive+generative, 2d
- strength: diagnostic+predictive, 14d
- physique: comparative+aesthetic, 7d
- health: diagnostic+safety, 30-90d
- steroid-pharmacokinetics: predictive+safety, cycle-based
- pct-fertility-protection: diagnostic+safety, daily
- organ-protection: diagnostic+safety, 30d
- female-bodybuilding: diagnostic+safety, menstrual-cycle
- ai-nutrition-vision: generative, daily
- contest-prep: predictive+comparative, peak-week
- homebrew-chemistry: generative+safety, on-prep
- ai-behavior: predictive+generative, 24h

Event Bus: mrx_tool_result_updated لـ 252 أداة
