# ميزة معالجة الطلبات - Orders Processing Feature

## التاريخ
25 يونيو 2026

## الوصف
تم إضافة ميزة "معالجة الطلبات" في تاب "معالجة التسليمات" لدمج جميع ملفات Excel من فولدر الطلبات في ملف واحد موحد.

## الموقع
- **المسار**: `/Users/almot7da2024/Desktop/Calling_System/procsess/`
- **الملفات المعدلة**:
  - `index.html` - إضافة واجهة معالجة الطلبات
  - `Code.gs` - دالة `processOrdersFiles()`

## الوظيفة

### 1. معالجة الملفات
- يقرأ جميع ملفات Excel من الفولدر: `1yJ-AhySrkZ5e9e3OXlHDVAQubDWW6vxr`
- يتجاهل:
  - المجلدات
  - الملفات التي تبدأ بـ `processed_` (الملفات الناتجة سابقاً)
- يدعم:
  - Google Sheets الأصلية
  - ملفات Excel (.xlsx, .xls)

### 2. ترتيب الأعمدة
الأعمدة بالترتيب **النهائي المطلوب**:

#### الأعمدة الأساسية (أول 6 أعمدة):
1. **الكود** - كود الطلب
2. **رقم المستلم1** - رقم العميل
3. **رقم المندوب** - رقم هاتف المندوب
4. **محتوى الطرد** - وصف المنتج
5. **المطلوب تحصيله** - السعر/المبلغ
6. **المتجر** - يُضاف تلقائياً حسب محتوى الطرد ✨

#### باقي التفاصيل (آخر 7 أعمدة):
7. المندوب - اسم المندوب
8. تاريخ التسليم
9. حالة العميل
10. المدينة
11. المنطقة
12. العنوان
13. ملاحظات الطرد

> **الترتيب النهائي**: الكود → العميل → رقم المندوب → المنتج → السعر → **المتجر** → باقي التفاصيل.

### 3. تحديد المتجر التلقائي
- يستخدم دالة `تحديد_المتجر(محتوى الطرد)`
- يبحث عن كلمات مفتاحية في وصف المنتج
- يحدد المتجر بناءً على البيانات المحفوظة في النظام

### 4. حفظ النتيجة
- **اسم الملف**: `processed_orders_yyyy-MM-dd_HHmmss`
- **الموقع**: نفس فولدر الطلبات المصدر
- **التنسيق**:
  - الصف الأول: عناوين الأعمدة (bold + خلفية رمادية)
  - تجميد الصف الأول
  - تعديل عرض الأعمدة تلقائياً

## الواجهة (UI)

### في تاب "معالجة التسليمات"
تم إضافة قسم جديد بعنوان "معالجة الطلبات" يحتوي على:

#### 1. صندوق معلومات (Info Box)
يشرح خطوات المعالجة:
- قراءة جميع ملفات Excel من الفولدر
- دمج البيانات في ملف واحد
- إضافة عمود "المتجر" تلقائياً
- ترتيب الأعمدة
- حفظ الملف الناتج

#### 2. زر المعالجة
- **النص**: "معالجة ودمج الطلبات"
- **الأيقونة**: `ri-play-circle-line`
- **اللون**: أخضر (success)
- **الوظيفة**: `processOrders()`

#### 3. زر تفريغ الفولدر
- **النص**: "تفريغ الفولدر"
- **الأيقونة**: `ri-delete-bin-line`
- **اللون**: أحمر (danger)
- **الوظيفة**: `clearOrdersFolder()`
- **التأكيد**: يطلب تأكيد من المستخدم قبل الحذف

#### 4. منطقة النتائج
- تعرض:
  - عدد الملفات المعالجة
  - إجمالي الطلبات
  - اسم الملف الناتج
  - رابط لفتح الملف مباشرة

## كود JavaScript

