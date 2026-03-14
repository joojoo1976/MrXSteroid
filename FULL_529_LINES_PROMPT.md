# 🎯 MR. X STEROID - Complete Website Recreation Prompt
## النسخة الكاملة - 529 سطر بالتفصيل

**Project URL:** https://mrxsteroid.vercel.app/
**Repository:** https://github.com/joojoo1976/MrXSteroid
**Date:** March 4, 2026
**Version:** 1.0.0

---

# القسم 1: مقدمة المشروع

## 1.1 نظرة عامة
Mr X Steroid هو موقع إلكتروني متكامل لكتاب رقمي عن الستيرويدات واللياقة البدنية.
الموقع يدعم اللغتين العربية والإنجليزية مع نظام دفع إلكتروني متكامل.

## 1.2 الهدف من المشروع
إنشاء منصة احترافية لبيع كتاب رقمي عن الستيرويدات مع:
- نظام دفع إلكتروني آمن
- حاسبات اللياقة البدنية
- نظام عضويات واشتراكات
- دعم فني متكامل

## 1.3 الجمهور المستهدف
- لاعبو كمال الأجسام
- المدربون الرياضيون
- المهتمون باللياقة البدنية
- الباحثون عن معلومات علمية عن الستيرويدات

---

# القسم 2: الهوية البصرية

## 2.1 الألوان الرئيسية

### اللون الأساسي - الأسود
- Hex: #000000
- RGB: rgb(0, 0, 0)
- الاستخدام: خلفية الموقع الرئيسية

### اللون الثانوي - الذهبي
- Hex: #EAB308
- RGB: rgb(234, 179, 8)
- الاستخدام: الأزرار، الـ accents، الـ CTAs

### اللون الثالث - الرمادي الداكن
- Hex: #18181b (zinc-900)
- Hex: #27272a (zinc-800)
- الاستخدام: الخلفيات الثانوية، الـ cards

### اللون الرابع - الأبيض
- Hex: #ffffff
- الاستخدام: النصوص الرئيسية

### اللون الخامس - الأخضر
- Hex: #22c55e
- الاستخدام: رسائل النجاح، التأكيدات

## 2.2 الخطوط (Typography)

### للإنجليزية
- Primary: Inter
- Fallback: system-ui, -apple-system, sans-serif
- Weights: 400, 500, 600, 700, 900

### للعربية
- Primary: Noto Sans Arabic
- Secondary: Tajawal
- Fallback: system-ui, sans-serif
- Weights: 400, 500, 600, 700, 900

### أحجام الخطوط
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

## 2.3 الشعار (Logo)

### المواصفات
- شعار ديناميكي يتغير حسب اللغة
- يتوفر بنسخة كاملة ومختصرة
- موجود في: /public/images/site-logo-mascot.png

### الاستخدام
- Header: شعار مختصر
- Hero Section: شعار كامل
- Footer: شعار مع النص

---

# القسم 3: اللغات (Localization)

## 3.1 اللغات المدعومة
- العربية (ar) - RTL
- الإنجليزية (en) - LTR

## 3.2 تبديل اللغة
- زر في الـ Header
- يحفظ الاختيار في localStorage
- يغير الاتجاه (RTL/LTR)
- يغير جميع النصوص

## 3.3 هيكل النصوص
```typescript
interface ContentStrings {
    hero: {
        title: string;
        subtitle: string;
        cta: string;
    };
    features: {
        title: string;
        items: string[];
    };
    // ... باقي النصوص
}
```

---

# القسم 4: الصفحات الرئيسية

## 4.1 الصفحة الرئيسية (Home)

### Hero Section
- عنوان رئيسي جذاب
- عنوان فرعي توضيحي
- زر CTA رئيسي
- صورة المنتج (غلاف الكتاب)

### Features Section
- 3-5 مميزات رئيسية
- أيقونات معبرة
- نصوص قصيرة

### Benefits Section
- قائمة الفوائد
- إحصائيات وأرقام
- شهادات العملاء

