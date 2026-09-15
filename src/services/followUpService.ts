import { supabase } from '@/utils/supabase'
import { FollowUp } from '@/types'

/**
 * خدمات إدارة المتابعات
 */
export const followUpService = {
  /**
   * جلب جميع المتابعات
   */
  async getAllFollowUps(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('follow_up_orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { followUps: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب المتابعات:', error)
      throw error
    }
  },

  /**
   * جلب متابعات موظفة معينة
   */
  async getEmployeeFollowUps(employeeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('follow_up_orders')
        .select('*', { count: 'exact' })
        .eq('employee_name', employeeName)
        .order('follow_up_date', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { followUps: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب متابعات الموظفة:', error)
      throw error
    }
  },

  /**
   * جلب متابعات متجر معين
   */
  async getStoreFollowUps(storeName: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('follow_up_orders')
        .select('*', { count: 'exact' })
        .eq('store', storeName)
        .order('follow_up_date', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { followUps: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب متابعات المتجر:', error)
      throw error
    }
  },

  /**
   * جلب متابعة واحدة
   */
  async getFollowUp(followUpId: string): Promise<FollowUp | null> {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('*')
        .eq('id', followUpId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error: any) {
      console.error('خطأ في جلب المتابعة:', error)
      throw error
    }
  },

  /**
   * إنشاء متابعة جديدة
   */
  async createFollowUp(followUp: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .insert([
          {
            ...followUp,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في إنشاء متابعة:', error)
      throw error
    }
  },

  /**
   * تحديث متابعة
   */
  async updateFollowUp(followUpId: string, updates: Partial<FollowUp>) {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', followUpId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في تحديث المتابعة:', error)
      throw error
    }
  },

  /**
   * تحديث حالة المتابعة
   */
  async updateFollowUpStatus(followUpId: string, status: 'pending' | 'completed' | 'cancelled') {
    try {
      return await this.updateFollowUp(followUpId, {
        status,
      })
    } catch (error: any) {
      console.error('خطأ في تحديث حالة المتابعة:', error)
      throw error
    }
  },

  /**
   * حذف متابعة
   */
  async deleteFollowUp(followUpId: string) {
    try {
      const { error } = await supabase
        .from('follow_up_orders')
        .delete()
        .eq('id', followUpId)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('خطأ في حذف المتابعة:', error)
      throw error
    }
  },

  /**
   * جلب المتابعات المعلقة (التي لم تكتمل بعد)
   */
  async getPendingFollowUps(limit: number = 100, offset: number = 0) {
    try {
      const { data, error, count } = await supabase
        .from('follow_up_orders')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .order('follow_up_date', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { followUps: data || [], total: count || 0 }
    } catch (error: any) {
      console.error('خطأ في جلب المتابعات المعلقة:', error)
      throw error
    }
  },

  /**
   * جلب المتابعات المستحقة (تاريخها اليوم أو أقل)
   */
  async getDueFollowUps() {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('*')
        .eq('status', 'pending')
        .lte('follow_up_date', today)
        .order('follow_up_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب المتابعات المستحقة:', error)
      throw error
    }
  },

  /**
   * جلب المتابعات المستقبلية
   */
  async getUpcomingFollowUps(days: number = 7) {
    try {
      const today = new Date()
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('*')
        .eq('status', 'pending')
        .gte('follow_up_date', today.toISOString().split('T')[0])
        .lte('follow_up_date', futureDate.toISOString().split('T')[0])
        .order('follow_up_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب المتابعات المستقبلية:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات المتابعات
   */
  async getFollowUpStats() {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('status')

      if (error) throw error

      const followUps = data || []
      const total = followUps.length
      const pending = followUps.filter((f) => f.status === 'pending').length
      const completed = followUps.filter((f) => f.status === 'completed').length
      const cancelled = followUps.filter((f) => f.status === 'cancelled').length

      return {
        total,
        pending,
        completed,
        cancelled,
      }
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات المتابعات:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات متابعات الموظفة
   */
  async getEmployeeFollowUpStats(employeeName: string) {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('status')
        .eq('employee_name', employeeName)

      if (error) throw error

      const followUps = data || []
      const total = followUps.length
      const pending = followUps.filter((f) => f.status === 'pending').length
      const completed = followUps.filter((f) => f.status === 'completed').length

      return {
        total,
        pending,
        completed,
      }
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات متابعات الموظفة:', error)
      throw error
    }
  },

  /**
   * جلب إحصائيات متابعات المتجر
   */
  async getStoreFollowUpStats(storeName: string) {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('status')
        .eq('store', storeName)

      if (error) throw error

      const followUps = data || []
      const total = followUps.length
      const pending = followUps.filter((f) => f.status === 'pending').length
      const completed = followUps.filter((f) => f.status === 'completed').length

      return {
        total,
        pending,
        completed,
      }
    } catch (error: any) {
      console.error('خطأ في جلب إحصائيات متابعات المتجر:', error)
      throw error
    }
  },

  /**
   * إنشاء متابعات من طلب معين
   */
  async createFollowUpsFromOrder(orderId: string, followUpDates: string[]) {
    try {
      // جلب بيانات الطلب الأصلي
      const { data: order, error: orderError } = await supabase
        .from('daily_orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError
      if (!order) throw new Error('الطلب غير موجود')

      // إنشاء متابعات متعددة
      const followUps = followUpDates.map((date) => ({
        order_id: orderId,
        order_code: order.order_code,
        customer_phone: order.customer_phone,
        employee_name: order.employee_name,
        store: order.store,
        follow_up_date: date,
        status: 'pending',
        notes: `متابعة للطلب ${order.order_code}`,
      }))

      const { data, error } = await supabase
        .from('follow_up_orders')
        .insert(followUps)
        .select()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في إنشاء متابعات من الطلب:', error)
      throw error
    }
  },

  /**
   * البحث في المتابعات
   */
  async searchFollowUps(query: string, limit: number = 50) {
    try {
      const searchQuery = query.trim().toLowerCase()
      if (!searchQuery) return []

      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('*')
        .or(
          `order_code.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%,employee_name.ilike.%${searchQuery}%`
        )
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في البحث في المتابعات:', error)
      throw error
    }
  },

  /**
   * تحديث الملاحظات
   */
  async addNote(followUpId: string, note: string) {
    try {
      const existingFollowUp = await this.getFollowUp(followUpId)
      if (!existingFollowUp) throw new Error('المتابعة غير موجودة')

      const currentNotes = existingFollowUp.notes || ''
      const timestamp = new Date().toLocaleString('ar-EG')
      const newNote = currentNotes ? `${currentNotes}\n\n[${timestamp}] ${note}` : `[${timestamp}] ${note}`

      return await this.updateFollowUp(followUpId, {
        notes: newNote,
      })
    } catch (error: any) {
      console.error('خطأ في إضافة الملاحظة:', error)
      throw error
    }
  },

  /**
   * جلب المتابعات حسب رقم الطلب
   */
  async getFollowUpsByOrderCode(orderCode: string) {
    try {
      const { data, error } = await supabase
        .from('follow_up_orders')
        .select('*')
        .eq('order_code', orderCode)
        .order('follow_up_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب المتابعات حسب الطلب:', error)
      throw error
    }
  },

  /**
   * انتهاء متابعة وإغلاق الطلب
   */
  async completeFollowUpAndCloseOrder(followUpId: string, result: 'delivered' | 'cancelled' | 'rescheduled') {
    try {
      // تحديث المتابعة
      const followUp = await this.updateFollowUpStatus(followUpId, 'completed')

      // تحديث الطلب الأصلي إذا لزم الأمر
      if (followUp.order_id) {
        if (result === 'delivered') {
          await supabase
            .from('daily_orders')
            .update({
              delivered: 'yes',
              client_status: 'تم الاستلام',
            })
            .eq('id', followUp.order_id)
        } else if (result === 'cancelled') {
          await supabase
            .from('daily_orders')
            .update({
              client_status: 'الغى الطلب',
            })
            .eq('id', followUp.order_id)
        }
      }

      return followUp
    } catch (error: any) {
      console.error('خطأ في إنهاء المتابعة:', error)
      throw error
    }
  },
}
