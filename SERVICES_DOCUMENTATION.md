# توثيق الخدمات (API Services)

## نظرة عامة

تم بناء 5 خدمات أساسية لتغطية جميع عمليات نظام إدارة الطلبات:

1. **Auth Service** - المصادقة والمستخدمين
2. **Order Service** - الطلبات
3. **Search Service** - البحث المتقدم
4. **Stats Service** - الإحصائيات والتقارير
5. **Follow-Up Service** - المتابعات

---

## 1️⃣ Auth Service

**الملف:** `src/services/authService.ts`

### الدوال الرئيسية:

#### `login(email: string, password: string)`
تسجيل الدخول بالبريد والكلمة المرور
```typescript
const user = await authService.login('user@example.com', 'password123')
```

#### `logout()`
تسجيل الخروج
```typescript
await authService.logout()
```

#### `getCurrentUser(): Promise<User | null>`
الحصول على بيانات المستخدم الحالي
```typescript
const user = await authService.getCurrentUser()
```

#### `registerUser(email, password, name, role, store?)`
تسجيل مستخدم جديد (فقط للمديرين)
```typescript
const newUser = await authService.registerUser(
  'employee@example.com',
  'password123',
  'اسم الموظفة',
  'employee',
  'Store Name'
)
```

#### `updateUserProfile(userId, updates)`
تحديث بيانات المستخدم
```typescript
await authService.updateUserProfile(userId, { name: 'اسم جديد' })
```

#### `getAllUsers()`
جلب جميع المستخدمين (للمديرين)
```typescript
const users = await authService.getAllUsers()
```

#### `changePassword(currentPassword, newPassword)`
تغيير كلمة المرور
```typescript
await authService.changePassword('oldPassword', 'newPassword')
```

#### `resetPassword(email)`
إعادة تعيين كلمة المرور (عبر البريد الإلكتروني)
```typescript
await authService.resetPassword('user@example.com')
```

---

## 2️⃣ Order Service

**الملف:** `src/services/orderService.ts`

### الدوال الرئيسية:

#### `getAllOrders(limit = 100, offset = 0)`
جلب جميع الطلبات
```typescript
const { orders, total } = await orderService.getAllOrders(50, 0)
```

#### `getEmployeeOrders(employeeName, limit, offset)`
جلب طلبات موظفة معينة
```typescript
const { orders } = await orderService.getEmployeeOrders('اسم الموظفة', 100)
```

#### `getStoreOrders(storeName, status?, limit, offset)`
جلب طلبات متجر معين
```typescript
const { orders } = await orderService.getStoreOrders('Store Name', 'رد و يستلم')
```

#### `getOrder(orderId)`
جلب طلب واحد
```typescript
const order = await orderService.getOrder(orderId)
```

#### `createOrder(order)`
إنشاء طلب جديد
```typescript
const newOrder = await orderService.createOrder({
  order_code: 'ORD001',
  customer_phone: '01012345678',
  employee_name: 'الموظفة',
  store: 'المتجر'
})
```

#### `updateOrder(orderId, updates)`
تحديث طلب
```typescript
await orderService.updateOrder(orderId, { client_status: 'تم الاستلام' })
```

#### `updateClientStatus(orderId, status)`
تحديث حالة العميل
```typescript
await orderService.updateClientStatus(orderId, 'رد و يستلم')
```

#### `updateShipmentStatus(orderId, status)`
تحديث حالة الشحنة
```typescript
await orderService.updateShipmentStatus(orderId, 'تم الشحن')
```

#### `incrementCallAttempts(orderId)`
زيادة عدد محاولات الاتصال
```typescript
await orderService.incrementCallAttempts(orderId)
```

#### `addNote(orderId, noteType, note)`
إضافة ملاحظة للطلب
```typescript
await orderService.addNote(orderId, 'admin', 'ملاحظة إدارية')
```

#### `recordDelivery(orderId, orderCode, customerPhone, store?)`
تسجيل تسليم الطلب
```typescript
await orderService.recordDelivery(orderId, 'ORD001', '01012345678', 'Store Name')
```

---

## 3️⃣ Search Service

**الملف:** `src/services/searchService.ts`

### الدوال الرئيسية:

#### `searchOrders(query, limit = 50)`
البحث الشامل في الطلبات والأرشيف
```typescript
const { current, archived } = await searchService.searchOrders('ORD001', 50)
```

#### `searchByOrderCode(orderCode)`
البحث حسب كود الطلب
```typescript
const order = await searchService.searchByOrderCode('ORD001')
```

#### `searchByCustomerPhone(phone, limit = 50)`
البحث حسب رقم العميل
```typescript
const orders = await searchService.searchByCustomerPhone('01012345678')
```

#### `advancedSearch(filters)`
البحث المتقدم مع فلاتر
```typescript
const { orders, total } = await searchService.advancedSearch({
  orderCode: 'ORD',
  employeeName: 'الموظفة',
  store: 'المتجر',
  clientStatus: 'رد و يستلم',
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  limit: 50
})
```

