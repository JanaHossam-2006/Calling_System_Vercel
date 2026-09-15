function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('إدارة الطلبات')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * دالة إعداد قاعدة البيانات
 * تنشئ شيت البيانات وشيت المستخدمين بالأعمدة المطلوبة
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. شيت البيانات الأساسية
  let dataSheet = ss.getSheetByName('البيانات');
  if (!dataSheet) {
    dataSheet = ss.insertSheet('البيانات');
  }
  
  const dataHeaders = [
    'الاسم', 'كود الطلب', 'رقم العميل', 'رقم المندوب', 'اسم المنتج', 
    'السعر', 'المتجر', 'ملاحظة', 'عدد مرات الاتصال', 'الحالة - العميل', 
    'أكثر من 5 محاولات', 'ملاحظة - العميل', 'الحالة - الشحنه', 'ملاحظة - المندوب', 'التاريخ',
    '', '', '', '', '', 'حالة المرتجع', 'تبليغ المسؤول', 'ملاحظه المسؤول'
  ];
  
  dataSheet.getRange(1, 1, 1, dataHeaders.length).setValues([dataHeaders]);
  dataSheet.getRange(1, 1, 1, dataHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
  dataSheet.setFrozenRows(1);
  
  // تنسيق أعمدة الأرقام كـ Plain Text تلقائياً لمنع تحويلها لتواريخ
  const phoneCol = 3; // رقم العميل (العمود C)
  const repCol = 4;   // رقم المندوب (العمود D)
  const maxRows = Math.max(dataSheet.getMaxRows(), 1000); // نضمن تنسيق 1000 صف على الأقل
  
  dataSheet.getRange(2, phoneCol, maxRows - 1, 1).setNumberFormat('@STRING@'); // @ = Plain Text
  dataSheet.getRange(2, repCol, maxRows - 1, 1).setNumberFormat('@STRING@');
  
  // إضافة بيانات تجريبية إذا كان الشيت فارغاً
  if (dataSheet.getLastRow() === 1) {
    const dummyData = [
      ["Jana Hossam", "LOG-1001", "01011112222", "01122223333", "لابتوب ديل", "15000", "متجر التقنية", "مستعجل جداً", 0, "", "", "", "", "", "24/04/2026 03:28:41"]
    ];
    dataSheet.getRange(2, 1, dummyData.length, dataHeaders.length).setValues(dummyData);
  }

  // 2. شيت المستخدمين
  let usersSheet = ss.getSheetByName('المستخدمين');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('المستخدمين');
  }
  
  const usersHeaders = ['الاسم', 'الباسورد', 'الدور', 'المتاجر المتاحة', 'الايميل', 'الهاتف', 'تاريخ الإضافة'];
  usersSheet.getRange(1, 1, 1, usersHeaders.length).setValues([usersHeaders]);
  usersSheet.getRange(1, 1, 1, usersHeaders.length).setFontWeight("bold").setBackground("#f3f3f3");
  usersSheet.setFrozenRows(1);

  // إضافة مستخدم تجريبي إذا كان الشيت فارغاً
  if (usersSheet.getLastRow() === 1) {
    usersSheet.getRange(2, 1, 1, 3).setValues([["admin", "123456", "admin"]]);
  }
  
  return "تم إعداد الجداول بنجاح (البيانات، المستخدمين)!";
}

/**
 * دالة تلقائية لضبط تنسيق أعمدة الأرقام عند إضافة بيانات جديدة
 * تمنع تحويل أرقام الموبايل لتواريخ
 */
function autoFormatPhoneColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('البيانات');
  if (!dataSheet) return;
  
  const phoneCol = 3; // رقم العميل (العمود C)
  const repCol = 4;   // رقم المندوب (العمود D)
  const lastRow = dataSheet.getLastRow();
  
  if (lastRow > 1) {
    // تنسيق جميع الصفوف الموجودة + 100 صف إضافي للمستقبل
    const rowsToFormat = lastRow + 100;
    dataSheet.getRange(2, phoneCol, rowsToFormat - 1, 1).setNumberFormat('@STRING@');
    dataSheet.getRange(2, repCol, rowsToFormat - 1, 1).setNumberFormat('@STRING@');
  }
}

/**
 * Trigger تلقائي يشتغل عند فتح الملف
 * يضمن أن الأعمدة منسقة صح دائماً
 */
function onOpen() {
  autoFormatPhoneColumns();
  
  // إضافة قائمة مخصصة للإدارة
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('إدارة النظام')
      .addItem('إعداد قاعدة البيانات', 'setupDatabase')
      .addItem('إصلاح تنسيق الأرقام', 'autoFormatPhoneColumns')
      .addToUi();
}

/**
 * Trigger تلقائي يشتغل عند التعديل في الشيت
 * يضبط تنسيق الأرقام المضافة حديثاً
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  
  // نشتغل فقط على شيت "البيانات"
  if (sheet.getName() !== 'البيانات') return;
  
  const range = e.range;
  const col = range.getColumn();
  
  // إذا التعديل في عمود رقم العميل (3) أو رقم المندوب (4)
  if (col === 3 || col === 4) {
    // نضبط تنسيق الخلية المعدلة
    range.setNumberFormat('@STRING@');
    
    // نتأكد من أن القيمة نص وليست رقم
    const value = range.getValue();
    if (value && typeof value !== 'string') {
      range.setValue(value.toString());
    }
  }
}

/**
 * دالة للتحقق من بيانات الدخول
 * ترجع: 'admin' أو 'employee' أو false
 */
function authenticateUser(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('المستخدمين');
  if (!sheet) return false;
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const COL_NAME = headers.indexOf('الاسم');
  const COL_PASS = headers.indexOf('الباسورد');
  const COL_ROLE = headers.indexOf('الدور');
  const COL_STORES = headers.indexOf('المتاجر المتاحة');
  
  if (COL_NAME === -1 || COL_PASS === -1) return false;

  for (let i = 1; i < data.length; i++) {
    const rowUser = (data[i][COL_NAME] || '').toString().trim();
    const rowPass = (data[i][COL_PASS] || '').toString().trim();
    
    if (rowUser.toLowerCase() === username.trim().toLowerCase() && rowPass === password) {
      const roleValue = (COL_ROLE !== -1 && data[i][COL_ROLE]) ? data[i][COL_ROLE].toString().trim().toLowerCase() : 'employee';
      let availableStores = [];
      
      if (roleValue === 'store') {
        const storesStr = (COL_STORES !== -1 && data[i][COL_STORES]) ? data[i][COL_STORES].toString().trim() : '';
        if (storesStr) {
          availableStores = storesStr.split('-').map(s => s.trim()).filter(s => s !== '');
        } else {
          // إذا كان العمود فارغاً، نفترض أن اسم المتجر هو نفس اسم المستخدم
          availableStores = [username.trim()];
        }
      }
      
      return {
        role: roleValue,
        availableStores: availableStores
      };
    }
  }
  
  return false;
}

/**
 * جلب بيانات الطلبات الخاصة بموظف أو متجر معين
 * 
 * ملاحظة مهمة: في Google Sheets، تأكد من أن أعمدة "رقم العميل" و"رقم المندوب" 
 * منسقة كـ "نص عادي" (Plain Text) وليس "رقم" (Number) لتجنب تحويلها لتواريخ.
 * لتغيير التنسيق: حدد العمود > Format > Number > Plain Text
 */
