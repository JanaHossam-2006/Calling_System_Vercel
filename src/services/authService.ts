import { supabase } from '@/utils/supabase'
import { User } from '@/types'

/**
 * خدمات المصادقة والمستخدمين
 */
export const authService = {
  /**
   * تسجيل الدخول بالبريد والكلمة المرور
   */
  async login(email: string, password: string) {
    try {
      // المصادقة مع Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!authUser) throw new Error('فشل تسجيل الدخول')

      // جلب بيانات الملف الشخصي
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (profileError) {
        // إذا لم يكن هناك ملف شخصي، أنشئ واحداً
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([
            {
              email,
              name: email.split('@')[0],
              role: 'employee',
              is_active: true,
            },
          ])
          .select()
          .single()

        if (createError) throw createError
        return newProfile
      }

      return profile
    } catch (error: any) {
      console.error('خطأ في تسجيل الدخول:', error)
      throw error
    }
  },

  /**
   * تسجيل الخروج
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error: any) {
      console.error('خطأ في تسجيل الخروج:', error)
      throw error
    }
  },

  /**
   * الحصول على المستخدم الحالي
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) return null

      // جلب بيانات الملف الشخصي
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (error) return null
      return profile
    } catch (error: any) {
      console.error('خطأ في جلب بيانات المستخدم:', error)
      return null
    }
  },

  /**
   * تسجيل مستخدم جديد (فقط للمديرين)
   */
  async registerUser(
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'employee' | 'store',
    store?: string
  ) {
    try {
      // إنشاء حساب في Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authUser) throw new Error('فشل إنشاء المستخدم')

      // إنشاء ملف شخصي
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            email,
            name,
            role,
            store,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (profileError) throw profileError
      return profile
    } catch (error: any) {
      console.error('خطأ في تسجيل المستخدم:', error)
      throw error
    }
  },

  /**
   * تحديث بيانات المستخدم
   */
  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في تحديث بيانات المستخدم:', error)
      throw error
    }
  },

  /**
   * جلب جميع المستخدمين (فقط للمديرين)
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('خطأ في جلب المستخدمين:', error)
      throw error
    }
  },

  /**
   * جلب مستخدم واحد
   */
  async getUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('خطأ في جلب بيانات المستخدم:', error)
      throw error
    }
  },

  /**
   * حذف مستخدم (فقط للمديرين)
   */
  async deleteUser(userId: string) {
    try {
      // حذف من جدول المستخدمين
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError

      // حذف من Supabase Auth (يتطلب صلاحيات admin)
      // سيتم التعامل معه من الخادم
      return true
    } catch (error: any) {
      console.error('خطأ في حذف المستخدم:', error)
      throw error
    }
  },

  /**
   * تغيير كلمة المرور
   */
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('خطأ في تغيير كلمة المرور:', error)
      throw error
    }
  },

  /**
   * إعادة تعيين كلمة المرور (عبر البريد الإلكتروني)
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error)
      throw error
    }
  },

  /**
   * الاستماع لتغييرات حالة المصادقة
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = await this.getCurrentUser()
          callback(user)
        } else {
          callback(null)
        }
      }
    )

    return subscription
  },
}