#### `searchByEmployee(employeeName, limit, offset)`
البحث حسب الموظفة
```typescript
const { orders } = await searchService.searchByEmployee('الموظفة')
```

#### `searchByStore(storeName, limit, offset)`
البحث حسب المتجر
```typescript
const { orders } = await searchService.searchByStore('المتجر')
```

#### `searchPendingOrders(employeeName?)`
البحث عن الطلبات المعلقة
```typescript
const pendingOrders = await searchService.searchPendingOrders()
```

#### `searchDelivered(limit, offset)`
البحث عن الطلبات المسلمة
```typescript
const { orders } = await searchService.searchDelivered()
```

#### `searchNotDelivered(limit, offset)`
البحث عن الطلبات غير المسلمة
```typescript
const { orders } = await searchService.searchNotDelivered()
```

---

## 4️⃣ Stats Service

**الملف:** `src/services/statsService.ts`

### الدوال الرئيسية:

#### `getAdminDashboard()`
جلب لوحة المدير الشاملة
```typescript
const dashboard = await statsService.getAdminDashboard()
// {
//   totalOrders: 1000,
//   employeeCount: 10,
//   storeCount: 5,
//   deliveredCount: 800,
//   employees: [...],
//   stores: [...]
// }
```

#### `getEmployeeStats(employeeName)`
جلب إحصائيات موظفة معينة
```typescript
const stats = await statsService.getEmployeeStats('الموظفة')
// {
//   employee_name: 'الموظفة',
//   total_orders: 100,
//   delivered_count: 85,
//   delivery_percentage: 85
// }
```

#### `getAllEmployeeStats()`
جلب إحصائيات جميع الموظفات
```typescript
const employees = await statsService.getAllEmployeeStats()
```

#### `getStoreStats(storeName)`
جلب إحصائيات متجر معين
```typescript
const stats = await statsService.getStoreStats('المتجر')
```

#### `getAllStoreStats()`
جلب إحصائيات جميع المتاجر
```typescript
const stores = await statsService.getAllStoreStats()
```

#### `getEmployeeRanking(limit = 10)`
جلب ترتيب الموظفات الأفضل أداءً
```typescript
const ranking = await statsService.getEmployeeRanking(10)
// [
//   { rank: 1, employee_name: 'الموظفة1', delivery_percentage: 95 },
//   { rank: 2, employee_name: 'الموظفة2', delivery_percentage: 90 }
// ]
```

#### `getStoreRanking(limit = 10)`
جلب ترتيب المتاجر الأفضل أداءً
```typescript
const ranking = await statsService.getStoreRanking(10)
```

#### `getQuickStats()`
جلب إحصائيات سريعة
```typescript
const stats = await statsService.getQuickStats()
// { total: 1000, delivered: 800, percentage: 80 }
```

#### `getDailyReport(date)`
جلب تقرير الأداء اليومي
```typescript
const report = await statsService.getDailyReport('2024-01-15')
// {
//   date: '2024-01-15',
//   total: 50,
//   delivered: 40,
//   percentage: 80,
//   byEmployee: {...},
//   byStore: {...}
// }
```

#### `getPerformanceTrend(days = 7)`
جلب اتجاهات الأداء (آخر 7 أيام)
```typescript
const trends = await statsService.getPerformanceTrend(7)
// [
//   { date: '2024-01-15', total: 50, delivered: 40, percentage: 80 },
//   { date: '2024-01-16', total: 45, delivered: 38, percentage: 84 }
// ]
```

---

## 5️⃣ Follow-Up Service

**الملف:** `src/services/followUpService.ts`

### الدوال الرئيسية:

#### `getAllFollowUps(limit = 100, offset = 0)`
جلب جميع المتابعات
```typescript
const { followUps, total } = await followUpService.getAllFollowUps(50)
```

#### `getEmployeeFollowUps(employeeName, limit, offset)`
جلب متابعات موظفة معينة
```typescript
const { followUps } = await followUpService.getEmployeeFollowUps('الموظفة')
```

#### `getStoreFollowUps(storeName, limit, offset)`
جلب متابعات متجر معين
```typescript
const { followUps } = await followUpService.getStoreFollowUps('المتجر')
```

#### `createFollowUp(followUp)`
إنشاء متابعة جديدة
```typescript
const newFollowUp = await followUpService.createFollowUp({
  order_code: 'ORD001',
  customer_phone: '01012345678',
  follow_up_date: '2024-01-20',
  status: 'pending'
})
```

#### `updateFollowUpStatus(followUpId, status)`
تحديث حالة المتابعة
```typescript
await followUpService.updateFollowUpStatus(followUpId, 'completed')
```

#### `getPendingFollowUps(limit, offset)`
جلب المتابعات المعلقة
```typescript
const { followUps } = await followUpService.getPendingFollowUps()
```

