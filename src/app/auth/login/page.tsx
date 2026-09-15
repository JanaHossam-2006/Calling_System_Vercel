'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/utils/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (profileError) throw profileError

      setUser(profile)
      toast.success('تم تسجيل الدخول بنجاح')

      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/dashboard/admin')
      } else if (profile.role === 'store') {
        router.push('/dashboard/store')
      } else if (profile.role === 'employee') {
        router.push('/dashboard/employee')
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-bg-main to-bg-card">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-indigo bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="ri-route-line text-2xl text-accent-indigo"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2">إدارة الطلبات</h1>
          <p className="text-text-secondary">مرحباً بك، يرجى تسجيل الدخول</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              className="input"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              className="input"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line ri-spin inline-block mr-2"></i>
                جاري المحاولة...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-color text-center">
          <p className="text-sm text-text-secondary">تصميم وتطوير Jana Hossam</p>
        </div>
      </div>
    </div>
  )
}