function getOrdersData(identifier, role) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const COL_EMP = 0;    // الاسم
  const COL_STORE = 6;  // المتجر
  const COL_STATUS = 9; // الحالة - العميل
  
  const orders = [];
  const targetId = identifier.trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let isMatch = false;
    
    if (role === 'employee') {
      isMatch = row[COL_EMP].toString().trim().toLowerCase() === targetId;
    } else if (role === 'store') {
      const currentStatus = row[COL_STATUS].toString().trim();
      isMatch = row[COL_STORE].toString().trim().toLowerCase() === targetId && 
                (currentStatus === "رد و يستلم" || currentStatus === "استبدال");
    }
    
    if (isMatch) {
      let order = {};
      for (let j = 0; j < headers.length; j++) {
        let val = row[j];
        
        // معالجة خاصة لأرقام العميل والمندوب لمنع تحويلها لـ Date
        if (headers[j] === 'رقم العميل' || headers[j] === 'رقم المندوب') {
          if (val instanceof Date) {
            // إذا تحول الرقم لـ Date بالغلط، نرجعه لرقم
            val = val.toString().replace(/[^0-9]/g, '');
          } else if (val) {
            val = val.toString().trim();
          }
          // إضافة 0 في البداية إذا كان مفقود
          if (val && !val.startsWith('0') && /^\d+$/.test(val)) {
            val = '0' + val;
          }
        } else if (val instanceof Date) {
          // معالجة التواريخ العادية
          const pad = (n) => n.toString().padStart(2, '0');
          val = `${pad(val.getDate())}/${pad(val.getMonth() + 1)}/${val.getFullYear()} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}`;
        }
        
        order[headers[j]] = val !== undefined ? val : "";
      }
      
      // جلب الملاحظة والحالة من الأعمدة V و W (الفهرس 21 و 22)
      order['تبليغ المسؤول'] = row[21] !== undefined ? row[21] : '';
      order['ملاحظه المسؤول'] = row[22] !== undefined ? row[22] : '';
      
      order.id = "order_" + i;
      order._rowIndex = i + 1;
      orders.push(order);
    }
  }
  
  // ترتيب الطلبات للمتاجر حسب التاريخ (من الأقدم للأحدث)
  // التاريخ لا يتغير عند تحديث "تم" أو "لم يتم" من مسؤول المتجر
  if (role === 'store') {
    orders.sort((a, b) => {
      const parseDate = (s) => {
        if (!s || typeof s !== 'string') return 0;
        const parts = s.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return 0;
        const timeParts = parts[1] ? parts[1].split(':') : [0,0,0];
        return new Date(dateParts[2], dateParts[1]-1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]||0).getTime();
      };
      return parseDate(a['التاريخ']) - parseDate(b['التاريخ']);
    });
  }
  
  return orders;
}

/**
 * تحديث بيانات طلب موجود في الشيت
 * الإصلاح: التحقق من صحة الصف أولاً ثم الكتابة مرة واحدة لمنع تكرار الصفوف
 */