```javascript
function processOrders() {
    // تأكيد من المستخدم
    if (!confirm('هل أنت متأكدة من معالجة ودمج جميع ملفات الطلبات؟')) return;
    
    // عرض Loading
    showLoading();
    document.getElementById('ordersProcessResult').innerHTML = 
        '<div class="loading-message">جاري معالجة الملفات ودمجها...</div>';
    
    // استدعاء الدالة من Code.gs
    google.script.run
        .withSuccessHandler(function(result) {
            hideLoading();
            if (result.success) {
                // عرض النتيجة مع رابط الملف
                let html = '<div class="success-message">' + 
                          result.message.replace(/\n/g, '<br>') + '</div>';
                if (result.fileUrl) {
                    html += '<div class="file-link-container">';
                    html += '<a href="' + result.fileUrl + '" target="_blank" class="file-link">';
                    html += '<i class="ri-file-excel-line"></i> فتح الملف: ' + result.fileName;
                    html += '</a></div>';
                }
                document.getElementById('ordersProcessResult').innerHTML = html;
            } else {
                showResult('ordersProcessResult', result);
            }
        })
        .withFailureHandler(function(error) {
            hideLoading();
            showResult('ordersProcessResult', { 
                success: false, 
                message: 'حدث خطأ: ' + error.message 
            });
        })
        .processOrdersFiles();
}

function clearOrdersFolder() {
    // تأكيد مزدوج من المستخدم
    if (!confirm('هل أنت متأكدة من مسح جميع الملفات في فولدر الطلبات؟\n\nهذا الإجراء لا يمكن التراجع عنه!')) return;
    
    // عرض Loading
    showLoading();
    document.getElementById('ordersProcessResult').innerHTML = 
        '<div class="loading-message">جاري تفريغ الفولدر...</div>';
    
    // استدعاء الدالة من Code.gs
    google.script.run
        .withSuccessHandler(function(result) {
            hideLoading();
            showResult('ordersProcessResult', result);
        })
        .withFailureHandler(function(error) {
            hideLoading();
            showResult('ordersProcessResult', { 
                success: false, 
                message: 'حدث خطأ: ' + error.message 
            });
        })
        .clearOrdersFolder();
}
```

## كود Google Apps Script (Code.gs)

### المتغير الثابت
```javascript
const ORDERS_FOLDER_ID = '1yJ-AhySrkZ5e9e3OXlHDVAQubDWW6vxr';
```

### الدالة الرئيسية
```javascript
function processOrdersFiles() {
  // 1. فتح الفولدر وقراءة الملفات
  // 2. معالجة كل ملف واستخراج البيانات
  // 3. إضافة عمود المتجر لكل طلب
  // 4. دمج جميع الطلبات في array واحد
  // 5. إنشاء ملف جديد بالترتيب المطلوب
  // 6. حفظ الملف في نفس الفولدر
  // 7. إرجاع النتيجة مع رابط الملف
}

function clearOrdersFolder() {
  // 1. فتح الفولدر
  // 2. حذف جميع الملفات (نقل للسلة)
  // 3. إرجاع عدد الملفات المحذوفة
}
```

## معالجة الأخطاء
- إذا لم يتم العثور على ملفات: رسالة خطأ
- إذا لم يتم العثور على طلبات: رسالة خطأ
- الملفات التالفة: يتم تجاهلها والاستمرار
- الملفات المؤقتة: يتم حذفها تلقائياً بعد المعالجة

## الاختبار
للاختبار:
1. ضع ملفات Excel في الفولدر: `1yJ-AhySrkZ5e9e3OXlHDVAQubDWW6vxr`
2. افتح تاب "معالجة التسليمات"
3. اذهب لقسم "معالجة الطلبات"
4. اضغط "معالجة ودمج الطلبات"
5. تحقق من الملف الناتج في نفس الفولدر

## الملاحظات
- الملفات الناتجة تبدأ بـ `processed_` لتجنب معالجتها مرة أخرى
- عمود "المتجر" يُضاف آخر عمود
- يتم الاحتفاظ بالطلبات التي لها كود فقط (تجاهل الصفوف الفارغة)
- Timestamp في اسم الملف لتجنب التكرار

## التحديثات المستقبلية المقترحة
- [ ] إضافة خيار تصفية حسب التاريخ
- [ ] إضافة خيار اختيار ملفات محددة للمعالجة
- [ ] إضافة إحصائيات تفصيلية (عدد الطلبات لكل متجر)
- [ ] إضافة خيار تصدير للملف الناتج بصيغ مختلفة
