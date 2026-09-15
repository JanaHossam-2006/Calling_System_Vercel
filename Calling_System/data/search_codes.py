import pandas as pd
import glob
import os

# الأكواد المطلوب البحث عنها
codes_string = "3531280354834335703143570298357029435653323545176N3569512356950935684203567266356717535764413576317357585635757553574330357283135703303570326356982935697253569718356951235695093569335356823935672983567286356727235672663567216356515735651503565149355811335830353571155357091035653313583269358326635768983570265357026335642813509927N35769323576931357032035703143570294"

# استخراج الأكواد (كل 7 أرقام هو كود)
import re
codes_list = re.findall(r'\d{7}', codes_string)
print(f"عدد الأكواد المطلوب البحث عنها: {len(codes_list)}")
print(f"أول 10 أكواد: {codes_list[:10]}")
print(f"آخر 10 أكواد: {codes_list[-10:]}\n")

# الحصول على جميع ملفات Excel
excel_files = glob.glob("MyOrders_*.xlsx")
print(f"عدد ملفات Excel الموجودة: {len(excel_files)}")
print(f"الملفات: {excel_files}\n")

# قائمة لتخزين جميع الصفوف المطابقة
all_matching_rows = []

# البحث في كل ملف
for file in excel_files:
    print(f"جاري البحث في الملف: {file}")
    try:
        df = pd.read_excel(file)
        
        # التأكد من وجود عمود "الكود"
        if 'الكود' in df.columns:
            # تحويل عمود الكود إلى نص للمقارنة
            df['الكود'] = df['الكود'].astype(str)
            
            # البحث عن الصفوف التي تحتوي على أي من الأكواد
            matching_rows = df[df['الكود'].isin(codes_list)]
            
            if not matching_rows.empty:
                # إضافة عمود لاسم الملف المصدر
                matching_rows = matching_rows.copy()
                matching_rows['الملف المصدر'] = file
                all_matching_rows.append(matching_rows)
                print(f"  ✓ تم العثور على {len(matching_rows)} صف مطابق")
            else:
                print(f"  ✗ لم يتم العثور على أي صفوف مطابقة")
        else:
            print(f"  ⚠ عمود 'الكود' غير موجود في هذا الملف")
    
    except Exception as e:
        print(f"  ✗ خطأ في قراءة الملف: {e}")

# دمج جميع النتائج
if all_matching_rows:
    final_df = pd.concat(all_matching_rows, ignore_index=True)
    
    # حفظ النتائج في ملف Excel جديد
    output_file = "نتائج_البحث_عن_الأكواد.xlsx"
    final_df.to_excel(output_file, index=False, engine='openpyxl')
    
    print(f"\n{'='*60}")
    print(f"✓ تم العثور على إجمالي {len(final_df)} صف مطابق")
    print(f"✓ تم حفظ النتائج في الملف: {output_file}")
    print(f"{'='*60}\n")
    
    # عرض ملخص للأكواد التي تم العثور عليها
    found_codes = final_df['الكود'].unique()
    print(f"الأكواد التي تم العثور عليها ({len(found_codes)}):")
    for code in found_codes:
        count = len(final_df[final_df['الكود'] == code])
        print(f"  - {code}: {count} صف")
    
    # الأكواد التي لم يتم العثور عليها
    not_found_codes = [code for code in codes_list if code not in found_codes]
    if not_found_codes:
        print(f"\nالأكواد التي لم يتم العثور عليها ({len(not_found_codes)}):")
        for code in not_found_codes:
            print(f"  - {code}")
else:
    print("\n✗ لم يتم العثور على أي صفوف مطابقة في جميع الملفات")
