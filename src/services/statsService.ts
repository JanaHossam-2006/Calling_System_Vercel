import { supabase } from '@/utils/supabase'
import { AdminDashboardData, EmployeeStats, StoreStats } from '@/types'

/**
 * خدمات الإحصائيات والتقارير
 */
export const statsService = {
  /**
   * جلب إحصائيات الموظفة
   */
  async getEmployeeStats(employeeName: string) {
    try {
      const { data, error } = await supabase
        .from('employee_statistics')
        .select('*')
        .eq('employee_name', employeeName)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return (
        data || {
          employee_name: employeeName,
          total_orders: 0,
          delivered_count: 0,
          not_delivered_count: 0,
          delivery_percentage: 0,
        }
      )
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات الموظفة:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات جميع الموظفات
   */
  async getAllEmployeeStats() {
    try {
      const { data, error } = await supabase
        .from('employee_statistics')
        .select('*')
        .order('delivery_percentage', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات الموظفات:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات المتجر
   */
  async getStoreStats(storeName: string) {
    try {
      const { data, error } = await supabase
        .from('store_statistics')
        .select('*')
        .eq('store', storeName)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return (
        data || {
          store: storeName,
          total_orders: 0,
          delivered_count: 0,
          not_delivered_count: 0,
          delivery_percentage: 0,
        }
      )
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات المتجر:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات جميع المتاجر
   */
  async getAllStoreStats() {
    try {
      const { data, error } = await supabase
        .from('store_statistics')
        .select('*')
        .order('delivery_percentage', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات المتاجر:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات حالات العميل
   */
  async getClientStatusStats() {
    try {
      const { data, error } = await supabase
        .from('client_status_statistics')
        .select('*')
        .order('total_orders', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات حالات العميل:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات حالات الشحنة
   */
  async getShipmentStatusStats() {
    try {
      const { data, error } = await supabase
        .from('shipment_status_statistics')
        .select('*')
        .order('total_orders', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات حالات الشحنة:', error)
      throw error
    }
  },

  /**
   * جلب لوحة المدير الشاملة
   */
  async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      // جلب الطلبات
      const { data: orders, error: ordersError } = await supabase
        .from('daily_orders')
        .select('*')
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')

      if (ordersError) throw ordersError

      const orderList = orders || []

      // حساب الإحصائيات الأساسية
      const totalOrders = orderList.length
      const deliveredCount = orderList.filter((o) => o.delivered === 'yes').length
      const cancelledCount = orderList.filter((o) => o.client_status === 'الغى الطلب').length
      const noAnswerCount = orderList.filter((o) => o.client_status === 'لم يرد').length
      const readyCount = orderList.filter((o) => o.client_status === 'رد و يستلم').length

      // جلب إحصائيات الموظفات
      const employeeStats = await this.getAllEmployeeStats()
      const employeeCount = employeeStats.length

      // جلب إحصائيات المتاجر
      const storeStats = await this.getAllStoreStats()
      const storeCount = storeStats.length

      // جلب إحصائيات حالات العميل
      const clientStatuses = await this.getClientStatusStats()

      // جلب إحصائيات حالات الشحنة
      const shipmentStatuses = await this.getShipmentStatusStats()

      return {
        totalOrders,
        employeeCount,
        storeCount,
        deliveredCount,
        cancelledCount,
        noAnswerCount,
        employees: employeeStats,
        stores: storeStats,
        clientStatuses,
        shipmentStatuses,
      }
    } catch (error: any) {
      console.error('خطأ في جلب لوحة المدير:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات سريعة
   */
  async getQuickStats() {
    try {
      const { data: orders, error } = await supabase
        .from('daily_orders')
        .select('delivered, client_status')
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')

      if (error) throw error

      const orderList = orders || []
      const total = orderList.length
      const delivered = orderList.filter((o) => o.delivered === 'yes').length
      const notDelivered = total - delivered

      return {
        total,
        delivered,
        notDelivered,
        percentage: total > 0 ? Math.round((delivered / total) * 100) : 0,
      }
    } catch (error: any) {
      console.error('خطأ في جلب الإحصائيات السريعة:', error)
      throw error
    }
  },

  /**
   * جلب ترتيب الموظفات
   */
  async getEmployeeRanking(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('employee_statistics')
        .select('*')
        .order('delivery_percentage', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((emp, index) => ({
        ...emp,
        rank: index + 1,
      }))
    } catch (error: any) {
      console.error('خطأ في جلب ترتيب الموظفات:', error)
      throw error
    }
  },

  /**
   * جلب ترتيب المتاجر
   */
  async getStoreRanking(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('store_statistics')
        .select('*')
        .order('delivery_percentage', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((store, index) => ({
        ...store,
        rank: index + 1,
      }))
    } catch (error: any) {
      console.error('خطأ في جلب ترتيب المتاجر:', error)
      throw error
    }
  },

  /**
   * جلب تقرير الأداء اليومي
   */
  async getDailyReport(date: string) {
    try {
      const startDate = `${date}T00:00:00`
      const endDate = `${date}T23:59:59`

      const { data, error } = await supabase
        .from('daily_orders')
        .select('*')
        .gte('order_date', startDate)
        .lte('order_date', endDate)
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')

      if (error) throw error

      const orders = data || []
      const delivered = orders.filter((o) => o.delivered === 'yes').length
      const cancelled = orders.filter((o) => o.client_status === 'الغى الطلب').length

      return {
        date,
        total: orders.length,
        delivered,
        cancelled,
        percentage: orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0,
        byEmployee: this.groupByEmployee(orders),
        byStore: this.groupByStore(orders),
      }
    } catch (error: any) {
      console.error('خطأ في جلب التقرير اليومي:', error)
      throw error
    }
  },

  /**
   * تجميع الطلبات حسب الموظفة
   */
  private groupByEmployee(
    orders: any[]
  ): Record<string, { total: number; delivered: number; percentage: number }> {
    const grouped: Record<string, { total: number; delivered: number; percentage: number }> = {}

    orders.forEach((order) => {
      const emp = order.employee_name || 'غير محدد'
      if (!grouped[emp]) {
        grouped[emp] = { total: 0, delivered: 0, percentage: 0 }
      }
      grouped[emp].total++
      if (order.delivered === 'yes') {
        grouped[emp].delivered++
      }
    })

    // حساب النسبة
    Object.keys(grouped).forEach((emp) => {
      const stat = grouped[emp]
      stat.percentage = stat.total > 0 ? Math.round((stat.delivered / stat.total) * 100) : 0
    })

    return grouped
  },

  /**
   * تجميع الطلبات حسب المتجر
   */
  private groupByStore(
    orders: any[]
  ): Record<string, { total: number; delivered: number; percentage: number }> {
    const grouped: Record<string, { total: number; delivered: number; percentage: number }> = {}

    orders.forEach((order) => {
      const store = order.store || 'غير محدد'
      if (!grouped[store]) {
        grouped[store] = { total: 0, delivered: 0, percentage: 0 }
      }
      grouped[store].total++
      if (order.delivered === 'yes') {
        grouped[store].delivered++
      }
    })

    // حساب النسبة
    Object.keys(grouped).forEach((store) => {
      const stat = grouped[store]
      stat.percentage = stat.total > 0 ? Math.round((stat.delivered / stat.total) * 100) : 0
    })

    return grouped
  },

  /**
   * جلب اتجاهات الأداء (آخر 7 أيام)
   */
  async getPerformanceTrend(days: number = 7) {
    try {
      const trends = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const report = await this.getDailyReport(dateStr)
        trends.push({
          date: dateStr,
          total: report.total,
          delivered: report.delivered,
          percentage: report.percentage,
        })
      }

      return trends
    } catch (error: any) {
      console.error('خطأ في جلب اتجاهات الأداء:', error)
      throw error
    }
  },
}