function updateOrderData(updatedOrder) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
  if (!sheet) return false;
  
  const rowIndex = updatedOrder._rowIndex;
  if (!rowIndex) return false;
  
  const lastRow = sheet.getLastRow();
  if (rowIndex < 2 || rowIndex > lastRow) return false;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // ===== التحقق: تأكد أن كود الطلب في الشيت يطابق الطلب المراد تعديله =====
  // هذا يمنع الكتابة فوق صف خاطئ في حالة تغيّرت الشيت (إضافة صفوف جديدة بينما الموظفة كانت شغّالة)
  const COL_CODE = headers.indexOf('كود الطلب');
  if (COL_CODE >= 0) {
    const sheetCodeRaw = sheet.getRange(rowIndex, COL_CODE + 1).getValue();
    const sheetCode = sheetCodeRaw ? sheetCodeRaw.toString().replace(/^'+/, '').trim() : '';
    const orderCode = (updatedOrder['كود الطلب'] || '').toString().replace(/^'+/, '').trim();
    if (sheetCode && orderCode && sheetCode !== orderCode) {
      // الكود لا يطابق → ابحث عن الصف الصحيح
      const allData = sheet.getRange(2, COL_CODE + 1, lastRow - 1, 1).getValues();
      let correctRow = -1;
      for (let i = 0; i < allData.length; i++) {
        const c = (allData[i][0] || '').toString().replace(/^'+/, '').trim();
        if (c === orderCode) { correctRow = i + 2; break; }
      }
      if (correctRow === -1) return false; // الكود غير موجود في الشيت
      // تحديث _rowIndex الصحيح
      updatedOrder._rowIndex = correctRow;
    }
  }
  
  const finalRowIndex = updatedOrder._rowIndex;
  
  // ===== كتابة الصف كله مرة واحدة بـ setValues لمنع التداخل =====
  const currentRow = sheet.getRange(finalRowIndex, 1, 1, headers.length).getValues()[0];
  
  for (let j = 0; j < headers.length; j++) {
    const key = headers[j];
    if (updatedOrder[key] !== undefined) {
      let val = updatedOrder[key];
      if (val !== '' && (key === 'كود الطلب' || key === 'رقم العميل' || key === 'رقم المندوب')) {
        val = "'" + val.toString().replace(/^'+/, '');
      }
      currentRow[j] = val;
    }
  }
  
  sheet.getRange(finalRowIndex, 1, 1, headers.length).setValues([currentRow]);
  
  return true;
}

/**
 * تحديث بيانات طلب أرشيفي في الشيت الخارجي
 * الطلبات الأرشيفية محفوظة في جدول Google Sheets خارجي
 */
function updateArchivedOrderData(updatedOrder) {
  try {
    const histSs = SpreadsheetApp.openById("1ojBjcoKxX0yqzU_clFRPND6YWbBf6NFBWGlwObR1_tw");
    const histSheet = histSs.getSheetByName("Data");
    if (!histSheet) return false;
    
    const rowIndex = updatedOrder._rowIndex;
    if (!rowIndex) return false;
    
    const lastRow = histSheet.getLastRow();
    if (rowIndex < 2 || rowIndex > lastRow) return false;
    
    const headers = histSheet.getRange(1, 1, 1, histSheet.getLastColumn()).getValues()[0];
    
    // تحقق من أن كود الطلب يطابق
    const COL_CODE = headers.indexOf('كود الطلب');
    if (COL_CODE >= 0) {
      const sheetCodeRaw = histSheet.getRange(rowIndex, COL_CODE + 1).getValue();
      const sheetCode = sheetCodeRaw ? sheetCodeRaw.toString().replace(/^'+/, '').trim() : '';
      const orderCode = (updatedOrder['كود الطلب'] || '').toString().replace(/^'+/, '').trim();
      if (sheetCode && orderCode && sheetCode !== orderCode) {
        // ابحث عن الصف الصحيح
        const allData = histSheet.getRange(2, COL_CODE + 1, lastRow - 1, 1).getValues();
        let correctRow = -1;
        for (let i = 0; i < allData.length; i++) {
          const c = (allData[i][0] || '').toString().replace(/^'+/, '').trim();
          if (c === orderCode) { correctRow = i + 2; break; }
        }
        if (correctRow === -1) return false;
        updatedOrder._rowIndex = correctRow;
      }
    }
    
    const finalRowIndex = updatedOrder._rowIndex;
    const currentRow = histSheet.getRange(finalRowIndex, 1, 1, headers.length).getValues()[0];
    
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      if (updatedOrder[key] !== undefined) {
        let val = updatedOrder[key];
        if (val !== '' && (key === 'كود الطلب' || key === 'رقم العميل' || key === 'رقم المندوب')) {
          val = "'" + val.toString().replace(/^'+/, '');
        }
        currentRow[j] = val;
      }
    }
    
    histSheet.getRange(finalRowIndex, 1, 1, headers.length).setValues([currentRow]);
    return true;
  } catch (e) {
    Logger.log("خطأ في تحديث الطلب الأرشيفي: " + e.toString());
    return false;
  }
}

// ===============================
// لوحة إحصائيات المدير
// ===============================
function getAdminDashboardData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
    if (!sheet) return { success: false, message: 'لم يتم العثور على شيت "البيانات".' };

    // قراءة القيم الظاهرة (Display Values) لضمان مطابقة الوقت لما يظهر في الشيت
    const displayData = sheet.getDataRange().getDisplayValues();
    if (displayData.length <= 1) return { success: false, message: 'لا توجد بيانات حالياً.' };

    const headers = displayData[0];
    const idx = (name, fallback) => { const i = headers.indexOf(name); return i >= 0 ? i : fallback; };

    const COL_NAME   = idx('الاسم', 0);
    const COL_CODE   = idx('كود الطلب', 1);
    const COL_PHONE  = idx('رقم العميل', 2);
    const COL_REP    = idx('رقم المندوب', 3);
    const COL_STORE  = idx('المتجر', 6);
    const COL_ADMIN_NOTE = idx('ملاحظة', 7);
    const COL_TRIES  = idx('عدد مرات الاتصال', 8);
    const COL_STATUS = idx('الحالة - العميل', 9);
    const COL_CLIENT_NOTE = idx('ملاحظة - العميل', 10);
    const COL_AGENT_NOTE  = idx('ملاحظة - المندوب', 11);
    const COL_SHIP_STATUS = idx('الحالة - الشحنه', 12);
    const COL_DATE   = idx('التاريخ', 14);
    const COL_RETURN_STATUS = idx('حالة المرتجع', 20);
    const COL_REPORT = idx('تبليغ المسؤول', 21);
    const COL_STORE_NOTE = idx('ملاحظه المسؤول', 22);

    // دالة مساعدة لإضافة أصفار في البداية
    const pad = (n) => String(n).padStart(2, '0');
    
    // دالة لتنظيف أرقام الموبايل من أي تحويل خاطئ
    const cleanPhoneNumber = (val) => {
      if (!val) return '';
      const s = val.toString().trim();
      // إذا كان الرقم يحتوي على تاريخ (مثل "Invalid Date" أو تنسيق تاريخ)
      if (s.includes('/') || s.toLowerCase().includes('date') || s.toLowerCase().includes('invalid')) {
        return '';
      }
      // إزالة أي أحرف غير رقمية
      const cleaned = s.replace(/[^0-9]/g, '');
      // إضافة 0 في البداية إذا كان مفقود
      if (cleaned && !cleaned.startsWith('0') && /^\d+$/.test(cleaned)) {
        return '0' + cleaned;
      }
      return cleaned;
    };

    function fmtDateLibya(val) {
      const pad = (n) => String(n).padStart(2, '0');
      if (!val) return '—';
      const s = val.toString().trim();
      if (!s) return '—';
      // إذا كان يحتوي على توقيت كامل، نكتفي بالساعة والدقيقة
      if (s.includes(':')) {
        const parts = s.split(' ');
        if (parts.length >= 2) {
          const timeParts = parts[1].split(':');
          return `${parts[0]} ${pad(timeParts[0])}:${pad(timeParts[1])}`;
        }
      }
      return s;
    }

    function toTs(val) {
      const pad = (n) => String(n).padStart(2, '0');
      if (!val) return null;
      const s = val.toString().trim();
      if (!s || s === '—') return null;
      
      // التنسيق المتوقع: DD/MM/YYYY HH:mm:ss
      if (s.includes('/')) {
        const parts = s.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
          const timeParts = parts[1] ? parts[1].split(':') : ["00", "00", "00"];
          // بناء ISO مع فرض توقيت ليبيا
          const iso = `${dateParts[2]}-${pad(dateParts[1])}-${pad(dateParts[0])}T${pad(timeParts[0])}:${pad(timeParts[1])}:${pad(timeParts[2]||'00')}+02:00`;
          const d = new Date(iso);
          return isNaN(d.getTime()) ? null : d.getTime();
        }
      }
      return null;
    }

    const empMap = {}, globalStores = {}, globalStatus = {};
    let totalOrders = 0, globalReady = 0, globalCancelled = 0;
    const allOrdersList = [];

    // تم نقل COL_STORE_NOTE إلى السطر 291

    for (let i = 1; i < displayData.length; i++) {
      const row    = displayData[i];
      const name   = row[COL_NAME].trim();
      const code   = row[COL_CODE].trim();
      const phone  = cleanPhoneNumber(row[COL_PHONE]);
      const repPhone = cleanPhoneNumber(row[COL_REP]);
      const store  = row[COL_STORE].trim() || 'غير محدد';
      const statusRaw = row[COL_STATUS].trim();
      const status = statusRaw || 'بدون حالة';
      const shipStatus = row[COL_SHIP_STATUS].trim();
      const adminNote = row[COL_ADMIN_NOTE].trim();
      const tries  = parseInt(row[COL_TRIES]) || 0;
      const rawDateStr = row[COL_DATE];
      const storeReport = row[COL_REPORT] ? row[COL_REPORT].trim() : '';
      const storeNote = row[COL_STORE_NOTE] ? row[COL_STORE_NOTE].trim() : '';
      const clientNote = row[COL_CLIENT_NOTE] ? row[COL_CLIENT_NOTE].trim() : '';
      const agentNote = row[COL_AGENT_NOTE] ? row[COL_AGENT_NOTE].trim() : '';
      
      if (!name) continue;
      totalOrders++;

      // إضافة الطلبية للقائمة الكاملة للمديرة
      allOrdersList.push({
        id: "admin_" + i,
        "الاسم": name,
        "كود الطلب": code,
        "رقم العميل": phone,
        "رقم المندوب": repPhone,
        "اسم المنتج": row[COL_REP + 1] || '', // تقديري بناءً على headers
        "السعر": row[COL_REP + 2] || '',
        "المتجر": store,
        "ملاحظة": adminNote,
        "ملاحظة - العميل": clientNote,
        "ملاحظة - المندوب": agentNote,
        "الحالة - العميل": statusRaw,
        "الحالة - الشحنه": shipStatus,
        "التاريخ": rawDateStr,
        "تبليغ المسؤول": storeReport,
        "ملاحظه المسؤول": storeNote,
        "حالة المرتجع": row[COL_RETURN_STATUS] || ''
      });

      if (statusRaw === 'رد و يستلم') globalReady++;
      if (statusRaw === 'الغى الطلب') globalCancelled++;

      if (!empMap[name]) empMap[name] = { 
        orders:0, minTs:null, maxTs:null, minStr:null, maxStr:null, 
        statuses:{}, noAnswerTotal:0, noAnswerTries:0,
        pendingOrders: 0, pendingOrdersList: [],
        readyPendingShipment: 0, readyShipmentList: []
      };
      const emp = empMap[name];
      emp.orders++;

      const ts = toTs(rawDateStr);
      const ds = fmtDateLibya(rawDateStr);
      if (ts !== null) {
        if (emp.minTs === null || ts < emp.minTs) { emp.minTs = ts; emp.minStr = ds; }
        if (emp.maxTs === null || ts > emp.maxTs) { emp.maxTs = ts; emp.maxStr = ds; }
      }

      // إحصائيات المتاجر الموسعة للمديرة
      if (!globalStores[store]) globalStores[store] = { 
        count: 0, ready: 0, done: 0, notDone: 0, pending: 0, 
        oldestTs: null, oldestStr: '—',
        pendingNormal: 0, pendingReturned: 0, pendingPostponed: 0, pendingExchange: 0
      };
      const st = globalStores[store];
      st.count++;
      if (statusRaw === 'رد و يستلم' || statusRaw === 'استبدال') {
        st.ready++;
        // متابعة تبليغات المسؤول (تم، لم يتم، طلب جديد، إعادة إرسال)
        if (storeReport === 'لم يتم') {
          st.notDone++;
        } else if (storeReport !== '') {
          st.done++;
        } else {
          st.pending++;
          
          if (statusRaw === 'استبدال') {
            st.pendingExchange++;
          } else {
            const lowerNote = adminNote.toLowerCase();
            if (lowerNote.includes('مرتجع')) st.pendingReturned++;
            else if (lowerNote.includes('مؤجل')) st.pendingPostponed++;
            else st.pendingNormal++;
          }

          if (ts && (st.oldestTs === null || ts < st.oldestTs)) {
            st.oldestTs = ts;
            st.oldestStr = ds;
          }
        }
      }

      emp.statuses[status] = (emp.statuses[status] || 0) + 1;
      
      if (!statusRaw) {
        emp.pendingOrders++;
        emp.pendingOrdersList.push({ code, phone, rep: row[COL_REP], product: row[COL_REP + 1] || '', price: row[COL_REP + 2] || '', store, note: adminNote, noteClient: clientNote, noteAgent: agentNote, status: 'لم تفتح', shipStatus: '', date: rawDateStr });
      }
      if (statusRaw === 'رد و يستلم' && !shipStatus) {
        if (!adminNote.includes('مرتجع') && !adminNote.includes('مؤجل') && !adminNote.includes('مراجعه')) {
          emp.readyPendingShipment++;
          emp.readyShipmentList.push({ code, phone, rep: row[COL_REP], product: row[COL_REP + 1] || '', price: row[COL_REP + 2] || '', store, note: adminNote, noteClient: clientNote, noteAgent: agentNote, status: statusRaw, shipStatus: shipStatus, date: rawDateStr });
        }
      }

      if (status === 'لم يرد') { emp.noAnswerTotal++; emp.noAnswerTries += tries; }
      globalStatus[status] = (globalStatus[status] || 0) + 1;
    }

    const now = Date.now();
    const employees = Object.entries(empMap).map(([name, emp]) => {
      let duration = '—';
      if (emp.maxTs !== null) {
        const diffMs = now - emp.maxTs;
        const mins = Math.floor(diffMs / 60000);
        const hrs  = Math.floor(mins / 60);
        if (mins < 1) duration = "الآن";
        else duration = hrs > 0 ? `${hrs}س ${mins % 60}د` : `${mins}د`;
      }
      
      const avgNoAnswerTries = emp.noAnswerTotal > 0 ? (emp.noAnswerTries / emp.noAnswerTotal).toFixed(1) : 0;
      
      return { 
        name, orders: emp.orders, firstOrder: emp.minStr || '—', lastOrder: emp.maxStr || '—', duration, 
        statuses: emp.statuses, noAnswerTotal: emp.noAnswerTotal, avgNoAnswerTries,
        pendingOrders: emp.pendingOrders, pendingOrdersList: emp.pendingOrdersList,
        readyPendingShipment: emp.readyPendingShipment, readyShipmentList: emp.readyShipmentList
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));

    const stores = Object.entries(globalStores)
      .map(([store, info]) => ({
        store,
        count: info.count,
        ready: info.ready,
        readyPct: info.count > 0 ? Math.round((info.ready / info.count) * 100) : 0,
        done: info.done,
        notDone: info.notDone,
        pending: info.pending,
        oldestStr: info.oldestStr,
        pendingNormal: info.pendingNormal,
        pendingReturned: info.pendingReturned,
        pendingPostponed: info.pendingPostponed,
        pendingExchange: info.pendingExchange
      }))
      .sort((a, b) => a.store.localeCompare(b.store, 'ar'));

    const statuses = Object.entries(globalStatus)
      .sort((a,b)=>b[1]-a[1])
      .map(([status,count])=>({status,count,pct:totalOrders>0?Math.round(count/totalOrders*100):0}));

    // جلب بيانات المتابعة للرقابة
    const followUpSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('طلبات تحتاج متابعه');
    let followUpStats = [];
    if (followUpSheet) {
      const fuData = followUpSheet.getDataRange().getDisplayValues();
      if (fuData.length > 1) {
        const fuHeaders = fuData[0];
        const COL_FU_STORE = fuHeaders.indexOf('المتجر');
        const COL_FU_DONE = fuHeaders.indexOf('تم / لم يتم');
        const COL_FU_CLIENT_STATUS = fuHeaders.indexOf('الحالة - العميل');
        
        if (COL_FU_STORE !== -1 && COL_FU_DONE !== -1) {
          const fuMap = {};
          for (let i = 1; i < fuData.length; i++) {
            const row = fuData[i];
            const stName = row[COL_FU_STORE].trim();
            
            // تخطي الصفوف الفارغة (إذا كان اسم المتجر فارغاً)
            if (!stName) continue;
            
            const isDone = (row[COL_FU_DONE] || '').trim() === 'تم';
            const clientSt = (COL_FU_CLIENT_STATUS !== -1 ? row[COL_FU_CLIENT_STATUS] : '').trim() || 'لم يحدد';
            
            if (!fuMap[stName]) fuMap[stName] = { done: 0, pending: 0, doneDetails: {}, pendingDetails: {} };
            
            if (isDone) {
              fuMap[stName].done++;
              fuMap[stName].doneDetails[clientSt] = (fuMap[stName].doneDetails[clientSt] || 0) + 1;
            } else {
              fuMap[stName].pending++;
              fuMap[stName].pendingDetails[clientSt] = (fuMap[stName].pendingDetails[clientSt] || 0) + 1;
            }
          }
          
          followUpStats = Object.entries(fuMap).map(([store, info]) => ({
            store,
            done: info.done,
            pending: info.pending,
            doneDetails: info.doneDetails,
            pendingDetails: info.pendingDetails
          })).sort((a, b) => a.store.localeCompare(b.store, 'ar'));
        }
      }
    }

    return { 
      success: true, 
      totalOrders, 
      employeeCount: employees.length, 
      globalReady, 
      globalCancelled,
      employees, 
      stores, 
      statuses,
      allOrders: allOrdersList,
      followUpStats: followUpStats
    };

  } catch(e) {
    return { success: false, message: 'خطأ: ' + e.toString() };
  }
}



// ===============================
// بحث الموظفة (حالي + أرشيفي) - محسّن للسرعة
// ===============================
function employeeSearchOrders(employeeName, query) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
    if (!sheet) return { success: false, message: 'لم يتم العثور على شيت "البيانات".' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: 'لا توجد بيانات للبحث.' };

    const headers = data[0];
    const COL_NAME = headers.indexOf('الاسم');
    const COL_CODE = headers.indexOf('كود الطلب');
    const COL_PHONE = headers.indexOf('رقم العميل');

    const results = [];
    const q = query.toString().toLowerCase().trim();
    const targetName = employeeName.trim().toLowerCase();
    
    // دالة مساعدة لتنظيف الأرقام
    const cleanPhone = (val) => {
      if (!val) return '';
      const s = val.toString().trim();
      if (s.includes('/') || s.toLowerCase().includes('date')) return '';
      const cleaned = s.replace(/[^0-9]/g, '');
      if (cleaned && !cleaned.startsWith('0') && /^\d+$/.test(cleaned)) return '0' + cleaned;
      return cleaned;
    };

    // البحث السريع في البيانات الحالية (بدون loop كامل)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const empName = (row[COL_NAME] || '').toString().trim().toLowerCase();
      
      if (empName !== targetName) continue;
      
      const code = (row[COL_CODE] || '').toString().toLowerCase();
      const phone = cleanPhone(row[COL_PHONE]);

      // تحقق سريع: إذا كان البحث رقم، ابحث في الهاتف فقط. إذا كود، ابحث في الكود فقط
      let isMatch = false;
      if (/^\d+$/.test(q)) {
        isMatch = phone.includes(q);
      } else {
        isMatch = code.includes(q);
      }

      if (isMatch) {
        let order = {};
        for (let j = 0; j < headers.length; j++) {
          let val = row[j];
          
          if (headers[j] === 'رقم العميل' || headers[j] === 'رقم المندوب') {
            val = cleanPhone(val);
          } else if (val instanceof Date) {
            const pad = (n) => n.toString().padStart(2, '0');
            val = `${pad(val.getDate())}/${pad(val.getMonth() + 1)}/${val.getFullYear()} ${pad(val.getHours())}:${pad(val.getMinutes())}`;
          }
          
          order[headers[j]] = val !== undefined ? val : "";
        }
        order._rowIndex = i + 1;
        order.id = "emp_search_" + i;
        results.push(order);
      }
      
      // حد أقصى سريع: إذا لقينا 20 نتيجة، توقف
      if (results.length >= 20) return { success: true, results: results };
    }

    // البحث في الأرشيف فقط إذا لم نجد نتائج
    if (results.length === 0) {
      try {
        const histSs = SpreadsheetApp.openById("1ojBjcoKxX0yqzU_clFRPND6YWbBf6NFBWGlwObR1_tw");
        const histSheet = histSs.getSheetByName("Data");
        if (histSheet) {
          const histData = histSheet.getDataRange().getValues();
          if (histData.length > 1) {
            const histHeaders = histData[0];
            const histColName = histHeaders.indexOf('الاسم');
            const histColCode = histHeaders.indexOf('كود الطلب');
            const histColPhone = histHeaders.indexOf('رقم العميل');
            
            for (let i = 1; i < histData.length && results.length < 20; i++) {
              const row = histData[i];
              const empName = (row[histColName] || '').toString().trim().toLowerCase();
              
              if (empName !== targetName) continue;
              
              const code = (row[histColCode] || '').toString().toLowerCase();
              const phone = cleanPhone(row[histColPhone]);
              
              let isMatch = false;
              if (/^\d+$/.test(q)) {
                isMatch = phone.includes(q);
              } else {
                isMatch = code.includes(q);
              }
              
              if (isMatch) {
                let order = {};
                for (let j = 0; j < histHeaders.length; j++) {
                  let val = row[j];
                  
                  if (histHeaders[j] === 'رقم العميل' || histHeaders[j] === 'رقم المندوب') {
                    val = cleanPhone(val);
                  } else if (val instanceof Date) {
                    const pad = (n) => n.toString().padStart(2, '0');
                    val = `${pad(val.getDate())}/${pad(val.getMonth() + 1)}/${val.getFullYear()} ${pad(val.getHours())}:${pad(val.getMinutes())}`;
                  }
                  
                  order[histHeaders[j]] = val !== undefined ? val : "";
                }
                order.id = "emp_search_hist_" + i;
                order.isHistorical = true;
                results.push(order);
              }
            }
          }
        }
      } catch (histError) {
        Logger.log("خطأ في البحث الأرشيفي: " + histError.toString());
      }
    }

    return { success: true, results: results };

  } catch (e) {
    return { success: false, message: 'خطأ في البحث: ' + e.toString() };
  }
}

// ===============================
// بحث المدير الشامل
// ===============================
function adminSearchOrders(query) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
    if (!sheet) return { success: false, message: 'لم يتم العثور على شيت "البيانات".' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: 'لا توجد بيانات للبحث.' };

    const headers = data[0];
    const COL_CODE = headers.indexOf('كود الطلب');
    const COL_PHONE = headers.indexOf('رقم العميل');

    const results = [];
    const q = query.toString().toLowerCase().trim();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const code = (row[COL_CODE] || '').toString().toLowerCase();
      const phone = (row[COL_PHONE] || '').toString().toLowerCase();

      if (code.includes(q) || phone.includes(q)) {
        let order = {};
        for (let j = 0; j < headers.length; j++) {
          let val = row[j];
          
          // معالجة خاصة لأرقام العميل والمندوب
          if (headers[j] === 'رقم العميل' || headers[j] === 'رقم المندوب') {
            if (val instanceof Date) {
              // إذا تحول الرقم لـ Date بالغلط، نرجعه لرقم
              val = val.toString().replace(/[^0-9]/g, '');
            } else if (val) {
              val = val.toString().trim();
            }
            // إضافة 0 في البداية إذا كان مفقود
            if (val && !val.startsWith('0') && /^\d+$/.test(val)) {
              val = '0' + val;
            }
          } else if (val instanceof Date) {
            // معالجة التواريخ العادية
            const pad = (n) => n.toString().padStart(2, '0');
            val = `${pad(val.getDate())}/${pad(val.getMonth() + 1)}/${val.getFullYear()} ${pad(val.getHours())}:${pad(val.getMinutes())}`;
          }
          
          order[headers[j]] = val !== undefined ? val : "";
        }
        order._rowIndex = i + 1;
        order.id = "admin_search_" + i;
        results.push(order);
      }
    }

    if (results.length === 0) {
      try {
        const histSs = SpreadsheetApp.openById("1ojBjcoKxX0yqzU_clFRPND6YWbBf6NFBWGlwObR1_tw");
        const histSheet = histSs.getSheetByName("Data");
        if (histSheet) {
          const cells = histSheet.createTextFinder(q).matchEntireCell(false).findAll();
          if (cells.length > 0) {
            const histHeaders = histSheet.getRange(1, 1, 1, histSheet.getLastColumn()).getValues()[0];
            const histColCode = histHeaders.indexOf('كود الطلب');
            const histColPhone = histHeaders.indexOf('رقم العميل');
            
            const visitedRows = new Set();
            for (let c = 0; c < cells.length; c++) {
              const rowNum = cells[c].getRow();
              if (rowNum === 1 || visitedRows.has(rowNum)) continue;
              visitedRows.add(rowNum);
              
              if (visitedRows.size > 50) break; // للسلامة وتفادي البطء في حال كانت النتائج ضخمة جداً
              
              const row = histSheet.getRange(rowNum, 1, 1, histHeaders.length).getValues()[0];
              const code = (row[histColCode] || '').toString().toLowerCase();
              const phone = (row[histColPhone] || '').toString().toLowerCase();
              
              if ((histColCode !== -1 && code.includes(q)) || (histColPhone !== -1 && phone.includes(q))) {
                let order = {};
                for (let j = 0; j < histHeaders.length; j++) {
                  let val = row[j];
                  
                  if (histHeaders[j] === 'رقم العميل' || histHeaders[j] === 'رقم المندوب') {
                    if (val instanceof Date) {
                      val = val.toString().replace(/[^0-9]/g, '');
                    } else if (val) {
                      val = val.toString().trim();
                    }
                    if (val && !val.startsWith('0') && /^\d+$/.test(val)) {
                      val = '0' + val;
                    }
                  } else if (val instanceof Date) {
                    const pad = (n) => n.toString().padStart(2, '0');
                    val = `${pad(val.getDate())}/${pad(val.getMonth() + 1)}/${val.getFullYear()} ${pad(val.getHours())}:${pad(val.getMinutes())}`;
                  }
                  
                  order[histHeaders[j]] = val !== undefined ? val : "";
                }
                order.id = "admin_search_hist_" + rowNum;
                order.isHistorical = true;
                results.push(order);
              }
            }
          }
        }
      } catch (histError) {
        Logger.log("خطأ أثناء البحث في الشيت التراكمي: " + histError.toString());
      }
    }

    return { success: true, results: results };

  } catch (e) {
    return { success: false, message: 'خطأ في البحث: ' + e.toString() };
  }
}


