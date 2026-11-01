
# خطوات العمل النهائية - 3 خطوات فقط - بسيطة جداً
# امسح كل اللخبطة السابقة وابدأ من هنا

## الوضع الحالي الصحيح (بعد تصحيحك):

E:\temp\v6-150-genius\  → إطار 150 أداة + DB Schema + Registry
E:\temp\v5-genius\      → كود 11 أداة مفصل مع ML + Vision + Voice
E:\MrXSteroid-main\      → مشروعك الأصلي

## 3 خطوات فقط - لا يوجد غيرهم:

### الخطوة 1: افتح opencode + انسخ برومبت واحد فقط (دقيقة)

```bash
cd E:\MrXSteroid-main
opencode
# اختار: /model → nvidia/nemotron-3-ultra-free
```

انسخ والصق البرومبت الوحيد من ملف:
FINAL-SINGLE-PROMPT-FOR-OPENCODE.txt

هذا هو البرومبت الوحيد - لا يوجد غيره.

### الخطوة 2: انتظر تقرير Audit من opencode (5 دقايق)

opencode هيقرأ الملفات ويعطيك تقرير بسيط:
"Found 150 tools, 125 need upgrade, DB has..."

انسخ التقرير وابعتهولي - سأعطيك الخطوة التالية.

### الخطوة 3: قول له "ابنِ Core" (10 دقايق)

بعد Audit، قول له في opencode:

"ابنِ Core Framework v6"

وهو هينسخ 3 ملفات من E:\temp\v6-150-genius\ إلى lib/engines/core/v6/

---

## بعد ما تخلص 3 خطوات - توقف

لا تكمل 150 أداة الآن. 

اختبر أداة واحدة فقط:
```bash
npm run dev
```

لو اشتغلت → قولّي "Core جاهز" وسأعطيك Batch A 1-25 فقط (5 أدوات تجربة).

## امسح اللخبطة:

احذف من E:\temp\ كل المجلدات القديمة اللي تبدأ بـ mrxsteroid- واحتفظ فقط بـ:
- v6-150-genius
- v5-genius

لا يوجد مجلدات أخرى.

## الخلاصة - بسيطة جداً:

1. افتح opencode
2. انسخ برومبت واحد فقط من FINAL-SINGLE-PROMPT-FOR-OPENCODE.txt
3. انتظر Audit
4. قول "ابنِ Core"
5. توقف واختبر

لا يوجد برومبتات أخرى، لا يوجد 12 أمر، لا يوجد Vision Module الآن - فقط 3 خطوات.

لو تهت تاني، ابعتلي رد opencode وسأبسط أكثر.
