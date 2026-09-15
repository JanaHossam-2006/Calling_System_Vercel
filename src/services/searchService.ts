import { supabase } from '@/utils/supabase'
import { Order } from '@/types'

/**
 * خدمات البحث المتقدمة
 */
export const searchService = {
  /**
   * البحث الشامل في الطلبات والأرشيف
   */
  async searchOrders(query: string, limit: number = 50) {
    try {
      const searchQuery = query.trim().toLowerCase()
      if (!searchQuery) return { current: [], archived: [] }

      // البحث في الطلبات الحالية
      const { data: currentOrders, error: currentError } = await supabase
        .from('daily_orders')
        .select('*')
        .or(`order_code.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
        .limit(limit)

      if (currentError && currentError.code !== 'PGRST116') throw currentError

      // البحث في الطلبات المؤرشفة
      const { data: archivedOrders, error: archivedError } = await supabase
        .from('archived_orders')
        .select('*')
        .or(`order_code.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
        .limit(limit)

      if (archivedError && archivedError.code !== 'PGRST116') throw archivedError

      return {
        current: currentOrders || [],
        archived: archivedOrders || [],
      }
    } catch (error: any) {
      console.error('خطأ في البحث:', error)
      throw error
    }
  },

  /**
   * البحث حسب كود الطلب
   */
  async searchByOrderCode(orderCode: string) {
    try {
      const { data, error } = await supabase
        .from('daily_orders')
        .select('*')
        .eq('order_code', orderCode)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error: any) {
      console.error('خطأ في البحث بالكود:', error)
      throw error
    }
  },

  /**
   * البحث حسب رقم العميل
   */
  async searchByCustomerPhone(phone: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('daily_orders')
        .select('*')
        .eq('customer_phone', phone)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في البحث برقم العميل:', error)
      throw error
    }
  },

  /**
   * البحث المتقدم مع فلاتر
   */
  async advancedSearch(filters: {
    orderCode?: string
    customerPhone?: string
    employeeName?: string
    store?: string
    clientStatus?: string
    shipmentStatus?: string
    fromDate?: string
    toDate?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })

      // تطبيق الفلاتر
      if (filters.orderCode) {
        query = query.ilike('order_code', `%${filters.orderCode}%`)
      }
      if (filters.customerPhone) {
        query = query.ilike('customer_phone', `%${filters.customerPhone}%`)
      }
      if (filters.employeeName) {
        query = query.eq('employee_name', filters.employeeName)
      }
      if (filters.store) {
        query = query.eq('store', filters.store)
      }
      if (filters.clientStatus) {
        query = query.eq('client_status', filters.clientStatus)
      }
      if (filters.shipmentStatus) {
        query = query.eq('shipment_status', filters.shipmentStatus)
      }
      if (filters.fromDate) {
        query = query.gte('order_date', filters.fromDate)
      }
      if (filters.toDate) {
        query = query.lte('order_date', filters.toDate)
      }

      const limit = filters.limit || 50
      const offset = filters.offset || 0

      const { data, error, count } = await query
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث المتقدم:', error)
      throw error
    }
  },

  /**
   * البحث حسب الموظفة
   */
  async searchByEmployee(employeeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('employee_name', employeeName)
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث حسب الموظفة:', error)
      throw error
    }
  },

  /**
   * البحث حسب المتجر
   */
  async searchByStore(storeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('store', storeName)
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث حسب المتجر:', error)
      throw error
    }
  },

  /**
   * البحث في الأرشيف
   */
  async searchArchived(query: string, limit: number = 50) {
    try {
      const searchQuery = query.trim().toLowerCase()
      if (!searchQuery) return []

      const { data, error } = await supabase
        .from('archived_orders')
        .select('*')
        .or(`order_code.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في البحث في الأرشيف:', error)
      throw error
    }
  },

  /**
   * البحث عن الطلبات المعلقة (التي تحتاج متابعة)
   */
  async searchPendingOrders(employeeName?: string) {
    try {
      let query = supabase
        .from('daily_orders')
        .select('*')
        .is('client_status', null)
        .or('client_status.eq.')

      if (employeeName) {
        query = query.eq('employee_name', employeeName)
      }

      const { data, error } = await query.order('order_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في البحث عن الطلبات المعلقة:', error)
      throw error
    }
  },

  /**
   * البحث عن الطلبات التي لم تُسلم
   */
  async searchNotDelivered(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('delivered', 'no')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث عن الطلبات غير المسلمة:', error)
      throw error
    }
  },

  /**
   * البحث عن الطلبات المسلمة
   */
  async searchDelivered(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('delivered', 'yes')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث عن الطلبات المسلمة:', error)
      throw error
    }
  },

  /**
   * البحث عن طلبات "لم يرد"
   */
  async searchNoAnswer(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('client_status', 'لم يرد')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث عن طلبات لم يرد:', error)
      throw error
    }
  },

  /**
   * البحث عن الطلبات الملغاة
   */
  async searchCancelled(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('client_status', 'الغى الطلب')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في البحث عن الطلبات الملغاة:', error)
      throw error
    }
  },
}
