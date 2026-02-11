# 🔍 تشخيص مشاكل خدمة الدفع - Payment Service Diagnostic

## المشاكل المحتملة | Potential Issues

### 1. ⚠️ مشكلة استيراد الأنواع (Type Imports)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:12)

```typescript
// المشكلة: المسار غير صحيح
import {
    PaymentInitPayload,
    PaymentSession,
    PaymentStatus,
    PaymentResult
} from '../types/payment';
```

**الحل:** يجب أن يكون المسار:
```typescript
import {
    PaymentInitPayload,
    PaymentSession,
    PaymentStatus,
    PaymentResult
} from '../../types/payment';
```

---

### 2. ⚠️ مشكلة استيراد الوحدات (Module Imports)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:9-12)

```typescript
// المشاكل:
import { supabase } from '../lib/supabase';  // ❌ مسار خاطئ
import { errorHandler } from '../lib/error-handler';  // ❌ مسار خاطئ
import { loggers } from '../utils/logger';  // ❌ مسار خاطئ
import { env } from '../config/env';  // ❌ مسار خاطئ
```

**الحل:**
```typescript
import { supabase } from './supabase';
import { errorHandler } from './error-handler';
import { loggers } from './logger';
import { env } from '../../config/env';
```

---

### 3. ⚠️ مشكلة التحقق من المفتاح العام (Public Key Validation)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:120-133)

```typescript
// المشكلة: التحقق غير دقيق
const publicKey = env.SPACEREMIT_PUBLIC_KEY;
const isSandbox = publicKey.startsWith('sb_');
const isStandard = publicKey.length > 20 && !publicKey.startsWith('pk_');
```

**المشكلة:** هذا المنطق يسمح بمفاتيح غير صالحة. حسب [`PAYMENT_FIX_GUIDE.md`](PAYMENT_FIX_GUIDE.md:20):
- المفاتيح الصحيحة تبدأ بـ `pk_` (إنتاج) أو `sb_` (اختبار)
- المفاتيح القديمة مثل `pkO6...` غير مدعومة

**الحل:**
```typescript
const publicKey = env.SPACEREMIT_PUBLIC_KEY;
if (!publicKey) {
    return {
        success: false,
        error: {
            code: 'MISSING_PUBLIC_KEY',
            message: 'SpaceRemit Public Key is not configured',
            messageAr: 'مفتاح SpaceRemit العام غير مُكوَّن'
        }
    };
}

// التحقق من صيغة المفتاح
const isValidFormat = publicKey.startsWith('pk_') || publicKey.startsWith('sb_');
if (!isValidFormat) {
    return {
        success: false,
        error: {
            code: 'INVALID_PUBLIC_KEY_FORMAT',
            message: 'Public key must start with pk_ (live) or sb_ (sandbox)',
            messageAr: 'يجب أن يبدأ المفتاح العام بـ pk_ (مباشر) أو sb_ (تجريبي)'
        }
    };
}
```

---

### 4. ⚠️ مشكلة معالجة الأخطاء (Error Handling)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:175-185)

```typescript
catch (error) {
    errorHandler.handle(error, 'PaymentService.initiatePayment');
    return {
        success: false,
        error: {
            code: 'PAYMENT_INIT_FAILED',
            message: 'Payment gateway error',
            messageAr: 'خطأ في بوابة الدفع'
        }
    };
}
```

**المشكلة:** الرسالة عامة جداً ولا تساعد في التشخيص.

**الحل:**
```typescript
catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errorHandler.handle(error, 'PaymentService.initiatePayment');
    
    loggers.payment.error('Payment initiation failed', {
        error: errorMessage,
        payload: {
            amount: payload.amount,
            currency: payload.currency,
            email: payload.email
        }
    });
    
    return {
        success: false,
        error: {
            code: 'PAYMENT_INIT_FAILED',
            message: `Payment gateway error: ${errorMessage}`,
            messageAr: `خطأ في بوابة الدفع: ${errorMessage}`
        }
    };
}
```

---

### 5. ⚠️ مشكلة عدم وجود Logger (Missing Logger)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:11)

```typescript
import { loggers } from '../utils/logger';
```

**المشكلة:** الملف [`src/shared/lib/logger.ts`](src/shared/lib/logger.ts) موجود، لكن المسار خاطئ.

**الحل:**
```typescript
import { loggers } from './logger';
```

---

