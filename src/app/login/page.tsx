'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form } from '@/components'
import { authService } from '@/services/authService'
import { Mail, Lock } from 'lucide-react'

/**
 * صفحة تسجيل الدخول
 */
export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: any) => {
    try {
      setError('')
      setLoading(true)

      const user = await authService.login(values.email, values.password)

      // إعادة التوجيه حسب دور المستخدم
      if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else if (user.role === 'employee') {
        router.push('/dashboard/employee')
      } else if (user.role === 'store') {
        router.push('/dashboard/store')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold">📞</span>
            </div>
            <h1 className="text-2xl font-bold">نظام الاتصالات</h1>
          </div>
          <p className="text-blue-100 text-center text-sm">إدارة الطلبات والمتابعات</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <Form
            fields={[
              {
                name: 'email',
                label: 'البريد الإلكتروني',
                type: 'email',
                required: true,
                placeholder: 'example@company.com',
              },
              {
                name: 'password',
                label: 'كلمة المرور',
                type: 'password',
                required: true,
                placeholder: '••••••••',
              },
            ]}
            onSubmit={handleLogin}
            submitText="تسجيل الدخول"
            loading={loading}
          />

          {/* Links */}
          <div className="mt-4 space-y-2 text-center text-sm">
            <button className="block w-full text-blue-600 hover:text-blue-700 transition">
              هل نسيت كلمة المرور؟
            </button>
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 transition font-medium">
                إنشاء حساب
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-gray-50 p-4 rounded-b-lg border-t text-xs text-gray-600">
          <p className="font-medium mb-2">بيانات تجريبية:</p>
          <p>البريد: admin@test.com</p>
          <p>كلمة المرور: password</p>
        </div>
      </div>
    </div>
  )
}
