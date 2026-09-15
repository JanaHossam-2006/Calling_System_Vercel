# 🚀 نظام إدارة الطلبات والمتابعة
## Calling System - Vercel + Supabase Edition

نسخة محسّنة من نظام إدارة الطلبات الأصلي، تعمل على **Vercel** مع قاعدة بيانات **Supabase** قوية.

---

## 📋 النسخة الحالية

- **الإصدار:** 2.0.0
- **التاريخ:** سبتمبر 2026
- **الحالة:** 🔄 قيد التطوير المكثف

---

## 🎯 الميزات الرئيسية

### ✅ ثلاث واجهات متخصصة:
- **الموظفات** - إدارة الطلبات والمتابعة
- **مسؤولو المتاجر** - تحديث حالات الطلبات
- **المديرين** - لوحة إحصائيات شاملة

### ✅ الفيتشرز المتقدمة:
- 🔐 نظام مصادقة آمن (Supabase Auth)
- 📊 رسوم بيانية متقدمة
- 🔍 بحث شامل ومتقدم
- 💾 حفظ تلقائي للبيانات
- 📱 واجهة مستجيبة
- ⚡ أداء عالي جداً
- 🌙 Dark Theme

---

## 🛠️ المتطلبات

- Node.js 18+
- npm أو yarn
- حساب Supabase
- حساب Vercel (للنشر)

---

## 📦 التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone <repo-url>
cd calling-system-vercel
```

### 2. تثبيت المتعلقات
```bash
npm install
```

### 3. إعداد متغيرات البيئة
انسخ `.env.example` إلى `.env.local` وأضف بيانات Supabase:
```bash
cp .env.example .env.local
```

ثم عدّل:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. تشغيل التطوير
```bash
npm run dev
```

افتح http://localhost:3000 في المتصفح

---

## 🏗️ هيكل المشروع

```
calling-system-vercel/
├── src/
│   ├── app/
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── auth/
│   │   │   └── login/         # صفحة تسجيل الدخول
│   │   └── dashboard/         # لوحات القيادة
│   │       ├── admin/
│   │       ├── employee/
│   │       └── store/
│   ├── components/            # المكونات
│   ├── hooks/                 # React Hooks مخصصة
│   ├── services/              # API Services
│   ├── store/                 # Zustand stores
│   ├── styles/                # CSS عام
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── database/
│   └── schema.sql             # قاعدة البيانات الكاملة
├── public/                    # الملفات الثابتة
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 📊 قاعدة البيانات

### الجداول الرئيسية:
- **users** - المستخدمين والأدوار
- **daily_orders** - الطلبات اليومية
- **deliveries** - التسليمات
- **follow_up_orders** - المتابعات
- **archived_orders** - الطلبات المؤرشفة
- **test_orders** - الطلبات التجريبية

لتشغيل schema.sql على Supabase:
1. اذهب إلى SQL Editor
2. انسخ محتويات `database/schema.sql`
3. الصق وشغّل

---

## 🚀 النشر على Vercel

### الخطوة 1: إعداد Vercel
```bash
npm install -g vercel
vercel login
```

### الخطوة 2: النشر
```bash
vercel --prod
```

### الخطوة 3: إضافة متغيرات البيئة
في لوحة التحكم Vercel:
- Settings → Environment Variables
- أضف `NEXT_PUBLIC_SUPABASE_URL`
- أضف `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 👥 الأدوار والصلاحيات

| الدور | الصلاحيات |
|------|----------|
| **Admin** | إدارة كاملة، لوحة إحصائيات، تقارير |
| **Employee** | عرض وتحديث طلبات، بحث، إحصائيات شخصية |
| **Store** | تحديث حالات الطلبات، متابعات |

---

## 📝 خريطة الطريق

- [x] إعداد البنية الأساسية
- [x] تثبيت التبعيات
- [ ] بناء واجهات الموظفات
- [ ] بناء واجهات المتاجر
- [ ] بناء لوحة المديرين
- [ ] إضافة البحث والفلاترة
- [ ] إضافة الرسوم البيانية
- [ ] الاختبار الشامل
- [ ] النشر على Vercel

---

## 🔐 الأمان

- ✅ Supabase Auth للمصادقة
- ✅ RLS Policies على جميع الجداول
- ✅ HTTPS فقط
- ✅ متغيرات البيئة آمنة
- ✅ بدون حفظ بيانات حساسة

---

## 📞 الدعم

للمشاكل أو الاستفسارات:
1. اطلع على التوثيق
2. تحقق من Git Issues
3. تواصل مع فريق التطوير

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2026

---

**آخر تحديث:** سبتمبر 15، 2026
**الحالة:** 🔄 جاري التطوير المكثف
