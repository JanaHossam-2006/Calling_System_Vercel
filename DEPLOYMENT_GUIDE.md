# 🚀 دليل النشر والاختبار

نسخة محسّنة من Calling System على Vercel و Supabase

## ✅ قائمة التحقق قبل النشر

### 1️⃣ إعدادات Supabase

- [ ] **إنشاء مشروع جديد** على [supabase.com](https://supabase.com)
- [ ] **نسخ URL والمفتاح**: 
  - اذهب إلى Settings > API > Project Settings
  - انسخ `Project URL` و `anon public key`

- [ ] **تشغيل Database Schema**:
  ```sql
  -- اذهب إلى SQL Editor في Supabase
  -- الصق محتوى database/schema.sql بالكامل
  -- اضغط Play / Run
  ```

- [ ] **إنشاء جداول المستخدمين**:
  ```sql
  INSERT INTO users (email, name, role, is_active) VALUES
  ('admin@example.com', 'المدير العام', 'admin', true),
  ('employee1@example.com', 'موظفة 1', 'employee', true),
  ('store1@example.com', 'متجر 1', 'store', true);
  ```

- [ ] **تفعيل Authentication**:
  - اذهب إلى Authentication > Users
  - اضغط "Add user" أو استخدم SQL
  - الايميل: admin@example.com
  - كلمة السر: password123

### 2️⃣ تكوين المشروع المحلي

```bash
# 1. انسخ .env.example إلى .env.local
cp .env.example .env.local

# 2. حدّث الملف بقيمك
nano .env.local
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3️⃣ الاختبار المحلي

```bash
# الطريقة 1: استخدام Python (الأسهل)
cd /Applications/Operation\ System\ -\ Commera/Calling_System_Vercel
python3 -m http.server 8000

# ثم افتح: http://localhost:8000
```

**اختبر الخطوات التالية:**

✅ **تسجيل الدخول**
- افتح login.html
- أدخل: admin@example.com / password123
- يجب أن تذهب إلى lوحة الإدارة

✅ **الصفحات الأساسية**
- [ ] index.html - تحميل البيانات
- [ ] admin.html - لوحة الإدارة
- [ ] login.html - تسجيل الدخول

✅ **الفلاترة والبحث**
- [ ] تحميل قوائم الفلاترة
- [ ] تطبيق الفلاتر
- [ ] مسح الفلاتر

✅ **الجداول والإحصائيات**
- [ ] عرض جداول الموظفين
- [ ] عرض جداول المتاجر
- [ ] عرض قائمة الطلبات

✅ **الرسوم البيانية**
- [ ] رسم بياني الموظفين
- [ ] رسم بياني المتاجر

### 4️⃣ إضافة بيانات تجريبية

```sql
-- جدول الطلبات
INSERT INTO orders (order_code, customer_phone, employee_name, store, client_status, delivered) VALUES
('ORD-001', '0912345678', 'موظفة 1', 'متجر 1', 'رد و يستلم', 'yes'),
('ORD-002', '0923456789', 'موظفة 2', 'متجر 2', NULL, 'no'),
('ORD-003', '0934567890', 'موظفة 1', 'متجر 1', 'استبدال', 'no');

-- جدول التسليمات
INSERT INTO deliveries (order_code, customer_phone) VALUES
('ORD-001', '0912345678');

-- شغّل إعادة الحساب
SELECT recalculate_calculated_columns();
```

### 5️⃣ النشر على Vercel

#### الخيار A: عبر GitHub (الموصى به)

```bash
# 1. دفع المشروع إلى GitHub
git init
git add .
git commit -m "Initial commit: Calling System Vercel"
git branch -M main
git remote add origin https://github.com/your-username/calling-system-vercel.git
git push -u origin main

# 2. اذهب إلى https://vercel.com/dashboard
# 3. اضغط "Add New Project"
# 4. اختر الـ repository من GitHub
# 5. أضف Environment Variables:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
# 6. اضغط Deploy
```

#### الخيار B: عبر Vercel CLI

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. تسجيل الدخول
vercel login

# 3. نشر المشروع
cd /Applications/Operation\ System\ -\ Commera/Calling_System_Vercel
vercel --prod

# 4. عند السؤال عن Environment Variables:
# اختر Yes وأدخل القيم
```

## 🧪 الاختبارات اليدوية

### اختبار التسجيل

```
البريد: admin@example.com
كلمة السر: password123
النتيجة المتوقعة: الذهاب إلى admin.html
```

### اختبار الموظفة

```
البريد: employee1@example.com
كلمة السر: password123
النتيجة المتوقعة: 
- عرض 3 تابات (كل الطلبات، بدون حالة، بانتظار الشحن)
- عرض الإحصائيات الشخصية
```

### اختبار مسؤول المتجر

```
البريد: store1@example.com
كلمة السر: password123
النتيجة المتوقعة:
- عرض 4 تابات (رد و يستلم، استبدال، مرتجع، مؤجل)
- عرض الطلبات بحسب الحالة
```

### اختبار المدير

```
البريد: admin@example.com
كلمة السر: password123
النتيجة المتوقعة:
- 5 تابات كاملة
- لوحة إدارة شاملة
- خيارات رفع البيانات والبحث في الأرشيف
```

## 🐛 استكشاف الأخطاء الشائعة

### ❌ "Cannot read properties of undefined (reading 'createClient')"

**السبب:** Supabase library لم تُحمّل بشكل صحيح

**الحل:**
```html
<!-- تأكد من وجود هذا السطر في HTML -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### ❌ "Missing VITE_SUPABASE_URL"

**السبب:** متغيرات البيئة لم تُحدّث

**الحل:**
```bash
# حدّث .env.local بقيمك
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### ❌ "Permission denied" على الداشبورد

**السبب:** المستخدم ليس لديه الصلاحيات

**الحل:**
1. تحقق من جدول `users` في Supabase
2. تأكد من أن `role` صحيح (admin, employee, store)
3. تأكد من `is_active = true`

### ❌ جداول فارغة (لا تظهر البيانات)

**السبب:** البيانات لم تُدخل أو `dashboard_filter = 'Ignore'`

**الحل:**
```sql
-- أضف بيانات تجريبية
INSERT INTO orders (...) VALUES (...);

-- شغّل إعادة الحساب
SELECT recalculate_calculated_columns();
```

### ❌ الرسوم البيانية لا تظهر

**السبب:** Chart.js لم يُحمّل أو لا توجد بيانات

**الحل:**
1. تأكد من تحميل Chart.js:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   ```
2. افتح Browser Console (F12) وتحقق من الأخطاء
3. تأكد من وجود بيانات في الجداول

## 📊 قائمة التحقق النهائية

قبل الإطلاق الرسمي:

- [ ] Database schema مُنشأ بالكامل
- [ ] البيانات التجريبية مُدخلة
- [ ] جميع المستخدمين مُنشأين
- [ ] تسجيل الدخول يعمل
- [ ] الداشبورد يحمّل البيانات
- [ ] الفلاترة تعمل
- [ ] الإحصائيات تظهر
- [ ] الرسوم البيانية تعرض البيانات
- [ ] تصدير CSV يعمل
- [ ] الهاتف responsive
- [ ] Dark theme يعمل بشكل صحيح
- [ ] لا توجد أخطاء في Console

## 📞 الدعم والمساعدة

**إذا واجهت مشكلة:**

1. افتح Browser Console (F12)
2. انسخ رسالة الخطأ بالكاملة
3. تحقق من Network tab لمعرفة الطلبات الفاشلة
4. تأكد من اتصالك بـ Supabase

**روابط مفيدة:**
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Chart.js Docs](https://www.chartjs.org/docs)

---

**آخر تحديث:** سبتمبر 2026
**النسخة:** 1.0.0 - الإطلاق الأول
