/**
 * اختبارات شاملة لجميع الخدمات
 * يتم تشغيلها مع Supabase مباشرة
 */

import { authService } from '@/services/authService'
import { orderService } from '@/services/orderService'
import { searchService } from '@/services/searchService'
import { statsService } from '@/services/statsService'
import { followUpService } from '@/services/followUpService'

// ==================== اختبار Auth Service ====================

console.log('🔐 بدء اختبارات Auth Service...\n')

export async function testAuthService() {
  try {
    console.log('📝 اختبار #1: الحصول على المستخدم الحالي')
    const currentUser = await authService.getCurrentUser()
    console.log('✅ المستخدم الحالي:', currentUser?.name || 'لم يسجل الدخول')

    console.log('\n📝 اختبار #2: جلب جميع المستخدمين')
    const allUsers = await authService.getAllUsers()
    console.log(`✅ عدد المستخدمين: ${allUsers.length}`)

    console.log('\n📝 اختبار #3: جلب مستخدم واحد (إذا كان هناك)')
    if (allUsers.length > 0) {
      const user = await authService.getUser(allUsers[0].id)
      console.log(`✅ تم جلب المستخدم: ${user?.name}`)
    }

    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار Auth Service:', error.message)
    return false
  }
}

// ==================== اختبار Order Service ====================

console.log('\n🛒 بدء اختبارات Order Service...\n')

export async function testOrderService() {
  try {
    console.log('📝 اختبار #1: جلب جميع الطلبات')
    const { orders, total } = await orderService.getAllOrders(10, 0)
    console.log(`✅ تم جلب ${orders.length} من أصل ${total} طلب`)

    if (orders.length > 0) {
      const firstOrder = orders[0]

      console.log('\n📝 اختبار #2: جلب طلب واحد')
      const singleOrder = await orderService.getOrder(firstOrder.id)
      console.log(`✅ تم جلب الطلب: ${singleOrder?.order_code}`)

      console.log('\n📝 اختبار #3: جلب إحصائيات سريعة')
      const stats = await orderService.getQuickStats()
      console.log(`✅ إحصائيات: ${stats.total} طلب، ${stats.delivered} مسلم (${stats.percentage}%)`)

      console.log('\n📝 اختبار #4: جلب الطلبات حسب الحالة')
      const { orders: statusOrders } = await orderService.getOrdersByStatus('رد و يستلم', 5)
      console.log(`✅ تم جلب ${statusOrders.length} طلب بحالة "رد و يستلم"`)
    }

    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار Order Service:', error.message)
    return false
  }
}

// ==================== اختبار Search Service ====================

console.log('\n🔍 بدء اختبارات Search Service...\n')

export async function testSearchService() {
  try {
    console.log('📝 اختبار #1: البحث الشامل')
    const { current, archived } = await searchService.searchOrders('test', 5)
    console.log(`✅ تم البحث: ${current.length} في الحالي، ${archived.length} في الأرشيف`)

    console.log('\n📝 اختبار #2: البحث عن الطلبات المعلقة')
    const pendingOrders = await searchService.searchPendingOrders()
    console.log(`✅ عدد الطلبات المعلقة: ${pendingOrders.length}`)

    console.log('\n📝 اختبار #3: البحث عن الطلبات المسلمة')
    const { orders: deliveredOrders } = await searchService.searchDelivered(5)
    console.log(`✅ عدد الطلبات المسلمة: ${deliveredOrders.length}`)

    console.log('\n📝 اختبار #4: البحث عن طلبات "لم يرد"')
    const { orders: noAnswerOrders } = await searchService.searchNoAnswer(5)
    console.log(`✅ عدد طلبات "لم يرد": ${noAnswerOrders.length}`)

    console.log('\n📝 اختبار #5: البحث المتقدم')
    const { orders: advancedOrders } = await searchService.advancedSearch({
      limit: 5,
      clientStatus: 'رد و يستلم',
    })
    console.log(`✅ نتائج البحث المتقدم: ${advancedOrders.length} طلب`)

    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار Search Service:', error.message)
    return false
  }
}

// ==================== اختبار Stats Service ====================

console.log('\n📊 بدء اختبارات Stats Service...\n')

