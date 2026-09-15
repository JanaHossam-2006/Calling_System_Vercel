/**
 * اختبارات التكامل الشاملة
 * تختبر التفاعل بين الخدمات المختلفة
 */

import { authService } from '@/services/authService'
import { orderService } from '@/services/orderService'
import { searchService } from '@/services/searchService'
import { statsService } from '@/services/statsService'
import { followUpService } from '@/services/followUpService'

console.log('🧪 بدء اختبارات التكامل الشاملة\n')

// ==================== سيناريو 1: دورة حياة الطلب الكاملة ====================

export async function testOrderLifecycle() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🔄 اختبار دورة حياة الطلب الكاملة\n')

  try {
    // 1. جلب أول طلب
    console.log('📍 الخطوة 1: جلب طلب موجود...')
    const { orders } = await orderService.getAllOrders(1)
    if (orders.length === 0) {
      console.log('⚠️  لا توجد طلبات في النظام')
      return false
    }

    const order = orders[0]
    console.log(`✅ تم جلب الطلب: ${order.order_code}`)

    // 2. البحث عن الطلب
    console.log('\n📍 الخطوة 2: البحث عن الطلب...')
    const searchResult = await searchService.searchByOrderCode(order.order_code)
    if (searchResult?.id === order.id) {
      console.log(`✅ تم العثور على الطلب بالبحث`)
    }

    // 3. تحديث حالة الطلب
    console.log('\n📍 الخطوة 3: تحديث حالة الطلب...')
    const originalStatus = order.client_status
    const updatedOrder = await orderService.updateClientStatus(order.id, 'رد و يستلم')
    console.log(`✅ تم تحديث الحالة من "${originalStatus}" إلى "رد و يستلم"`)

    // 4. زيادة محاولات الاتصال
    console.log('\n📍 الخطوة 4: زيادة محاولات الاتصال...')
    const incrementedOrder = await orderService.incrementCallAttempts(order.id)
    console.log(`✅ محاولات الاتصال: ${incrementedOrder.call_attempts}`)

    // 5. إنشاء متابعة للطلب
    console.log('\n📍 الخطوة 5: إنشاء متابعة...')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const followUps = await followUpService.createFollowUpsFromOrder(order.id, [tomorrowStr])
    console.log(`✅ تم إنشاء ${followUps.length} متابعة`)

    // 6. جلب إحصائيات الطلب
    console.log('\n📍 الخطوة 6: جلب الإحصائيات...')
    if (order.employee_name) {
      const employeeStats = await statsService.getEmployeeStats(order.employee_name)
      console.log(`✅ إحصائيات الموظفة: ${employeeStats.total_orders} طلبات، ${employeeStats.delivery_percentage}% استلام`)
    }

    // 7. تسجيل التسليم
    console.log('\n📍 الخطوة 7: تسجيل التسليم...')
    const delivery = await orderService.recordDelivery(
      order.id,
      order.order_code,
      order.customer_phone,
      order.store
    )
    console.log(`✅ تم تسجيل التسليم`)

    // 8. تحديث المتابعة
    console.log('\n📍 الخطوة 8: إنهاء المتابعة...')
    if (followUps.length > 0) {
      await followUpService.completeFollowUpAndCloseOrder(followUps[0].id, 'delivered')
      console.log(`✅ تم إنهاء المتابعة`)
    }

    console.log('\n✅ تم اجتياز سيناريو دورة حياة الطلب بنجاح\n')
    return true
  } catch (error: any) {
    console.error('\n❌ خطأ في سيناريو دورة حياة الطلب:', error.message)
    return false
  }
}

// ==================== سيناريو 2: إدارة الموظفات والمتاجر ====================

