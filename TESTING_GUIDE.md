# دليل الاختبارات

## نظرة عامة

يتضمن النظام اختبارات شاملة على عدة مستويات:

1. **Unit Tests** - اختبارات الوحدات للمكونات والخدمات
2. **Integration Tests** - اختبارات التكامل بين المكونات والخدمات
3. **E2E Tests** - اختبارات السيناريوهات الكاملة
4. **Performance Tests** - اختبارات الأداء

---

## تشغيل الاختبارات

### تشغيل جميع الاختبارات

```bash
npm test
```

### تشغيل اختبارات معينة

```bash
# اختبارات الوحدات فقط
npm run test:unit

# اختبارات التكامل
npm run test:integration

# اختبارات الخدمات
npm run test:services
```

### مراقبة الاختبارات (Watch Mode)

```bash
npm run test:watch
```

### تغطية الكود (Code Coverage)

```bash
npm run test:coverage
```

---

## هيكل الاختبارات

```
src/
├── components/
│   └── __tests__/
│       ├── OrderCard.test.tsx
│       ├── Table.test.tsx
│       └── Form.test.tsx
│
├── services/
│   └── __tests__/
│       ├── authService.test.ts
│       └── orderService.test.ts
│
└── __tests__/
    ├── services.test.ts (اختبارات الخدمات الفردية)
    └── integration.test.ts (اختبارات التكامل)
```

---

## أنواع الاختبارات

### 1. Unit Tests (اختبارات الوحدات)

اختبار كل مكون أو خدمة بشكل منعزل.

**مثال:**
```typescript
describe('OrderCard Component', () => {
  it('should render order information correctly', () => {
    render(<OrderCard order={mockOrder} />)
    expect(screen.getByText('ORD001')).toBeInTheDocument()
  })
})
```

### 2. Integration Tests (اختبارات التكامل)

اختبار التفاعل بين عدة مكونات أو خدمات.

**مثال:**
```typescript
describe('Admin Dashboard', () => {
  it('should load and display statistics', async () => {
    // اختبار التكامل بين Dashboard والـ Services
  })
})
```

### 3. E2E Tests (اختبارات السيناريوهات)

اختبار سيناريوهات المستخدم الكاملة.

**مثال:**
```typescript
describe('User Flow', () => {
  it('should login and view dashboard', async () => {
    // 1. تسجيل الدخول
    // 2. التحقق من الوصول إلى لوحة التحكم
    // 3. التحقق من عرض البيانات
  })
})
```

---

## مكتبات الاختبار المستخدمة

### Jest
- مشغل الاختبارات الرئيسي
- توفير محاكيات (mocks) وتجسيدات (stubs)

### React Testing Library
- اختبار React Components
- التركيز على اختبار السلوك وليس التنفيذ

### User Event
- محاكاة تفاعلات المستخدم الحقيقية

---

## كتابة اختبارات جديدة

### نموذج أساسي

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle user interaction', () => {
    const handleClick = jest.fn()
    render(<YourComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Best Practices

1. **اختبر السلوك وليس التنفيذ**
   ```typescript
   // ✅ جيد
   expect(screen.getByText('مرحباً')).toBeInTheDocument()
   
   // ❌ سيء
   expect(component.instance().state.message).toBe('مرحباً')
   ```

2. **استخدم Accessibility Queries**
   ```typescript
   // ✅ جيد
   screen.getByRole('button', { name: /Save/i })
   
   // ❌ سيء
   screen.getByTestId('save-button')
   ```

3. **اختبر جميع الحالات**
   ```typescript
   it('should show error message', () => { /* ... */ })
   it('should show loading state', () => { /* ... */ })
   it('should show success message', () => { /* ... */ })
   ```

---

## Mock البيانات

### Mock Supabase

```typescript
jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      }),
    }),
  },
}))
```

### Mock Services

```typescript
jest.mock('@/services/orderService', () => ({
  orderService: {
    getAllOrders: jest.fn().mockResolvedValue({
      orders: mockOrders,
      total: 100,
    }),
  },
}))
```

---

## تغطية الكود (Code Coverage)

الأهداف المطلوبة:

| النوع | الهدف |
|------|-------|
| Statements | 50%+ |
| Branches | 50%+ |
| Functions | 50%+ |
| Lines | 50%+ |

لعرض التقرير:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## اختبار الأداء

### مقاييس الأداء المهمة

1. **First Paint (FP)** - أول ظهور للمحتوى
2. **First Contentful Paint (FCP)** - أول ظهور للمحتوى الرئيسي
3. **Largest Contentful Paint (LCP)** - أكبر عنصر مرئي
4. **Time to Interactive (TTI)** - الوقت حتى التفاعل

### اختبار الأداء

```bash
# استخدام Lighthouse
npm run test:performance
```

---

## Debugging الاختبارات

### عرض DOM

```typescript
import { screen, debug } from '@testing-library/react'

it('should display correct content', () => {
  render(<Component />)
  debug() // يطبع DOM كاملاً
})
```

### استخدام Debugger

```typescript
it('should handle state', () => {
  render(<Component />)
  screen.logTestingPlaygroundURL() // رابط للتجربة التفاعلية
})
```

---

## CI/CD Integration

الاختبارات تعمل تلقائياً عند:
- Push للـ Repository
- Pull Request
- Deployment

---

## حل المشاكل الشائعة

### خطأ: "Cannot find module '@/...'"

**الحل:** تأكد من تكوين `moduleNameMapper` في jest.config.js

### خطأ: "act() warning"

**الحل:** استخدم `waitFor` عند انتظار التحديثات

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### خطأ: "querySelector returned null"

**الحل:** تأكد من أن العنصر موجود قبل الاختبار

```typescript
expect(screen.queryByText('Text')).toBeInTheDocument()
```

---

## موارد إضافية

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## النسب المستهدفة

- **Unit Test Coverage:** 80%+
- **Integration Test Coverage:** 70%+
- **E2E Test Coverage:** 50%+
- **Overall:** 70%+

---

## الاختبارات الحالية

✅ OrderCard Component Tests
✅ Table Component Tests
✅ Form Component Tests
✅ Auth Service Tests
✅ Order Service Tests
✅ Service Integration Tests
✅ E2E Scenario Tests

---

**آخر تحديث:** 15 سبتمبر 2026
**حالة الاختبارات:** جاهزة للتطوير المستمر
