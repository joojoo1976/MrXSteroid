# PROMPT ARCHITECTURE DESIGN v7 - 252 Tools - معمارية الفهرس والتنقل المطلوبة

## 1. صفحة الفهرس الشاملة (smarttools) - /smarttools

التجميع والتقسيم: عرض كافة الأدوات مقسمة حسب التصنيف/الفئة (14 فئة SEO)
- كل فئة لها id, nameAr, nameEn, seoKeywords, count, icon, description
- <section id="category-{slug}">

روابط الأدوات الفردية: كل أداة رابط لصفحتها المستقلة /tools/{tool-slug}
- صفحة الأداة تتضمن المكونات الموحدة للـ Prompt Genius:
  Header, Footer, Breadcrumb, Previous/Next Tool (1-252), Category Badge, Super Intelligence Layer, Dynamic Results (7 قواعد), Cross-Tool Widget, SEO Meta

## 2. منطق التفاعل والتنقل (Navigation Logic)

قائمة الفئات أعلى الصفحة: 14 فئة مرتبة sticky
- <a href="#category-{slug}" data-category="{slug}">

النقر المفرد (Single Click): Smooth Scroll داخل نفس الصفحة
- document.getElementById(`category-${slug}`)?.scrollIntoView({behavior:'smooth'});

النقر المزدوج (Double Click): Category Page مستقلة
- /categories/{slug} تعرض حصرياً أدوات تلك الفئة
- router.push(`/categories/${slug}`);

التفريق 300ms threshold:
let clickTimeout;
const handleCategoryClick=(e,slug)=>{
  e.preventDefault();
  if(clickTimeout){clearTimeout(clickTimeout); clickTimeout=null; router.push('/categories/'+slug);}
  else{clickTimeout=setTimeout(()=>{document.getElementById('category-'+slug)?.scrollIntoView({behavior:'smooth'}); window.history.pushState(null,'','#category-'+slug); clickTimeout=null;},300);}
};

Previous/Next Tool: /tools/{slug}
Previous/Next Category: /categories/{slug}
Back to Index: /smarttools#category-{slug}