#### `getDueFollowUps()`
جلب المتابعات المستحقة (التي تاريخها اليوم أو أقل)
```typescript
const dueFollowUps = await followUpService.getDueFollowUps()
```

#### `getUpcomingFollowUps(days = 7)`
جلب المتابعات المستقبلية
```typescript
const upcomingFollowUps = await followUpService.getUpcomingFollowUps(7)
```

#### `getFollowUpStats()`
جلب إحصائيات المتابعات
```typescript
const stats = await followUpService.getFollowUpStats()
// { total: 100, pending: 30, completed: 60, cancelled: 10 }
```

#### `createFollowUpsFromOrder(orderId, followUpDates)`
إنشاء متابعات من طلب معين
```typescript
const followUps = await followUpService.createFollowUpsFromOrder(
  orderId,
  ['2024-01-20', '2024-01-25', '2024-02-01']
)
```

#### `completeFollowUpAndCloseOrder(followUpId, result)`
إنهاء متابعة وإغلاق الطلب
```typescript
await followUpService.completeFollowUpAndCloseOrder(followUpId, 'delivered')
// result: 'delivered' | 'cancelled' | 'rescheduled'
```

#### `addNote(followUpId, note)`
إضافة ملاحظة للمتابعة
```typescript
await followUpService.addNote(followUpId, 'لم يرد العميل، تم إعادة المحاولة')
```

---

## معالجة الأخطاء

جميع الخدمات تتعامل مع الأخطاء بشكل موحد:

```typescript
try {
  const result = await orderService.getOrder(orderId)
} catch (error) {
  console.error('خطأ:', error.message)
  // يمكن عرض رسالة خطأ للمستخدم
}
```

---

## الاتصال بـ Supabase

جميع الخدمات تستخدم عميل Supabase الموحد من:
```typescript
import { supabase } from '@/utils/supabase'
```

---

## أمثلة الاستخدام

### مثال 1: جلب طلبات الموظفة وتحديث الحالة

```typescript
import { orderService } from '@/services/orderService'

const employeeName = 'فاطمة أحمد'
const { orders } = await orderService.getEmployeeOrders(employeeName)

// تحديث حالة أول طلب
if (orders.length > 0) {
  await orderService.updateClientStatus(orders[0].id, 'رد و يستلم')
  await orderService.incrementCallAttempts(orders[0].id)
}
```

### مثال 2: البحث المتقدم مع الفلاتر

```typescript
import { searchService } from '@/services/searchService'

const results = await searchService.advancedSearch({
  employeeName: 'فاطمة أحمد',
  store: 'متجر الرياض',
  clientStatus: 'رد و يستلم',
  fromDate: '2024-01-01',
  toDate: '2024-01-31'
})

console.log(`وجدنا ${results.orders.length} طلب`)
```

### مثال 3: جلب إحصائيات وترتيب

```typescript
import { statsService } from '@/services/statsService'

// لوحة المدير الشاملة
const dashboard = await statsService.getAdminDashboard()
console.log(`الإجمالي: ${dashboard.totalOrders}`)
console.log(`المسلمة: ${dashboard.deliveredCount}`)

// الموظفات الأفضل أداءً
const topEmployees = await statsService.getEmployeeRanking(5)
topEmployees.forEach(emp => {
  console.log(`${emp.rank}. ${emp.employee_name}: ${emp.delivery_percentage}%`)
})
```

### مثال 4: إدارة المتابعات

```typescript
import { followUpService } from '@/services/followUpService'

// جلب المتابعات المستحقة
const dueFollowUps = await followUpService.getDueFollowUps()

// معالجة كل متابعة
for (const followUp of dueFollowUps) {
  // تحديث الملاحظات
  await followUpService.addNote(followUp.id, 'تم الاتصال - العميل سيستلم غداً')
  
  // تحديث الحالة
  await followUpService.updateFollowUpStatus(followUp.id, 'completed')
}
```

---

## نصائح الأداء

1. **استخدم `limit` و `offset`** للبحث عن كميات كبيرة من البيانات
2. **استخدم الفلاتر المحددة** بدلاً من جلب جميع البيانات ثم تصفيتها
3. **استخدم caching** للبيانات التي تتغير بشكل نادر (مثل الترتيبات)
4. **batch operations** عند الحاجة لتحديثات متعددة

---

## اختبار الخدمات

لتشغيل الاختبارات:

```bash
npm run test:services
```

يقوم هذا بتشغيل جميع الاختبارات والتحقق من:
- ✅ الاتصال بـ Supabase
- ✅ جلب البيانات بنجاح
- ✅ معالجة الأخطاء
- ✅ صحة النتائج المرجعة

---

## التوسيع المستقبلي

يمكن إضافة خدمات إضافية في المستقبل:
- `reportService.ts` - تقارير متقدمة
- `notificationService.ts` - إرسال تنبيهات
- `exportService.ts` - تصدير البيانات (Excel, PDF)
- `analyticsService.ts` - تحليلات متقدمة