### 6. ⚠️ مشكلة في استيراد useCheckout (Import Issue)
**الملف:** [`src/features/checkout/hooks/useCheckout.ts`](src/features/checkout/hooks/useCheckout.ts:6)

```typescript
import { paymentService } from '../../../services/payment.service';
```

**المشكلة:** المسار يشير إلى `services/payment.service` لكن الملف موجود في `shared/lib/payment.service.ts`

**الحل:**
```typescript
import { paymentService } from '../../../shared/lib/payment.service';
```

---

### 7. ⚠️ مشكلة في تكوين البيئة (Environment Configuration)
**الملف:** [`src/config/env.ts`](src/config/env.ts:29)

```typescript
ENCRYPTION_KEY: z.string().min(1, 'Encryption key is required'),
```

**المشكلة:** لا يوجد `VITE_ENCRYPTION_KEY` في ملف [`.env.example`](.env.example)

**الحل:** إضافة المتغير إلى `.env.example`:
```env
# Security
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here
```

---

### 8. ⚠️ مشكلة في معالجة العملة (Currency Handling)
**الملف:** [`src/shared/lib/payment.service.ts`](src/shared/lib/payment.service.ts:78-89)

```typescript
// Retry logic for currency column
if (error && (error.message.includes('currency') || error.code === '42703')) {
    loggers.payment.warn('Currency column missing, retrying without currency...');
    delete insertPayload.currency;
    // ...
}
```

**المشكلة:** هذا حل مؤقت. يجب التأكد من وجود عمود `currency` في جدول `payments`.

**الحل:** تشغيل migration لإضافة العمود:
```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
```

---

## 🔧 الإصلاحات المطلوبة | Required Fixes

### أولوية عالية (High Priority):
1. ✅ إصلاح مسارات الاستيراد في `payment.service.ts`
2. ✅ تحسين التحقق من صحة المفتاح العام
3. ✅ إضافة معالجة أخطاء أفضل مع رسائل واضحة
4. ✅ إصلاح مسار الاستيراد في `useCheckout.ts`

### أولوية متوسطة (Medium Priority):
5. ⚠️ إضافة `VITE_ENCRYPTION_KEY` إلى `.env.example`
6. ⚠️ التحقق من وجود عمود `currency` في قاعدة البيانات
7. ⚠️ تحسين السجلات التشخيصية

### أولوية منخفضة (Low Priority):
8. 📝 إضافة اختبارات وحدة إضافية
9. 📝 توثيق API بشكل أفضل

---

## 🧪 خطوات الاختبار | Testing Steps

### 1. التحقق من المتغيرات البيئية:
```bash
# تحقق من وجود المفاتيح المطلوبة
echo $VITE_SPACEREMIT_PUBLIC_KEY
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### 2. اختبار صيغة المفتاح العام:
```javascript
const key = import.meta.env.VITE_SPACEREMIT_PUBLIC_KEY;
console.log('Key starts with pk_:', key.startsWith('pk_'));
console.log('Key starts with sb_:', key.startsWith('sb_'));
console.log('Key length:', key.length);
```

### 3. اختبار إنشاء الدفع:
```javascript
const result = await paymentService.initiatePayment({
    amount: 99.99,
    currency: 'USD',
    email: 'test@example.com',
    customerName: 'Test User',
    productId: 'test-product',
    productName: 'Test Product',
    quantity: 1,
    orderId: 'test-order-123',
    locale: 'en'
});

console.log('Payment result:', result);
```

---

## 📋 قائمة التحقق | Checklist

- [ ] تحديث مسارات الاستيراد في `payment.service.ts`
- [ ] تحسين التحقق من المفتاح العام
- [ ] إضافة معالجة أخطاء محسّنة
- [ ] إصلاح مسار الاستيراد في `useCheckout.ts`
- [ ] إضافة `VITE_ENCRYPTION_KEY` إلى `.env.example`
- [ ] التحقق من schema قاعدة البيانات
- [ ] اختبار تدفق الدفع الكامل
- [ ] تحديث الوثائق

---

## 🚀 الخطوات التالية | Next Steps

1. **تطبيق الإصلاحات:** تنفيذ جميع الإصلاحات ذات الأولوية العالية
2. **الاختبار:** اختبار تدفق الدفع الكامل
3. **المراقبة:** إضافة سجلات تشخيصية للمراقبة
4. **التوثيق:** تحديث الوثائق بالتغييرات

---

**تاريخ التشخيص:** 2026-02-11  
**الحالة:** 🔴 يتطلب إصلاحات فورية