/**
 * تحديث حالة الشحنة والملاحظات من قبل مسؤول المتجر
 * ملاحظة: لا يتم تحديث عمود "التاريخ" هنا حتى يبقى الترتيب ثابت
 * 
 * الحالات المدعومة:
 * - done: تم
 * - not_done: لم يتم
 * - new_order: طلب جديد
 * - resend: إعادة إرسال
 */
function handleStoreActionBackend(rowIndex, action, note) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('البيانات');
    if (!sheet) return false;
    
    const lastRow = sheet.getLastRow();
    if (rowIndex < 2 || rowIndex > lastRow) return false;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // محاولة العثور على الأعمدة بالاسم
    let reportCol = headers.indexOf('تبليغ المسؤول');
    let noteCol = headers.indexOf('ملاحظه المسؤول');
    
    if (reportCol === -1) reportCol = 21; // العمود V (الفهرس 21)
    if (noteCol === -1) noteCol = 22;    // العمود W (الفهرس 22)
    
    // تحديد قيمة الحالة بناءً على الاختيار
    let statusValue = '';
    switch(action) {
      case 'done':
        statusValue = 'تم';
        break;
      case 'not_done':
        statusValue = 'لم يتم';
        break;
      case 'new_order':
        statusValue = 'طلب جديد';
        break;
      case 'resend':
        statusValue = 'إعادة إرسال';
        break;
      default:
        statusValue = action; // fallback للحالات القديمة
    }
    
    // حفظ الحالة في العمود V (الفهرس 21)
    sheet.getRange(rowIndex, reportCol + 1).setValue(statusValue);
    
    // حفظ الملاحظة في العمود W (الفهرس 22)
    sheet.getRange(rowIndex, noteCol + 1).setValue(note);
    
    // لا نحدث عمود "التاريخ" هنا حتى لا يتغير ترتيب الطلبات
    // عمود "التاريخ" يحتفظ بتاريخ آخر تحديث من الموظفة (عند الاتصال بالعميل)
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * جلب بيانات المتابعة لمسؤول المتجر من شيت "طلبات تحتاج متابعه"
 */
