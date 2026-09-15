# دليل المكونات (Components Guide)

## نظرة عامة

تم بناء 6 مكونات أساسية قابلة لإعادة الاستخدام:

1. **OrderCard** - بطاقة الطلب
2. **StatsCard** - بطاقة الإحصائيات
3. **Table** - جدول متقدم
4. **Modal** - نافذة منبثقة
5. **Form** - نموذج متقدم
6. **Layout** - تخطيط الصفحة

---

## 1️⃣ OrderCard

بطاقة تعرض معلومات الطلب الأساسية

### الاستخدام:

```typescript
import { OrderCard } from '@/components'

<OrderCard
  order={orderData}
  onEdit={(order) => handleEdit(order)}
  onDelete={(orderId) => handleDelete(orderId)}
  onViewDetails={(order) => handleViewDetails(order)}
  compact={false}
/>
```

### Props:

| الخاصية | النوع | الوصف |
|-------|------|--------|
| `order` | `Order` | بيانات الطلب |
| `onEdit` | `function` | تحرير الطلب |
| `onDelete` | `function` | حذف الطلب |
| `onViewDetails` | `function` | عرض التفاصيل |
| `compact` | `boolean` | وضع مضغوط (صغير) |

### الميزات:

- ✅ عرض حالة الطلب بألوان مختلفة
- ✅ معلومات العميل والموظفة والمتجر
- ✅ عرض الملاحظات
- ✅ حالة التسليم
- ✅ عدد محاولات الاتصال
- ✅ أزرار الإجراءات

---

## 2️⃣ StatsCard

بطاقة تعرض إحصائية مهمة مع اتجاه

### الاستخدام:

```typescript
import { StatsCard, StatsGrid } from '@/components'
import { Package, Users, TrendingUp } from 'lucide-react'

// بطاقة واحدة
<StatsCard
  title="إجمالي الطلبات"
  value={1250}
  subtitle="آخر 30 يوم"
  icon={<Package size={24} />}
  trend="up"
  trendValue={12}
  color="blue"
/>

// شبكة من البطاقات
<StatsGrid
  stats={[
    { title: 'الطلبات', value: 1250, icon: <Package />, color: 'blue' },
    { title: 'المسلمة', value: 950, color: 'green' },
    { title: 'الموظفات', value: 15, color: 'purple' },
  ]}
  columns={3}
/>
```

### Props:

| الخاصية | النوع | الوصف |
|-------|------|--------|
| `title` | `string` | عنوان الإحصائية |
| `value` | `number \| string` | القيمة |
| `subtitle` | `string` | نص إضافي |
| `icon` | `React.ReactNode` | أيقونة |
| `trend` | `'up' \| 'down' \| 'neutral'` | الاتجاه |
| `trendValue` | `number` | نسبة التغير |
| `color` | `'blue' \| 'green' \| 'red' \| 'amber' \| 'purple' \| 'indigo'` | اللون |
| `compact` | `boolean` | وضع مضغوط |

---

## 3️⃣ Table

جدول متقدم مع الفرز والتصفح

### الاستخدام:

```typescript
import { Table } from '@/components'

<Table
  columns={[
    { key: 'order_code', label: 'كود الطلب', sortable: true, width: 'w-20' },
    { 
      key: 'customer_phone', 
      label: 'رقم العميل', 
      render: (value) => <Phone size={16} /> 
    },
    { key: 'client_status', label: 'الحالة', sortable: true },
    {
      key: 'order_date',
      label: 'التاريخ',
      render: (date) => new Date(date).toLocaleDateString('ar-EG')
    },
  ]}
  data={orders}
  onRowClick={(row) => handleRowClick(row)}
  onEdit={(row) => handleEdit(row)}
  onDelete={(row) => handleDelete(row)}
  loading={isLoading}
  pagination={{
    total: totalOrders,
    page: currentPage,
    pageSize: 20,
    onPageChange: (page) => setCurrentPage(page),
  }}
  rowKey="id"
/>
```