### Pricing Section
- 6 باقات مختلفة
- مقارنة واضحة
- أزرار شراء

### FAQ Section
- أسئلة شائعة
- إجابات مفصلة
- تصميم Accordion

### Contact Section
- نموذج تواصل
- معلومات الاتصال
- روابط السوشيال ميديا

### Footer
- روابط سريعة
- معلومات قانونية
- حقوق النشر

## 4.2 صفحة الدفع (Checkout)

### المسار
/checkout

### المكونات الرئيسية

#### ProductSelector
- اختيار نوع المنتج
- digital, paperback, bundle, coaching, coaching_plus
- عرض السعر لكل منتج

#### OrderSummary
- ملخص الطلب
- صورة غلاف الكتاب
- الكمية
- السعر الإجمالي
- تكلفة الشحن

#### CheckoutForm
- Billing Details
  - الاسم الكامل
  - البريد الإلكتروني
  - الدولة
- Shipping Details
  - العنوان الكامل
  - المدينة
  - الرمز البريدي
  - شركة الشحن
- Payment Method
  - Card (Embedded)
  - Redirect (Secure Page)
- SpaceRemit Card Element

### SpaceRemit Integration

#### تحميل SDK
```typescript
const loadSpaceRemitSDK = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
            console.log('✅ SpaceRemit SDK loaded');
            resolve(true);
        };
        
        script.onerror = (error) => {
            console.error('❌ SpaceRemit SDK failed to load', error);
            reject(error);
        };
        
        document.body.appendChild(script);
    });
};
```

#### التهيئة
```typescript
window.SPACEREMIT.init({
    public_key: import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY,
    form_id: 'spaceremit-checkout-form',
    card_container_id: 'spaceremit-card-element',
    amount: finalTotal,
    currency: 'USD',
    customer_email: email,
    customer_name: fullName,
    notes: `Order payment - ${new Date().toISOString()}`
});
```

#### Callbacks
```typescript
window.SP_SUCCESSFUL_PAYMENT = (code: string) => {
    console.log('✅ Payment successful:', code);
    onTokenReceived(code);
};

window.SP_FAILD_PAYMENT = () => {
    console.error('❌ Payment failed');
    onError('Payment failed');
};

window.SP_RECIVED_MESSAGE = (msg: string) => {
    console.log('📩 SpaceRemit message:', msg);
};
```

#### المشاكل المعروفة والحلول

##### مشكلة 1: Card Details يظهر فارغاً
**الأسباب المحتملة:**
- publicKey فارغ أو غير صحيح
- SDK لم يحمل بشكل صحيح
- Container غير موجود في DOM
- CSS يخفي العنصر

**الحلول:**
```typescript
// 1. التحقق من publicKey
if (!publicKey || publicKey.trim() === '') {
    setInitError('Payment key not configured');
    return;
}

// 2. إضافة retry logic
const maxRetries = 3;
if (retryCount < maxRetries) {
    setRetryCount(prev => prev + 1);
    setTimeout(init, 1000);
    return;
}

// 3. فحص container
const container = document.getElementById('spaceremit-card-element');
if (!container) {
    console.error('Container not found');
    return;
}

// 4. فحص CSS
const style = window.getComputedStyle(container);
if (style.display === 'none' || style.height === '0px') {
    console.warn('Container may be hidden');
}

// 5. إضافة fallback button
<Button onClick={() => setPaymentMethod('redirect')}>
    Switch to secure redirect payment
</Button>
```

##### مشكلة 2: الصور المحذوفة
**الحلول:**
```typescript
// 1. استعادة الصور
// تأكد من وجود:
// - /public/cover-ar.webp
// - /public/cover-en.webp
// - /public/Author_MrXSteroid.jpg

// 2. إضافة onError fallback
<img
    src={isAr ? "/cover-ar.webp" : "/cover-en.webp"}
    alt="Product Cover"
    onError={(e) => {
        (e.target as HTMLImageElement).src = "/images/site-logo-mascot.png";
    }}
/>
```

