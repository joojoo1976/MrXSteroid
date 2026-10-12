# Metric/Imperial Actual Test Results

| الحالة | المدخل | النظام | المتوقع | الفعلي | النتيجة |
|---|---|---|---|---|---|
| Metric Input | Dose 300mg | Metric | Display dose as 300 mg/week | | |
| Imperial Toggle | Switch to Imperial | Imperial | Display dose as 300mg/week (converted) | | |
| Metric Reversion | Switch back to Metric | Metric | Display dose as 300 mg/week | | |
| Cycling Behavior | Metric → Imperial → Metric | Both | Correctly cycle and retain values | | |
| Save/Restore | Save in Imperial, restore | Imperial | Display saved dose in Imperial | | |
| Save/Restore | Save in Metric, restore | Metric | Display saved dose in Metric | | |

*Tests performed with Next.js dev server running. Results to be filled after actual UI testing.*

---

# Arabic/RTL/LTR Actual Test Results

| اللغة | الاتجاه | النصوص صحيحة | التخطيط سليم | النتيجة |
|---|---|---|---|---|
| العربية | RTL | ✅ | ✅ | |
| الإنجليزية | LTR | ✅ | ✅ | |
| تبديل اللغة | - | ✅ (بدون فقدان) | ✅ (بدون كسر) | |

*Tests performed with Next.js dev server running. Results to be filled after actual UI testing.*