function getStoreFollowUpOrders(storeName) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('طلبات تحتاج متابعه');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const COL_STORE = headers.indexOf('المتجر');
    if (COL_STORE === -1) return [];
    
    const orders = [];
    const targetStore = storeName.trim().toLowerCase();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[COL_STORE].toString().trim().toLowerCase() === targetStore) {
        let order = {};
        for (let j = 0; j < headers.length; j++) {
          order[headers[j]] = row[j] || '';
        }
        order.id = "followup_" + i;
        order._rowIndex = i + 1;
        orders.push(order);
      }
    }
    
    return orders;
  } catch (e) {
    return [];
  }
}

/**
 * تحديث حالة المتابعة (تم / لم يتم / قيد البحث)
 */
function updateFollowUpOrderStatus(rowIndex, status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('طلبات تحتاج متابعه');
    if (!sheet) return false;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let statusCol = headers.indexOf('تم / لم يتم');
    if (statusCol === -1) statusCol = 8; // عمود I
    
    sheet.getRange(rowIndex, statusCol + 1).setValue(status);
    return true;
  } catch (e) {
    return false;
  }
}
// ===============================
// إحصائيات الموظفة - للصفحة الجانبية
// ===============================
function getEmployeeStatistics(employeeName) {
  try {
    // جلب البيانات من الشيت المحلي Dash_data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = ss.getSheetByName('Dash_data');
    
    if (!dataSheet) {
      return { error: 'شيت "Dash_data" غير موجود' };
    }
    
    // استخدام getDisplayValues للحصول على القيم كما تظهر في الشيت (نص)
    const displayData = dataSheet.getDataRange().getDisplayValues();
    const data = dataSheet.getDataRange().getValues();
    const headers = displayData[0];
    
    // Debug: تأكيد أن البيانات تُقرأ
    if (displayData.length <= 1) {
      return { error: 'الشيت "Dash_data" فارغ أو لا يحتوي على بيانات' };
    }
    
    // Debug: تسجيل الأعمدة المكتشفة
    Logger.log(`Using local Dash_data sheet with headers: ${JSON.stringify(headers)}`);
    
    // مؤشرات الأعمدة - مع دعم أسماء بديلة
    const colEmployee = headers.indexOf('الاسم');
    let colDeliveryStatus = headers.indexOf('اتسلم / لا');
    if (colDeliveryStatus === -1) {
      // محاولة أسماء بديلة
      colDeliveryStatus = headers.indexOf('الحالة - التسليم');
    }
    const colDate = headers.indexOf('التاريخ');
    const colClientStatus = headers.indexOf('الحالة - العميل');
    let colDashboardFilter = headers.indexOf('فلتر الداشبورد');
    if (colDashboardFilter === -1) {
      colDashboardFilter = headers.indexOf('Filter');
    }
    
    Logger.log(`Column indices: Employee=${colEmployee}, Delivery=${colDeliveryStatus}, Date=${colDate}, Filter=${colDashboardFilter}`);
    
    if (colEmployee === -1) {
      return { error: 'عمود "الاسم" غير موجود في البيانات' };
    }
    
    // حساب نطاق التاريخ: من أول السنة إلى اليوم
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 يناير من السنة الحالية
    const today = now;
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Debug
    Logger.log(`Date Range: ${startOfYear.toDateString()} to ${today.toDateString()}`);
    Logger.log(`Current Date: ${now}, Month: ${currentMonth}, Year: ${currentYear}`);
    
    // حساب الإحصائيات
    let totalAll = 0;
    let deliveredAll = 0;
    let totalCurrentMonth = 0;
    let deliveredCurrentMonth = 0;
    
    // جمع إحصائيات جميع الموظفات للترتيب
    const allEmployeesStats = {};
    
    // تحسين الأداء: استخراج معلومات التاريخ مرة واحدة فقط
    const dateParseCache = {};
    const parseDateStr = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return null;
      
      // تحقق من الـ cache أولاً
      const trimmed = dateStr.trim();
      if (dateParseCache[trimmed]) return dateParseCache[trimmed];
      
      let day, month, year;
      
      // محاولة DD/MM/YYYY
      if (trimmed.includes('/')) {
        const parts = trimmed.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length === 3) {
          day = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]);
          year = parseInt(dateParts[2]);
        }
      } else if (trimmed.includes('-')) {
        // محاولة YYYY-MM-DD
        const parts = trimmed.split(' ');
        const dateParts = parts[0].split('-');
        if (dateParts.length === 3) {
          year = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]);
          day = parseInt(dateParts[2]);
        }
      }
      
      if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const result = { day, month, year };
        dateParseCache[trimmed] = result;
        return result;
      }
      
      dateParseCache[trimmed] = null;
      return null;
    };
    
    // حلقة مبسطة وأسرع للبيانات
    for (let i = 1; i < displayData.length; i++) {
      const displayRow = displayData[i];
      const empName = (displayRow[colEmployee] || '').toString().trim();
      
      if (!empName) continue;
      
      // تطبيق فلتر "ignore" من فلتر الداشبورد
      if (colDashboardFilter !== -1) {
        const filterValue = (displayRow[colDashboardFilter] || '').toString().toLowerCase().trim();
        if (filterValue === 'ignore') {
          continue;
        }
      }
      
      // الحصول على حالة التسليم
      let isDelivered = false;
      if (colDeliveryStatus !== -1) {
        const deliveryValue = (displayRow[colDeliveryStatus] || '').toString().trim().toLowerCase();
        isDelivered = deliveryValue === 'نعم' || deliveryValue === 'yes' || deliveryValue === 'اتسلم';
      }
      
      // الحصول على التاريخ
      const dateStr = colDate !== -1 ? (displayRow[colDate] || '').toString() : '';
      const parsedDate = parseDateStr(dateStr);
      
      // تهيئة بيانات الموظف
      if (!allEmployeesStats[empName]) {
        allEmployeesStats[empName] = { 
          totalAll: 0, 
          deliveredAll: 0, 
          totalMonth: 0, 
          deliveredMonth: 0
        };
      }
      
      // معالجة البيانات فقط إذا كان لدينا تاريخ صحيح
      if (parsedDate) {
        // فحص نطاق السنة
        if (parsedDate.year === currentYear) {
          allEmployeesStats[empName].totalAll++;
          if (isDelivered) {
            allEmployeesStats[empName].deliveredAll++;
          }
          
          // فحص الشهر الحالي
          if (parsedDate.month === currentMonth) {
            allEmployeesStats[empName].totalMonth++;
            if (isDelivered) {
              allEmployeesStats[empName].deliveredMonth++;
            }
          }
        }
      }
    }
    
    // حساب النسب لجميع الموظفات
    Object.keys(allEmployeesStats).forEach(empName => {
      const stats = allEmployeesStats[empName];
      
      // النسبة العامة
      stats.overallRate = stats.totalAll > 0 ? 
        Math.round((stats.deliveredAll / stats.totalAll) * 100) : 0;
      
      // نسبة الشهر الحالي
      stats.currentMonthRate = stats.totalMonth > 0 ? 
        Math.round((stats.deliveredMonth / stats.totalMonth) * 100) : 0;
    });
    
    // Debug: تسجيل بيانات الموظفة الحالية
    const empStatsDebug = allEmployeesStats[employeeName];
    if (empStatsDebug) {
      Logger.log(`Employee: ${employeeName}, Total: ${empStatsDebug.totalAll}, Delivered: ${empStatsDebug.deliveredAll}, Current Month Total: ${empStatsDebug.totalMonth}, Current Month Delivered: ${empStatsDebug.deliveredMonth}`);
    }
    
    // حساب نسب الموظفة المطلوبة
    const empStats = allEmployeesStats[employeeName] || { 
      totalAll: 0, 
      deliveredAll: 0, 
      totalMonth: 0, 
      deliveredMonth: 0,
      overallRate: 0,
      currentMonthRate: 0
    };
    
    // تصفية الموظفات: استبعاد "احتياطي" و "موظفات سابقات" بالظبط
    const filteredEmployees = Object.keys(allEmployeesStats).filter(emp => {
      const name = emp.trim();
      // استبعاد بالظبط: "احتياطي" و "موظفات سابقات"
      if (name === 'احتياطي' || name === 'موظفات سابقات') {
        return false;
      }
      return true;
    });
    
    // حساب الترتيب
    const totalEmployees = filteredEmployees.length;
    
    // ترتيب الشهر الحالي
    const currentMonthRates = filteredEmployees.map(emp => {
      return { name: emp, rate: allEmployeesStats[emp].currentMonthRate };
    }).sort((a, b) => b.rate - a.rate);
    
    const currentMonthRank = currentMonthRates.findIndex(e => e.name === employeeName) + 1;
    
    // الترتيب العام
    const overallRates = filteredEmployees.map(emp => {
      return { name: emp, rate: allEmployeesStats[emp].overallRate };
    }).sort((a, b) => b.rate - a.rate);
    
    const overallRank = overallRates.findIndex(e => e.name === employeeName) + 1;
    
    return {
      employeeName: employeeName,
      overallRate: empStats.overallRate,
      currentMonthRate: empStats.currentMonthRate,
      currentMonthRank: currentMonthRank,
      overallRank: overallRank,
      totalEmployees: totalEmployees,
      totalAll: empStats.totalAll,
      deliveredAll: empStats.deliveredAll,
      totalMonth: empStats.totalMonth,
      deliveredMonth: empStats.deliveredMonth,
      miniDashConsistent: true,
      performanceLevel: empStats.overallRate >= 70 ? 'good' : 'needs-improvement',
      // Debug info
      debug: {
        currentMonth: currentMonth,
        currentYear: currentYear,
        allEmployeesCount: Object.keys(allEmployeesStats).length,
        empStatsKeys: Object.keys(allEmployeesStats).slice(0, 5)
      }
    };
    
  } catch (error) {
    console.error('Error in getEmployeeStatistics:', error);
    return { error: error.toString() };
  }
}

