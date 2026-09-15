# تحديث حفظ تقرير المناديب غير المستجيبين

**التاريخ**: 28 يونيو 2026

## التغييرات المنفذة

### المشكلة السابقة
- كان ملف "المناديب غير المستجيبين" يُنشأ كملف مؤقت فقط
- يتم إرفاقه بالإيميل ثم حذفه من الدرايف
- لا توجد نسخة محفوظة للرجوع إليها لاحقاً
- لا يوجد لينك سريع للوصول للملف

### الحل المطبق
تم تعديل دالة `sendDailyStatusReport()` في `/procsess/Code.gs`:

#### التعديلات:
1. **نقل الملف لفولدر التقارير** قبل تحويله إلى blob:
   ```javascript
   // نقل الملف لفولدر التقارير أولاً
   const reportFile = DriveApp.getFileById(tempSs.getId());
   const reportsFolder = DriveApp.getFolderById(REPORTS_FOLDER_ID);
   reportFile.moveTo(reportsFolder);
   
   // الحصول على لينك الملف
   fileUrl = reportFile.getUrl();
   ```

2. **إضافة زر في الإيميل** لفتح الملف مباشرة:
   ```javascript
   if (fileUrl) {
     emailBody += `
       <div style="margin-top: 30px; text-align: center;">
         <a href="${fileUrl}" style="...">
           📄 فتح ملف المناديب غير المستجيبين
         </a>
       </div>`;
   }
   ```

3. **الحفاظ على الملف** بدلاً من حذفه:
   - إزالة: `DriveApp.getFileById(tempSs.getId()).setTrashed(true);`
   - إضافة ملاحظة: "الملف محفوظ في فولدر التقارير ولن يتم حذفه"

### النتيجة
الآن الإيميل يحتوي على:
- ✅ جدول بالمناديب غير المستجيبين في نص الإيميل
- ✅ **زر أحمر لفتح الملف الكامل** على Google Sheets
- ✅ نسخة Excel مرفقة بالإيميل
- ✅ الملف محفوظ في فولدر التقارير للرجوع إليه

### تفاصيل الحفظ
- **المكان**: فولدر التقارير `1fza2_8FQ9G74lP-WRPEI6Ut18cckGvah`
- **اسم الملف**: `قائمة المناديب غير المستجيبين - yyyy-MM-dd`
- **الصيغة**: Google Sheets (قابل للفتح مباشرة)
- **الإرفاق**: نسخة Excel للتحميل

### الفولدرات المنظمة
الآن جميع الملفات محفوظة في الأماكن الصحيحة:

```
📁 Calling System Project
├── 📁 all data merge → ملفات processed_orders_*
├── 📁 طلبات مدموج → ملفات من تاب إضافة الطلبات
├── 📁 returns → ملفات المرتجعات
└── 📁 تقارير (1fza2_8FQ9G74lP-WRPEI6Ut18cckGvah)
    ├── تقارير البيانات
    └── قوائم المناديب غير المستجيبين
```

## الملفات المعدلة
- `/Users/almot7da2024/Desktop/Calling_System/procsess/Code.gs`

## الاعتمادية
- `REPORTS_FOLDER_ID` محدد في بداية الملف: `'1fza2_8FQ9G74lP-WRPEI6Ut18cckGvah'`
