import { supabase } from '@/utils/supabase'
import { Order } from '@/types'

/**
 * خدمات الطلبات
 */
export const orderService = {
  /**
   * جلب جميع الطلبات
   */
  async getAllOrders(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات:', error)
      throw error
    }
  },

  /**
   * جلب طلبات موظف معين
   */
  async getEmployeeOrders(employeeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('employee_name', employeeName)
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب طلبات الموظف:', error)
      throw error
    }
  },

  /**
   * جلب طلبات متجر معين (حسب الحالة)
   */
  async getStoreOrders(storeName: string, status?: string, limit: number = 100, offset: number = 0) {
    try {
      let query = supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('store', storeName)

      if (status) {
        query = query.eq('client_status', status)
      }

      const { data, error, count } = await query
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب طلبات المتجر:', error)
      throw error
    }
  },

  /**
   * جلب طلب واحد
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('daily_orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في جلب الطلب:', error)
      throw error
    }
  },

  /**
   * إنشاء طلب جديد
   */
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('daily_orders')
        .insert([order])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في إنشاء طلب:', error)
      throw error
    }
  },

  /**
   * تحديث طلب
   */
  async updateOrder(orderId: string, updates: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('daily_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في تحديث الطلب:', error)
      throw error
    }
  },

  /**
   * حذف طلب
   */
  async deleteOrder(orderId: string) {
    try {
      const { error } = await supabase
        .from('daily_orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('خطأ في حذف الطلب:', error)
      throw error
    }
  },

  /**
   * تحديث حالة العميل
   */
  async updateClientStatus(orderId: string, status: string) {
    try {
      return await this.updateOrder(orderId, {
        client_status: status,
      })
    } catch (error: any) {
      console.error('خطأ في تحديث حالة العميل:', error)
      throw error
    }
  },

  /**
   * تحديث حالة الشحنة
   */
  async updateShipmentStatus(orderId: string, status: string) {
    try {
      return await this.updateOrder(orderId, {
        shipment_status: status,
      })
    } catch (error: any) {
      console.error('خطأ في تحديث حالة الشحنة:', error)
      throw error
    }
  },

  /**
   * زيادة عدد محاولات الاتصال
   */
  async incrementCallAttempts(orderId: string) {
    try {
      const order = await this.getOrder(orderId)
      if (!order) throw new Error('الطلب غير موجود')

      const newAttempts = (order.call_attempts || 0) + 1
      return await this.updateOrder(orderId, {
        call_attempts: newAttempts,
        more_than_5_attempts: newAttempts > 5,
      })
    } catch (error: any) {
      console.error('خطأ في زيادة محاولات الاتصال:', error)
      throw error
    }
  },

  /**
   * إضافة ملاحظة للطلب
   */
  async addNote(orderId: string, noteType: 'client' | 'agent' | 'admin', note: string) {
    try {
      const updates: Record<string, string> = {
        client: 'client_note',
        agent: 'representative_note',
        admin: 'admin_note',
      }

      return await this.updateOrder(orderId, {
        [updates[noteType]]: note,
      })
    } catch (error: any) {
      console.error('خطأ في إضافة الملاحظة:', error)
      throw error
    }
  },

  /**
   * جلب الطلبات بحسب حالة معينة
   */
  async getOrdersByStatus(status: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('client_status', status)
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات حسب الحالة:', error)
      throw error
    }
  },

  /**
   * جلب الطلبات بدون حالة (محدد للموظفات)
   */
  async getOrdersWithoutStatus(employeeName?: string, limit: number = 100, offset: number = 0) {
    try {
      let query = supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .is('client_status', null)
        .or('client_status.eq.')

      if (employeeName) {
        query = query.eq('employee_name', employeeName)
      }

      const { data, error, count } = await query
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات بدون حالة:', error)
      throw error
    }
  },

  /**
   * جلب الطلبات الجاهزة للشحن
   */
  async getPendingShipmentOrders(employeeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('daily_orders')
        .select('*', { count: 'exact' })
        .eq('employee_name', employeeName)
        .eq('client_status', 'رد و يستلم')
        .is('shipment_status', null)
        .not('order_note', 'ilike', '%مرتجع%')
        .not('order_note', 'ilike', '%مؤجل%')
        .not('order_note', 'ilike', '%مراجعه%')
        .order('order_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { orders: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب الطلبات الجاهزة للشحن:', error)
      throw error
    }
  },

  /**
   * تسجيل تسليم (إضافة إلى جدول deliveries)
   */
  async recordDelivery(orderId: string, orderCode: string, customerPhone: string, store?: string) {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert([
          {
            order_code: orderCode,
            customer_phone: customerPhone,
            store,
            delivery_date: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      // تحديث الطلب الأصلي
      await this.updateOrder(orderId, {
        delivered: 'yes',
        delivery_filter: 'تم التسليم بنفس الكود',
      })

      return data
    } catch (error: any) {
      console.error('خطأ في تسجيل التسليم:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات سريعة
   */
  async getQuickStats(employeeName?: string) {
    try {
      let query = supabase
        .from('daily_orders')
        .select('*')

      if (employeeName) {
        query = query.eq('employee_name', employeeName)
      }

      const { data, error } = await query
        .is('dashboard_filter', null)
        .or('dashboard_filter.neq.Ignore')

      if (error) throw error

      const orders = data || []
      const delivered = orders.filter((o) => o.delivered === 'yes').length
      const notDelivered = orders.length - delivered

      return {
        total: orders.length,
        delivered,
        notDelivered,
        percentage: orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0,
      }
    } catch (error: any) {
      console.error('خطأ في جلب الإحصائيات السريعة:', error)
      throw error
    }
  },
}