### Props:

| الخاصية | النوع | الوصف |
|-------|------|--------|
| `columns` | `Column[]` | تعريف الأعمدة |
| `data` | `T[]` | البيانات |
| `onRowClick` | `function` | الضغط على صف |
| `onEdit` | `function` | تعديل صف |
| `onDelete` | `function` | حذف صف |
| `loading` | `boolean` | حالة التحميل |
| `pagination` | `object` | إعدادات التصفح |
| `rowKey` | `keyof T` | مفتاح الصف الفريد |

### الميزات:

- ✅ فرز الأعمدة
- ✅ تصفح البيانات
- ✅ تصيير مخصص للخلايا
- ✅ إجراءات التعديل والحذف
- ✅ حالة التحميل

---

## 4️⃣ Modal

نافذة منبثقة

### الاستخدام:

```typescript
import { Modal, ConfirmModal } from '@/components'

// نافذة عادية
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="تفاصيل الطلب"
  size="lg"
  actions={[
    { label: 'حفظ', onClick: handleSave, variant: 'primary' },
    { label: 'إلغاء', onClick: handleClose, variant: 'secondary' },
  ]}
>
  {/* المحتوى */}
</Modal>

// نافذة التأكيد
<ConfirmModal
  isOpen={isOpen}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  title="حذف الطلب"
  message="هل أنت متأكد من رغبتك في حذف هذا الطلب؟"
  confirmText="نعم، حذف"
  isDangerous={true}
  loading={isDeleting}
/>
```

### Props:

| الخاصية | النوع | الوصف |
|-------|------|--------|
| `isOpen` | `boolean` | ظهور النافذة |
| `onClose` | `function` | إغلاق النافذة |
| `title` | `string` | العنوان |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | الحجم |
| `actions` | `Action[]` | الأزرار |

---

## 5️⃣ Form

نموذج متقدم مع التحقق

### الاستخدام:

```typescript
import { Form, FormField } from '@/components'

const formFields: FormField[] = [
  {
    name: 'orderCode',
    label: 'كود الطلب',
    type: 'text',
    required: true,
    placeholder: 'أدخل كود الطلب',
  },
  {
    name: 'customerPhone',
    label: 'رقم العميل',
    type: 'phone',
    required: true,
  },
  {
    name: 'status',
    label: 'الحالة',
    type: 'select',
    options: [
      { label: 'معلق', value: 'pending' },
      { label: 'تم الاستلام', value: 'delivered' },
    ],
  },
  {
    name: 'notes',
    label: 'الملاحظات',
    type: 'textarea',
    rows: 4,
  },
]

<Form
  fields={formFields}
  onSubmit={(values) => handleSubmit(values)}
  submitText="حفظ الطلب"
  cancelText="إلغاء"
  onCancel={handleCancel}
/>
```

### أنواع الحقول:

- `'text'` - نص عادي
- `'email'` - بريد إلكتروني
- `'password'` - كلمة مرور
- `'phone'` - رقم هاتف
- `'number'` - رقم
- `'date'` - تاريخ
- `'textarea'` - نص طويل
- `'select'` - قائمة منسدلة

### الميزات:

- ✅ التحقق من الصحة التلقائي
- ✅ رسائل الأخطاء
- ✅ حالات التحميل
- ✅ دعم أنواع حقول متعددة

---

## 6️⃣ Layout

تخطيط الصفحة الرئيسي

### الاستخدام:

```typescript
import { Layout } from '@/components'
import { Home, Package, BarChart3 } from 'lucide-react'

<Layout
  title="لوحة المدير"
  navItems={[
    { label: 'الرئيسية', href: '/', icon: <Home size={20} /> },
    { label: 'الطلبات', href: '/orders', icon: <Package size={20} />, badge: 5 },
    { label: 'الإحصائيات', href: '/stats', icon: <BarChart3 size={20} /> },
  ]}
  userName="أحمد محمد"
  userRole="مدير النظام"
  onLogout={handleLogout}
  showNotifications={true}
  notificationCount={3}
>
  {/* محتوى الصفحة */}
</Layout>
```