## 4.3 صفحة النجاح (Success)

### المسار
/success

### المحتوى
- رسالة نجاح
- رقم الطلب
- تفاصيل المنتج
- معلومات الشحن
- زر العودة للرئيسية

## 4.4 صفحة الإلغاء (Cancel)

### المسار
/cancel

### المحتوى
- رسالة إلغاء
- سبب محتمل
- زر للعودة للدفع

## 4.5 صفحة التشخيص (Diagnostic)

### المسار
/payment-diagnostic

### الفحوصات
- Environment Variables
- HTTPS/SSL
- SpaceRemit SDK
- Content Security Policy
- Database Connection

---

# القسم 5: التقنيات المطلوبة

## 5.1 Frontend

### Framework
- React 18+
- TypeScript 5+

### Build Tool
- Vite 5+

### Styling
- TailwindCSS 3+
- PostCSS
- Autoprefixer

### UI Components
- shadcn/ui
- Radix UI primitives

### Animations
- Framer Motion 10+

### Icons
- Lucide React

### State Management
- Context API
- React Hooks

### Forms
- React Hook Form 7+
- Zod validation

### Routing
- Custom router based on Page enum
- Browser History API

## 5.2 Backend

### Database
- Supabase (PostgreSQL 15+)

### Authentication
- Supabase Auth
- Email/Password
- Magic Link
- Password Recovery

### Payments
- SpaceRemit Gateway
- Redirect flow
- Embedded card element

### Hosting
- Vercel
- Serverless Functions
- Edge Functions

---

# القسم 6: المصادقة (Authentication)

## 6.1 المميزات
- تسجيل دخول
- تسجيل خروج
- استعادة كلمة المرور
- إعادة تعيين كلمة المرور
- حماية الصفحات

## 6.2 AuthGuard
```typescript
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (!isAuthenticated) {
        navigateTo(Page.LOGIN);
        return null;
    }
    
    return <>{children}</>;
};
```

## 6.3 الصفحات المحمية
- Profile
- Dashboard
- Orders
- Downloads

---

# القسم 7: نظام الدفع

## 7.1 SpaceRemit Configuration

### Environment Variables
```env
# Frontend (Public)
VITE_SPACEREMIT_PUBLIC_KEY=***SPACEREMIT_PUBLIC_KEY_REDACTED***
VITE_SPACEREMIT_CALLBACK_URL=https://mrxsteroid.vercel.app/api/payments/callback

# Backend (Secret)
SPACEREMIT_SECRET_KEY=***SPACEREMIT_SECRET_KEY_REDACTED***
SPACEREMIT_WEBHOOK_SECRET=***SPACEREMIT_SECRET_KEY_REDACTED***
```

## 7.2 Payment Service

### Initiate Payment
```typescript
interface PaymentInitPayload {
    amount: number;
    currency: 'USD' | 'EGP' | 'SAR';
    email: string;
    customerName: string;
    orderId: string;
    productId: string;
    productName: string;
    userId?: string;
    quantity: number;
    metadata: Record<string, unknown>;
}

async function initiatePayment(payload: PaymentInitPayload): Promise<PaymentResult> {
    // 1. Validate public key
    if (!env.SPACEREMIT_PUBLIC_KEY) {
        throw new Error('Public key not configured');
    }
    
    // 2. Create payment record in database
    const paymentId = await createPaymentRecord(payload);
    
    // 3. Build SpaceRemit checkout URL
    const checkoutUrl = buildCheckoutUrl(payload);
    
    // 4. Redirect user
    window.location.href = checkoutUrl;
    
    return { success: true, data: { checkoutUrl, paymentId } };
}
```

## 7.3 Webhook Handler

### المسار
/api/payments/callback

### التحقق من التوقيع
```typescript
function verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', CONFIG.SPACEREMIT_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
```