export async function testEmployeeStoreManagement() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('👥 اختبار إدارة الموظفات والمتاجر\n')

  try {
    // 1. جلب ترتيب الموظفات
    console.log('📍 الخطوة 1: جلب ترتيب الموظفات...')
    const topEmployees = await statsService.getEmployeeRanking(5)
    console.log(`✅ تم جلب ${topEmployees.length} موظفات الأفضل أداءً`)
    topEmployees.forEach((emp) => {
      console.log(`   #${emp.rank}: ${emp.employee_name} - ${emp.delivery_percentage}%`)
    })

    // 2. جلب بيانات موظفة معينة
    if (topEmployees.length > 0) {
      console.log('\n📍 الخطوة 2: جلب بيانات موظفة معينة...')
      const employeeName = topEmployees[0].employee_name
      const { orders } = await orderService.getEmployeeOrders(employeeName, 5)
      console.log(`✅ الموظفة "${employeeName}" لديها ${orders.length} طلبات`)

      const stats = await statsService.getEmployeeStats(employeeName)
      console.log(`   إجمالي الطلبات: ${stats.total_orders}`)
      console.log(`   المسلمة: ${stats.delivered_count}`)
      console.log(`   نسبة التسليم: ${stats.delivery_percentage}%`)
    }

    // 3. جلب ترتيب المتاجر
    console.log('\n📍 الخطوة 3: جلب ترتيب المتاجر...')
    const topStores = await statsService.getStoreRanking(5)
    console.log(`✅ تم جلب ${topStores.length} متاجر الأفضل أداءً`)
    topStores.forEach((store) => {
      console.log(`   #${store.rank}: ${store.store} - ${store.delivery_percentage}%`)
    })

    // 4. جلب بيانات متجر معين
    if (topStores.length > 0) {
      console.log('\n📍 الخطوة 4: جلب بيانات متجر معين...')
      const storeName = topStores[0].store
      const { orders: storeOrders } = await orderService.getStoreOrders(storeName, undefined, 5)
      console.log(`✅ المتجر "${storeName}" لديه ${storeOrders.length} طلبات`)

      const stats = await statsService.getStoreStats(storeName)
      console.log(`   إجمالي الطلبات: ${stats.total_orders}`)
      console.log(`   المسلمة: ${stats.delivered_count}`)
    }

    // 5. مقارنة الأداء
    console.log('\n📍 الخطوة 5: مقارنة الأداء الإجمالي...')
    const adminDash = await statsService.getAdminDashboard()
    console.log(`✅ ملخص الأداء:`)
    console.log(`   الموظفات: ${adminDash.employeeCount}`)
    console.log(`   المتاجر: ${adminDash.storeCount}`)
    console.log(`   إجمالي الطلبات: ${adminDash.totalOrders}`)
    console.log(`   معدل التسليم: ${Math.round((adminDash.deliveredCount / adminDash.totalOrders) * 100)}%`)

    console.log('\n✅ تم اجتياز سيناريو إدارة الموظفات والمتاجر بنجاح\n')
    return true
  } catch (error: any) {
    console.error('\n❌ خطأ في سيناريو إدارة الموظفات والمتاجر:', error.message)
    return false
  }
}

// ==================== سيناريو 3: البحث والفلترة ====================