// دالة مساعدة للتحقق من الشهر الحالي (معاد تسميتها)
function isCurrentMonthDate(dateStr, targetMonth, targetYear) {
  try {
    if (!dateStr) return false;
    
    let month, year;
    
    // إذا كان Date object
    if (dateStr instanceof Date) {
      month = dateStr.getMonth() + 1;
      year = dateStr.getFullYear();
      Logger.log(`Date object: Month=${month}, Year=${year}, Target: ${targetMonth}/${targetYear}`);
    } else if (typeof dateStr === 'string') {
      const trimmed = dateStr.trim();
      
      // تحويل DD/MM/YYYY أو DD/MM/YYYY HH:mm:ss أو صيغ أخرى
      let dateParts;
      
      // محاولة أولاً: DD/MM/YYYY
      if (trimmed.includes('/')) {
        const parts = trimmed.split(' ');
        dateParts = parts[0].split('/');
      } else if (trimmed.includes('-')) {
        // محاولة YYYY-MM-DD
        const parts = trimmed.split(' ');
        dateParts = parts[0].split('-').reverse(); // للحصول على DD/MM/YYYY
      } else {
        return false;
      }
      
      if (dateParts.length !== 3) {
        return false;
      }
      
      const day = parseInt(dateParts[0]);
      month = parseInt(dateParts[1]);
      year = parseInt(dateParts[2]);
      
      // التحقق من أن القيم صحيحة
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return false;
      }
      
      Logger.log(`Parsed string date: ${dateStr} -> Day=${day}, Month=${month}, Year=${year}, Target: ${targetMonth}/${targetYear}`);
    } else {
      return false;
    }
    
    const result = month === targetMonth && year === targetYear;
    if (result) {
      Logger.log(`✓ Match: ${dateStr} matches target month ${targetMonth}/${targetYear}`);
    } else {
      Logger.log(`✗ No match: ${dateStr} (${month}/${year}) vs target (${targetMonth}/${targetYear})`);
    }
    return result;
  } catch (e) {
    Logger.log(`Error in isCurrentMonthDate: ${e.toString()}`);
    return false;
  }
}