### معالجة الأحداث
```typescript
if (event === 'payment.success') {
    // 1. Update payment record
    await updatePaymentRecord(transactionId, 'completed');
    
    // 2. Update user profile
    await updateUserProfile(userId, {
        has_paid: true,
        subscription_status: 'active'
    });
    
    // 3. Create subscription
    await createSubscription(userId, {
        status: 'active',
        product_id: planTier
    });
}
```

### حماية IDOR
```typescript
// Validate transaction ID format
if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
    return res.status(400).json({ error: 'Invalid transaction ID format' });
}

// Verify user ownership
const payment = await getPayment(transactionId);
if (payment.userId !== currentUser.id) {
    return res.status(403).json({ error: 'Forbidden' });
}
```

---

# القسم 8: قاعدة البيانات

## 8.1 جدول profiles

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'free',
    has_paid BOOLEAN DEFAULT FALSE,
    plan_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_status);
```

## 8.2 جدول payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    order_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',
    spaceremit_code TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_email ON payments(customer_email);
```

## 8.3 جدول subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'inactive',
    product_id TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

## 8.4 جدول orders

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    status BOOLEAN DEFAULT FALSE,
    transaction_id TEXT,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_zip TEXT,
    shipping_provider TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_transaction ON orders(transaction_id);