export async function testSearchAndFiltering() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🔍 اختبار البحث والفلترة\n')

  try {
    // 1. البحث الشامل
    console.log('📍 الخطوة 1: البحث الشامل...')
    const { current, archived } = await searchService.searchOrders('test', 10)
    console.log(`✅ نتائج البحث: ${current.length} في الحالي، ${archived.length} في الأرشيف`)

    // 2. البحث حسب حالة معينة
    console.log('\n📍 الخطوة 2: البحث حسب الحالة "رد و يستلم"...')
    const { orders: readyOrders } = await orderService.getOrdersByStatus('رد و يستلم', 10)
    console.log(`✅ وجدنا ${readyOrders.length} طلب بحالة "رد و يستلم"`)

    // 3. البحث عن الطلبات المعلقة
    console.log('\n📍 الخطوة 3: البحث عن الطلبات المعلقة...')
    const pendingOrders = await searchService.searchPendingOrders()
    console.log(`✅ عدد الطلبات المعلقة: ${pendingOrders.length}`)

    // 4. البحث عن الطلبات المسلمة
    console.log('\n📍 الخطوة 4: البحث عن الطلبات المسلمة...')
    const { orders: deliveredOrders } = await searchService.searchDelivered(10)
    console.log(`✅ عدد الطلبات المسلمة: ${deliveredOrders.length}`)

    // 5. البحث المتقدم بفلاتر متعددة
    console.log('\n📍 الخطوة 5: البحث المتقدم بفلاتر متعددة...')
    const advancedResults = await searchService.advancedSearch({
      clientStatus: 'رد و يستلم',
      limit: 10,
    })
    console.log(`✅ نتائج البحث المتقدم: ${advancedResults.orders.length} طلب`)

    // 6. جلب الطلبات بدون حالة
    console.log('\n📍 الخطوة 6: جلب الطلبات بدون حالة...')
    const { orders: noStatusOrders } = await orderService.getOrdersWithoutStatus(undefined, 10)
    console.log(`✅ عدد الطلبات بدون حالة: ${noStatusOrders.length}`)

    console.log('\n✅ تم اجتياز سيناريو البحث والفلترة بنجاح\n')
    return true
  } catch (error: any) {
    console.error('\n❌ خطأ في سيناريو البحث والفلترة:', error.message)
    return false
  }
}

// ==================== سيناريو 4: إدارة المتابعات ====================

export async function testFollowUpManagement() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📅 اختبار إدارة المتابعات\n')

  try {
    // 1. جلب المتابعات المعلقة
    console.log('📍 الخطوة 1: جلب المتابعات المعلقة...')
    const { followUps: pendingFollowUps } = await followUpService.getPendingFollowUps(10)
    console.log(`✅ عدد المتابعات المعلقة: ${pendingFollowUps.length}`)

    // 2. جلب المتابعات المستحقة
    console.log('\n📍 الخطوة 2: جلب المتابعات المستحقة اليوم...')
    const dueFollowUps = await followUpService.getDueFollowUps()
    console.log(`✅ عدد المتابعات المستحقة: ${dueFollowUps.length}`)

    // 3. جلب المتابعات المستقبلية
    console.log('\n📍 الخطوة 3: جلب المتابعات خلال أسبوع...')
    const upcomingFollowUps = await followUpService.getUpcomingFollowUps(7)
    console.log(`✅ عدد المتابعات القادمة: ${upcomingFollowUps.length}`)

    // 4. جلب إحصائيات المتابعات
    console.log('\n📍 الخطوة 4: جلب إحصائيات المتابعات...')
    const followUpStats = await followUpService.getFollowUpStats()
    console.log(`✅ إحصائيات المتابعات:`)
    console.log(`   الإجمالي: ${followUpStats.total}`)
    console.log(`   المعلقة: ${followUpStats.pending}`)
    console.log(`   المكتملة: ${followUpStats.completed}`)
    console.log(`   الملغاة: ${followUpStats.cancelled}`)

    // 5. معالجة متابعة معينة
    if (dueFollowUps.length > 0) {
      console.log('\n📍 الخطوة 5: معالجة متابعة...')
      const followUp = dueFollowUps[0]
      
      // إضافة ملاحظة
      await followUpService.addNote(followUp.id, 'تم الاتصال - العميل لم يرد')
      console.log(`✅ تمت إضافة ملاحظة`)

      // تحديث الحالة
      await followUpService.updateFollowUpStatus(followUp.id, 'completed')
      console.log(`✅ تم تحديث الحالة إلى "مكتملة"`)
    }

    console.log('\n✅ تم اجتياز سيناريو إدارة المتابعات بنجاح\n')
    return true
  } catch (error: any) {
    console.error('\n❌ خطأ في سيناريو إدارة المتابعات:', error.message)
    return false
  }
}

// ==================== سيناريو 5: الإحصائيات والتقارير ====================