// دالة مساعدة القديمة (للرجعية فقط)
function isCurrentMonth(dateStr, targetMonth, targetYear) {
  return isCurrentMonthDate(dateStr, targetMonth, targetYear);
}


// ===============================
// صفحة الطلبات الجاهزة للتوزيع
// ===============================

/**
 * تنسيق التاريخ
 */
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return date.toString();
  }
}

/**
 * جلب الطلبات من الملف الخارجي (طلبات مؤجلة)
 * الملف الخارجي: https://docs.google.com/spreadsheets/d/1fVKNS609kMPT5SZoU_DOGMod14td4j6MJFQsnjgAS-I
 * الشيت: Draft
 */
function getDistributionOrders() {
  try {
    // معرف الملف الخارجي
    const externalSheetId = "1fVKNS609kMPT5SZoU_DOGMod14td4j6MJFQsnjgAS-I";
    const ss = SpreadsheetApp.openById(externalSheetId);
    const sheet = ss.getSheetByName('Draft'); // الورقة Draft
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0];
    
    // العثور على الأعمدة
    const COL_NAME = headers.indexOf('الاسم');
    const COL_CODE = headers.indexOf('كود الطلب');
    const COL_PHONE = headers.indexOf('رقم العميل');
    const COL_STORE = headers.indexOf('المتجر');
    const COL_NOTE = headers.indexOf('ملاحظة');
    const COL_CLIENT_NOTE = headers.indexOf('ملاحظة - العميل');
    const COL_DATE = headers.indexOf('التاريخ');
    const COL_ADMIN_UPDATE = headers.indexOf('تحديث الادارة');
    
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // تخطي الصفوف الفارغة
      if (!row[COL_CODE] || !row[COL_CODE].toString().trim()) continue;
      
      // تخطي الطلبات المحذوفة (التي ليس لها قيمة في عمود تحديث الادارة)
      // فقط عرض الطلبات التي تم تحديدها كـ "جاهز للتوزيع" أو طلبات معينة
      const adminUpdate = row[COL_ADMIN_UPDATE] ? row[COL_ADMIN_UPDATE].toString().trim() : '';
      
      // عرض جميع الطلبات في صفحة طلبات مؤجلة
      orders.push({
        id: "dist_" + i,
        _rowIndex: i + 1,
        'الاسم': row[COL_NAME] || '',
        'كود الطلب': row[COL_CODE] || '',
        'رقم العميل': row[COL_PHONE] || '',
        'المتجر': row[COL_STORE] || '',
        'ملاحظة': row[COL_NOTE] || '',
        'ملاحظة - العميل': row[COL_CLIENT_NOTE] || '',
        'التاريخ': row[COL_DATE] ? formatDate(row[COL_DATE]) : '',
        'تحديث الادارة': adminUpdate
      });
    }
    
    return orders;
  } catch (e) {
    Logger.log('Error in getDistributionOrders: ' + e.toString());
    return [];
  }
}