```

---

# القسم 9: المميزات الرئيسية

## 9.1 حاسبات اللياقة

### Macro Calculator
- حساب السعرات الحرارية
- حساب الماكروز (بروتين، كربوهيدرات، دهون)
- تخصيص حسب الهدف (ضخامة، تنشيف، قوة)

### Body Fat Calculator
- حساب نسبة الدهون
- معادلة Navy Method
- نتائج تفصيلية

### Injection Map
- خريطة الحقن التفاعلية
- مناطق الجسم المختلفة
- نصائح الأمان

### Half Life Visualizer
- تصور عمر النصف للستيرويدات
- جدول الجرعات
- رسوم بيانية

### Master Calculator
- جميع الحاسبات في مكان واحد
- واجهة موحدة
- حفظ النتائج

### Genetic Potential Calculator
- حساب الإمكانات الوراثية
- FFMI Calculator
- حدود طبيعية

## 9.2 نظام الباقات

```typescript
const pricingTiers = {
    digital: {
        id: 'digital',
        name: 'Digital Book',
        price: 49.99,
        requiresShipping: false,
        requiresBodyStats: false,
        includesEbook: true,
        includesAudiobook: false,
        includesCoaching: false
    },
    paperback: {
        id: 'paperback',
        name: 'Paperback Book',
        price: 72.00,
        requiresShipping: true,
        requiresBodyStats: false,
        includesEbook: true,
        includesAudiobook: false,
        includesCoaching: false
    },
    bundle: {
        id: 'bundle',
        name: 'Bundle (Book + Audiobook)',
        price: 72.00,
        requiresShipping: true,
        requiresBodyStats: false,
        includesEbook: true,
        includesAudiobook: true,
        includesCoaching: false
    },
    coaching: {
        id: 'coaching',
        name: 'Coaching Package',
        price: 82.00,
        requiresShipping: true,
        requiresBodyStats: false,
        includesEbook: true,
        includesAudiobook: true,
        includesCoaching: true
    },
    coaching_plus: {
        id: 'coaching_plus',
        name: 'Premium Coaching +',
        price: 282.00,
        requiresShipping: true,
        requiresBodyStats: true,
        includesEbook: true,
        includesAudiobook: true,
        includesCoaching: true
    }
};
```

## 9.3 الشحن

### حساب التكلفة
```typescript
async function calculateShippingRates({ country }: { country: string }): Promise<ShippingProvider[]> {
    const isEgypt = country.toLowerCase() === 'egypt' || country === 'مصر';
    
    if (isEgypt) {
        return [
            { id: 'aramex_eg', name: 'Aramex Egypt', price: 50, estimatedDays: '2-3' },
            { id: 'dhl_eg', name: 'DHL Egypt', price: 80, estimatedDays: '1-2' }
        ];
    }
    
    return [
        { id: 'aramex_global', name: 'Aramex International', price: 150, estimatedDays: '5-7' },
        { id: 'fedex_global', name: 'FedEx International', price: 200, estimatedDays: '3-5' }
    ];
}
```

### شركات الشحن
- Aramex
- DHL
- FedEx
- Egypt Post (محلي)

---

# القسم 10: هيكل المشروع

## 10.1 المجلدات الرئيسية

```
MrXSteroid/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .vscode/
│   └── settings.json
├── public/
│   ├── images/
│   │   └── site-logo-mascot.png
│   ├── screens/
│   ├── cover-ar.webp
│   ├── cover-en.webp
│   ├── Author_MrXSteroid.jpg
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── @types/
│   ├── config/
│   │   └── env.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── PreferencesContext.tsx
│   │   └── LanguageContext.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── SpaceRemitCardElement.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── ProductSelector.tsx
│   │   │   └── hooks/
│   │   ├── calculator/
│   │   │   ├── MacroCalculator.tsx
│   │   │   ├── BodyFatCalculator.tsx
│   │   │   └── ...
│   │   └── marketing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── SuccessPage.tsx
│   │   ├── CancelPage.tsx
│   │   └── PaymentConfigDiagnostic.tsx
│   ├── shared/
│   │   ├── lib/
│   │   │   ├── payment.service.ts
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── types/
│   │       └── types.ts
│   ├── i18n/
│   │   ├── ar.ts
│   │   └── en.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── api/
│   └── payments/
│       └── callback.ts
├── supabase/
│   ├── migrations/
│   └── config.toml
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.cjs
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── index.html
└── README.md
```

## 10.2 الملفات الحرجة

### SpaceRemitCardElement.tsx
**المسار:** src/features/checkout/SpaceRemitCardElement.tsx
**الوصف:** مكون بطاقة الدفع
**الأهمية:** ⚠️ حرج جداً

### CheckoutForm.tsx
**المسار:** src/features/checkout/CheckoutForm.tsx
**الوصف:** نموذج الدفع الكامل
**الأهمية:** ⚠️ حرج جداً

### payment.service.ts
**المسار:** src/shared/lib/payment.service.ts
**الوصف:** خدمة الدفع
**الأهمية:** ⚠️ حرج جداً

### callback.ts
**المسار:** api/payments/callback.ts
**الوصف:** Webhook handler
**الأهمية:** ⚠️ حرج جداً

### OrderSummary.tsx
**المسار:** src/features/checkout/OrderSummary.tsx
**الوصف:** ملخص الطلب
**الأهمية:** عالية

---

# القسم 11: UI Components

## 11.1 Button

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'gold';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center rounded-md text-sm font-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                    'disabled:pointer-events-none disabled:opacity-50',
                    {
                        'bg-gold-500 text-black hover:bg-gold-400': variant === 'gold',
                        'border border-zinc-800 bg-black/40 hover:bg-zinc-800': variant === 'outline',
                        'hover:bg-white/5': variant === 'ghost',
                        'h-10 px-4 py-2': size === 'default',
                        'h-9 rounded-md px-3': size === 'sm',
                        'h-11 rounded-md px-8': size === 'lg',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
```

## 11.2 Card

```tsx
const Card = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-xl border border-zinc-800 bg-zinc-900/50 text-white shadow-2xl',
                'backdrop-blur-xl',
                className
            )}
            {...props}
        />
    )
);
```

## 11.3 Input

```tsx
const Input = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-md border border-zinc-800 bg-black/40 px-3 py-2 text-sm',
                'text-white placeholder:text-zinc-500',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
```

---

# القسم 12: Responsive Design

## 12.1 Breakpoints

```typescript
const breakpoints = {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Laptop
    xl: '1280px',  // Desktop
    '2xl': '1536px' // Large desktop
};
```