export async function testStatsService() {
  try {
    console.log('📝 اختبار #1: جلب لوحة المدير الشاملة')
    const adminDash = await statsService.getAdminDashboard()
    console.log(`✅ لوحة المدير:
      📦 إجمالي الطلبات: ${adminDash.totalOrders}
      👥 عدد الموظفات: ${adminDash.employeeCount}
      🏪 عدد المتاجر: ${adminDash.storeCount}
      ✅ مسلمة: ${adminDash.deliveredCount}
      ❌ ملغاة: ${adminDash.cancelledCount}
      🔕 لم يرد: ${adminDash.noAnswerCount}`)

    console.log('\n📝 اختبار #2: جلب ترتيب الموظفات')
    const employeeRanking = await statsService.getEmployeeRanking(5)
    console.log(`✅ تم جلب ${employeeRanking.length} موظفات الأفضل أداءً`)
    employeeRanking.forEach((emp) => {
      console.log(`   #${emp.rank}: ${emp.employee_name} - ${emp.delivery_percentage}%`)
    })

    console.log('\n📝 اختبار #3: جلب ترتيب المتاجر')
    const storeRanking = await statsService.getStoreRanking(5)
    console.log(`✅ تم جلب ${storeRanking.length} متاجر الأفضل أداءً`)

    console.log('\n📝 اختبار #4: جلب الإحصائيات السريعة')
    const quickStats = await statsService.getQuickStats()
    console.log(`✅ إحصائيات سريعة:
      📦 الإجمالي: ${quickStats.total}
      ✅ مسلمة: ${quickStats.delivered}
      ❌ لم تسلم: ${quickStats.notDelivered}
      📈 النسبة: ${quickStats.percentage}%`)

    console.log('\n📝 اختبار #5: جلب إحصائيات حالات العميل')
    const clientStatuses = await statsService.getClientStatusStats()
    console.log(`✅ عدد حالات العميل: ${clientStatuses.length}`)

    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار Stats Service:', error.message)
    return false
  }
}

// ==================== اختبار Follow-Up Service ====================

console.log('\n📅 بدء اختبارات Follow-Up Service...\n')

export async function testFollowUpService() {
  try {
    console.log('📝 اختبار #1: جلب جميع المتابعات')
    const { followUps, total } = await followUpService.getAllFollowUps(10, 0)
    console.log(`✅ تم جلب ${followUps.length} من أصل ${total} متابعة`)

    console.log('\n📝 اختبار #2: جلب المتابعات المعلقة')
    const { followUps: pendingFollowUps } = await followUpService.getPendingFollowUps(5)
    console.log(`✅ عدد المتابعات المعلقة: ${pendingFollowUps.length}`)

    console.log('\n📝 اختبار #3: جلب المتابعات المستحقة')
    const dueFollowUps = await followUpService.getDueFollowUps()
    console.log(`✅ عدد المتابعات المستحقة اليوم: ${dueFollowUps.length}`)

    console.log('\n📝 اختبار #4: جلب المتابعات المستقبلية')
    const upcomingFollowUps = await followUpService.getUpcomingFollowUps(7)
    console.log(`✅ عدد المتابعات خلال أسبوع: ${upcomingFollowUps.length}`)

    console.log('\n📝 اختبار #5: جلب إحصائيات المتابعات')
    const followUpStats = await followUpService.getFollowUpStats()
    console.log(`✅ إحصائيات المتابعات:
      📊 الإجمالي: ${followUpStats.total}
      ⏳ المعلقة: ${followUpStats.pending}
      ✅ المكتملة: ${followUpStats.completed}
      ❌ الملغاة: ${followUpStats.cancelled}`)

    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار Follow-Up Service:', error.message)
    return false
  }
}

// ==================== تشغيل جميع الاختبارات ====================

export async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════\n')
  console.log('🚀 بدء تشغيل اختبارات جميع الخدمات\n')
  console.log('═══════════════════════════════════════════════════════\n')

  const results = {
    auth: await testAuthService(),
    orders: await testOrderService(),
    search: await testSearchService(),
    stats: await testStatsService(),
    followUp: await testFollowUpService(),
  }

  console.log('\n═══════════════════════════════════════════════════════\n')
  console.log('📋 ملخص نتائج الاختبارات:\n')

  const totalTests = Object.values(results).length
  const passedTests = Object.values(results).filter((r) => r).length

  console.log(`✅ الاختبارات الناجحة: ${passedTests}/${totalTests}`)
  console.log(`Auth Service: ${results.auth ? '✅' : '❌'}`)
  console.log(`Order Service: ${results.orders ? '✅' : '❌'}`)
  console.log(`Search Service: ${results.search ? '✅' : '❌'}`)
  console.log(`Stats Service: ${results.stats ? '✅' : '❌'}`)
  console.log(`Follow-Up Service: ${results.followUp ? '✅' : '❌'}`)

  console.log('\n═══════════════════════════════════════════════════════\n')

  if (passedTests === totalTests) {
    console.log('🎉 جميع الاختبارات نجحت!')
    return true
  } else {
    console.log(`⚠️  ${totalTests - passedTests} اختبار فشل. يرجى المراجعة.`)
    return false
  }
}

// للاستخدام في بيئة التطوير
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  runAllTests().catch(console.error)
}