### Props:

| الخاصية | النوع | الوصف |
|-------|------|--------|
| `title` | `string` | عنوان الصفحة |
| `navItems` | `NavItem[]` | عناصر التنقل |
| `userName` | `string` | اسم المستخدم |
| `userRole` | `string` | دور المستخدم |
| `onLogout` | `function` | تسجيل الخروج |
| `showNotifications` | `boolean` | عرض التنبيهات |
| `notificationCount` | `number` | عدد التنبيهات |

### المكونات الإضافية:

#### EmptyState
```typescript
import { EmptyState } from '@/components'

<EmptyState
  icon={<Package size={48} />}
  title="لا توجد طلبات"
  description="لم نجد أي طلبات تطابق بحثك"
  action={{ label: 'إعادة محاولة', onClick: handleRetry }}
/>
```

#### SectionCard
```typescript
import { SectionCard } from '@/components'

<SectionCard
  title="الطلبات الحديثة"
  action={{ label: 'عرض الكل', onClick: handleViewAll }}
>
  {/* محتوى القسم */}
</SectionCard>
```

---

## 🎯 أمثلة عملية

### مثال 1: صفحة الطلبات

```typescript
import { useState } from 'react'
import { OrderCard, Table, SearchForm, Layout } from '@/components'
import { orderService } from '@/services/orderService'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const handleSearch = async (query: string) => {
    setLoading(true)
    const results = await orderService.getAllOrders(10, (page - 1) * 10)
    setOrders(results.orders)
    setLoading(false)
  }

  return (
    <Layout title="الطلبات">
      <SearchForm onSearch={handleSearch} placeholder="ابحث برقم الطلب..." />
      
      <Table
        columns={[
          { key: 'order_code', label: 'الكود', sortable: true },
          { key: 'customer_phone', label: 'الهاتف' },
          { key: 'client_status', label: 'الحالة', sortable: true },
        ]}
        data={orders}
        loading={loading}
        onEdit={(order) => console.log('Edit', order)}
      />
    </Layout>
  )
}
```

### مثال 2: لوحة الإحصائيات

```typescript
import { StatsGrid, Layout } from '@/components'
import { Package, TrendingUp, Users } from 'lucide-react'

export default function StatsPage() {
  return (
    <Layout title="الإحصائيات">
      <StatsGrid
        stats={[
          {
            title: 'إجمالي الطلبات',
            value: 1250,
            icon: <Package size={24} />,
            color: 'blue',
            trend: 'up',
            trendValue: 12,
          },
          {
            title: 'المسلمة',
            value: 950,
            icon: <TrendingUp size={24} />,
            color: 'green',
          },
          {
            title: 'الموظفات',
            value: 15,
            icon: <Users size={24} />,
            color: 'purple',
          },
        ]}
        columns={3}
      />
    </Layout>
  )
}
```

---

## 🎨 الألوان المدعومة

- `blue` - أزرق
- `green` - أخضر
- `red` - أحمر
- `amber` - برتقالي
- `purple` - بنفسجي
- `indigo` - نيلي

---

## 📝 الملاحظات

1. جميع المكونات تدعم الاتجاه من اليمين لليسار (RTL)
2. الأيقونات من `lucide-react`
3. الأنماط باستخدام Tailwind CSS
4. جميع المكونات تدعم `className` المخصصة
5. يمكن دمج المكونات بسهولة

---

## 🔄 الخطوة التالية

تم بناء المكونات الأساسية. الخطوة التالية:
- بناء Admin Dashboard
- بناء Employee Dashboard
- بناء Store Manager Dashboard