## 12.2 Mobile First

```tsx
// Start with mobile styles, then add breakpoints
<div className="
    grid grid-cols-1        // Mobile
    md:grid-cols-2          // Tablet
    lg:grid-cols-3          // Laptop
    xl:grid-cols-4          // Desktop
">
    {children}
</div>
```

## 12.3 Sticky Sidebar

```tsx
<OrderSummary className="
    lg:sticky lg:top-32
    lg:col-span-4
"/>
```

---

# القسم 13: SEO

## 13.1 Meta Tags

```tsx
<SEO
    title="Mr X Steroid - الدليل الشامل لللياقة البدنية"
    description="كتاب رقمي متكامل عن الستيرويدات واللياقة البدنية"
    keywords="ستيرويدات, كمال أجسام, لياقة بدنية, تضخيم, تنشيف"
    ogImage="/cover-en.webp"
    twitterCard="summary_large_image"
/>
```

## 13.2 Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://mrxsteroid.vercel.app/</loc>
        <lastmod>2026-03-04</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://mrxsteroid.vercel.app/checkout</loc>
        <priority>0.8</priority>
    </url>
</urlset>
```

## 13.3 Robots.txt

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://mrxsteroid.vercel.app/sitemap.xml
```

---

# القسم 14: الأداء (Performance)

## 14.1 Lazy Loading

```tsx
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const SuccessPage = React.lazy(() => import('./pages/SuccessPage'));

<Suspense fallback={<LoadingSpinner />}>
    <CheckoutPage />
</Suspense>
```

## 14.2 Code Splitting

```typescript
// vite.config.ts
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': ['framer-motion', '@radix-ui/*'],
                    'charts': ['recharts']
                }
            }
        }
    }
});
```

## 14.3 Image Optimization

```tsx
<img
    src="/cover-en.webp"
    alt="Product Cover"
    loading="lazy"
    width="400"
    height="600"
/>
```

---

# القسم 15: الاختبار (Testing)

## 15.1 اختبار الدفع

```bash
# الخطوات:
1. انتقل إلى /checkout
2. اختر منتج (digital, paperback, etc.)
3. املأ نموذج الدفع
4. اختر "Credit Card"
5. تحقق من ظهور Card Details
6. أدخل بيانات بطاقة اختبار
7. أكمل الدفع
8. تحقق من صفحة النجاح
```

## 15.2 اختبار التشخيص

```bash
# الخطوات:
1. انتقل إلى /payment-diagnostic
2. انتظر اكتمال الفحوصات
3. تحقق من النتائج:
   - ✅ Environment Variable
   - ✅ Secure Connection (HTTPS)
   - ✅ SpaceRemit SDK Load
   - ✅ SpaceRemit Initialization
```

## 15.3 Console Logs المتوقعة

```
✅ [Env] SpaceRemit public key loaded: pkO6RUYN...
📦 [SpaceRemit] Loading SDK script...
✅ [SpaceRemit] SDK loaded successfully
🔧 [SpaceRemit] Initializing with: {...}
✅ [SpaceRemit] Initialization complete
```

---

# القسم 16: الأوامر (Commands)

## 16.1 التطوير

```bash
npm install          # تثبيت dependencies
npm run dev          # تشغيل development server
```

## 16.2 البناء

```bash
npm run build        # Build للإنتاج
npm run preview      # معاينة build
```

## 16.3 الاختبار

```bash
npm run test         # تشغيل الاختبارات
npm run lint         # فحص الكود
```

## 16.4 النشر

```bash
git add .
git commit -m "feat: description"
git push origin main
```

---

# القسم 17: الوثائق (Documentation)

## 17.1 الملفات المطلوبة

- README.md - نظرة عامة على المشروع
- DEPLOYMENT_GUIDE.md - دليل النشر
- CONTRIBUTING.md - دليل المساهمة
- PAYMENT_FIX_SUMMARY.md - إصلاحات الدفع
- FINAL_ENGINEERING_REPORT.md - تقرير هندسي