export async function testReportingAndAnalytics() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📊 اختبار الإحصائيات والتقارير\n')

  try {
    // 1. جلب الإحصائيات السريعة
    console.log('📍 الخطوة 1: جلب الإحصائيات السريعة...')
    const quickStats = await statsService.getQuickStats()
    console.log(`✅ الإجمالي: ${quickStats.total}، المسلمة: ${quickStats.delivered}، النسبة: ${quickStats.percentage}%`)

    // 2. جلب لوحة المدير
    console.log('\n📍 الخطوة 2: جلب لوحة المدير الشاملة...')
    const adminDash = await statsService.getAdminDashboard()
    console.log(`✅ تم جلب لوحة المدير بنجاح`)
    console.log(`   الموظفات: ${adminDash.employeeCount}`)
    console.log(`   المتاجر: ${adminDash.storeCount}`)
    console.log(`   معدل الإلغاء: ${Math.round((adminDash.cancelledCount / adminDash.totalOrders) * 100)}%`)

    // 3. جلب تقرير يومي
    console.log('\n📍 الخطوة 3: جلب تقرير يومي...')
    const today = new Date().toISOString().split('T')[0]
    const dailyReport = await statsService.getDailyReport(today)
    console.log(`✅ التقرير اليومي (${today}):`)
    console.log(`   الطلبات: ${dailyReport.total}`)
    console.log(`   المسلمة: ${dailyReport.delivered}`)
    console.log(`   النسبة: ${dailyReport.percentage}%`)

    // 4. جلب اتجاهات الأداء
    console.log('\n📍 الخطوة 4: جلب اتجاهات الأداء (آخر 7 أيام)...')
    const trends = await statsService.getPerformanceTrend(7)
    console.log(`✅ البيانات المتوفرة: ${trends.length} يوم`)
    const lastDay = trends[trends.length - 1]
    console.log(`   آخر يوم (${lastDay.date}): ${lastDay.percentage}%`)

    // 5. جلب إحصائيات الحالات
    console.log('\n📍 الخطوة 5: جلب إحصائيات حالات العميل...')
    const clientStatuses = await statsService.getClientStatusStats()
    console.log(`✅ عدد الحالات: ${clientStatuses.length}`)

    console.log('\n✅ تم اجتياز سيناريو الإحصائيات والتقارير بنجاح\n')
    return true
  } catch (error: any) {
    console.error('\n❌ خطأ في سيناريو الإحصائيات والتقارير:', error.message)
    return false
  }
}

// ==================== تشغيل جميع السيناريوهات ====================

export async function runAllIntegrationTests() {
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║    🧪 اختبارات التكامل الشاملة لنظام الطلبات                 ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  const results = {
    orderLifecycle: await testOrderLifecycle(),
    employeeStore: await testEmployeeStoreManagement(),
    search: await testSearchAndFiltering(),
    followUp: await testFollowUpManagement(),
    reporting: await testReportingAndAnalytics(),
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 ملخص نتائج اختبارات التكامل:\n')

  const totalTests = Object.values(results).length
  const passedTests = Object.values(results).filter((r) => r).length

  console.log(`✅ النتيجة النهائية: ${passedTests}/${totalTests} سيناريوهات نجحت\n`)
  console.log(`dورة حياة الطلب: ${results.orderLifecycle ? '✅' : '❌'}`)
  console.log(`إدارة الموظفات والمتاجر: ${results.employeeStore ? '✅' : '❌'}`)
  console.log(`البحث والفلترة: ${results.search ? '✅' : '❌'}`)
  console.log(`إدارة المتابعات: ${results.followUp ? '✅' : '❌'}`)
  console.log(`الإحصائيات والتقارير: ${results.reporting ? '✅' : '❌'}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (passedTests === totalTests) {
    console.log('🎉 جميع اختبارات التكامل نجحت!')
    console.log('✨ النظام جاهز للاستخدام!\n')
    return true
  } else {
    console.log(`⚠️  ${totalTests - passedTests} سيناريو فشل. يرجى المراجعة.\n`)
    return false
  }
}

// تشغيل الاختبارات
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  runAllIntegrationTests().catch(console.error)
}