/**
 * حذف طلب كامل من الشيت Draft
 */
function deleteOrderFromDraft(rowIndex) {
  try {
    const externalSheetId = "1fVKNS609kMPT5SZoU_DOGMod14td4j6MJFQsnjgAS-I";
    const ss = SpreadsheetApp.openById(externalSheetId);
    const sheet = ss.getSheetByName('Draft');
    
    if (!sheet) return false;
    
    // حذف الصف كامل
    sheet.deleteRow(rowIndex);
    
    Logger.log('Order deleted from row: ' + rowIndex);
    return true;
  } catch (e) {
    Logger.log('Error in deleteOrderFromDraft: ' + e.toString());
    return false;
  }
}
function updateDistributionStatus(rowIndex, status) {
  try {
    const externalSheetId = "1fVKNS609kMPT5SZoU_DOGMod14td4j6MJFQsnjgAS-I";
    const ss = SpreadsheetApp.openById(externalSheetId);
    const sheet = ss.getSheetByName('Draft');
    
    if (!sheet) return false;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const COL_ADMIN_UPDATE = headers.indexOf('تحديث الادارة');
    
    if (COL_ADMIN_UPDATE === -1) {
      // إذا كان العمود غير موجود، أنشئه
      const newCol = headers.length + 1;
      sheet.getRange(1, newCol).setValue('تحديث الادارة');
      sheet.getRange(rowIndex, newCol).setValue(status);
    } else {
      sheet.getRange(rowIndex, COL_ADMIN_UPDATE + 1).setValue(status);
    }
    
    return true;
  } catch (e) {
    Logger.log('Error in updateDistributionStatus: ' + e.toString());
    return false;
  }
}


/**
 * إضافة عمود 'تحديث الادارة' في الملف الخارجي إذا لم يكن موجوداً
 */
function ensureDistributionColumn() {
  try {
    const externalSheetId = "1fVKNS609kMPT5SZoU_DOGMod14td4j6MJFQsnjgAS-I";
    const ss = SpreadsheetApp.openById(externalSheetId);
    const sheet = ss.getSheetByName('Draft');
    
    if (!sheet) return false;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // البحث عن العمود
    const colIndex = headers.indexOf('تحديث الادارة');
    
    if (colIndex === -1) {
      // العمود غير موجود، أضفه
      const newCol = headers.length + 1;
      sheet.getRange(1, newCol).setValue('تحديث الادارة');
      
      // إضافة تنسيق للعمود الجديد
      sheet.getRange(2, newCol, sheet.getMaxRows() - 1, 1).setBackground('#f0fdf4').setFontColor('#059669');
      
      Logger.log('✓ تم إضافة عمود "تحديث الادارة" بنجاح');
      return true;
    } else {
      Logger.log('✓ عمود "تحديث الادارة" موجود بالفعل');
      return true;
    }
  } catch (e) {
    Logger.log('Error in ensureDistributionColumn: ' + e.toString());
    return false;
  }
}