## 17.2 README.md Structure

```markdown
# Mr X Steroid

وصف المشروع...

## المميزات

- قائمة المميزات...

## التقنيات

- قائمة التقنيات...

## التثبيت

```bash
npm install
npm run dev
```

## النشر

انظر DEPLOYMENT_GUIDE.md

## المساهمة

انظر CONTRIBUTING.md
```

---

# القسم 18: معايير القبول (Acceptance Criteria)

## 18.1 قائمة التحقق

- [ ] جميع الصفحات تعمل بشكل صحيح
- [ ] Card Details يظهر بشكل صحيح (ليس فارغاً)
- [ ] الدفع يعمل بنجاح (embedded و redirect)
- [ ] Webhook يحدث has_paid = TRUE
- [ ] الصور تظهر في جميع الصفحات
- [ ] اللغات تعمل (عربي/إنجليزي)
- [ ] Responsive على جميع الأجهزة
- [ ] لا أخطاء في Console
- [ ] Build ناجح بدون أخطاء
- [ ] SEO tags موجودة
- [ ] Performance جيدة (Lighthouse score > 90)

## 18.2 اختبار الأداء

```bash
# Lighthouse CI
npm install -g lighthouse
lighthouse https://mrxsteroid.vercel.app --view

# الأهداف:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

# القسم 19: روابط مهمة

## 19.1 روابط خارجية

- **SpaceRemit Docs:** https://spaceremit.com/docs
- **SpaceRemit Dashboard:** https://spaceremit.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **TailwindCSS:** https://tailwindcss.com/docs
- **React:** https://react.dev
- **TypeScript:** https://typescriptlang.org/docs

## 19.2 روابط داخلية

- **GitHub Repo:** https://github.com/joojoo1976/MrXSteroid
- **Production URL:** https://mrxsteroid.vercel.app
- **Diagnostic Page:** https://mrxsteroid.vercel.app/payment-diagnostic
- **Checkout Page:** https://mrxsteroid.vercel.app/checkout

---

# القسم 20: ملاحظات ختامية

## 20.1 نصائح مهمة

1. **اختبر دائماً على localhost أولاً**
   - تأكد من عمل جميع المميزات محلياً قبل النشر

2. **احتفظ بنسخة احتياطية من .env**
   - لا تشارك المفاتيح السرية أبداً
   - استخدم .env.example كمرجع

3. **راقب Console Logs**
   - جميع الأخطاء ستظهر هناك
   - استخدم prefix للـ logs: [SpaceRemit], [Auth], etc.

4. **استخدم TypeScript بصرامة**
   - لا تستخدم `any`
   - عرف types لجميع البيانات

5. **اختبر على أجهزة متعددة**
   - Mobile, Tablet, Desktop
   - Chrome, Firefox, Safari, Edge

## 20.2 استكشاف الأخطاء

### Card Details فارغ
1. تحقق من Console للأخطاء
2. تأكد من وجود publicKey
3. تحقق من تحميل SDK
4. جرب fallback للدفع عبر الرابط

### الصور لا تظهر
1. تحقق من Network tab
2. تأكد من وجود الملفات في public/
3. امسح cache المتصفح

### الدفع يفشل
1. تحقق من Environment Variables
2. راجع SpaceRemit Dashboard
3. تحقق من Webhook logs

## 20.3 الصيانة

- راقب Vercel Analytics
- راجع SpaceRemit Dashboard يومياً
- حدّث dependencies بانتظام
- احتفظ بـ changelog

---

# ختاماً

هذا الدليل شامل ويحتوي على كل التفاصيل اللازمة لإعادة إنشاء موقع Mr X Steroid من الصفر.

**توقيع:**  
Lead Full-Stack Engineer  
**التاريخ:** 4 مارس 2026  
**الإصدار:** 1.0.0

---

**عدد الأسطر:** 529 سطر بالتفصيل الكامل
