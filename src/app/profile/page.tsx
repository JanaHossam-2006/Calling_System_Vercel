'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Form, SectionCard } from '@/components'
import { authService } from '@/services/authService'
import { User, Mail, Phone, MapPin } from 'lucide-react'

/**
 * صفحة الملف الشخصي
 */
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (values: any) => {
    try {
      setSaving(true)
      await authService.updateUserProfile(user.id, values)
      setUser({ ...user, ...values })
      setEditing(false)
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout title="الملف الشخصي">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="الملف الشخصي">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* بيانات المستخدم */}
        <SectionCard title="معلومات المستخدم">
          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user?.name}</p>
                  <p className="text-gray-600">
                    {user?.role === 'admin' && 'مدير النظام'}
                    {user?.role === 'employee' && 'موظفة'}
                    {user?.role === 'store' && 'مدير متجر'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail size={16} />
                    البريد الإلكتروني
                  </p>
                  <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} />
                      رقم الهاتف
                    </p>
                    <p className="text-gray-900 font-medium mt-1">{user?.phone}</p>
                  </div>
                )}
              </div>

              {user?.store && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={16} />
                    المتجر
                  </p>
                  <p className="text-gray-900 font-medium mt-1">{user?.store}</p>
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                تعديل البيانات
              </button>
            </div>
          ) : (
            <Form
              fields={[
                {
                  name: 'name',
                  label: 'الاسم',
                  type: 'text',
                  value: user?.name,
                  required: true,
                },
                {
                  name: 'email',
                  label: 'البريد الإلكتروني',
                  type: 'email',
                  value: user?.email,
                  disabled: true,
                },
                {
                  name: 'phone',
                  label: 'رقم الهاتف',
                  type: 'phone',
                  value: user?.phone,
                },
              ]}
              onSubmit={handleSaveProfile}
              submitText="حفظ البيانات"
              onCancel={() => setEditing(false)}
              loading={saving}
            />
          )}
        </SectionCard>

        {/* تغيير كلمة المرور */}
        <SectionCard title="الأمان">
          <Form
            fields={[
              {
                name: 'currentPassword',
                label: 'كلمة المرور الحالية',
                type: 'password',
                required: true,
              },
              {
                name: 'newPassword',
                label: 'كلمة المرور الجديدة',
                type: 'password',
                required: true,
              },
              {
                name: 'confirmPassword',
                label: 'تأكيد كلمة المرور',
                type: 'password',
                required: true,
              },
            ]}
            onSubmit={async (values) => {
              if (values.newPassword !== values.confirmPassword) {
                alert('كلمات المرور غير متطابقة')
                return
              }
              await authService.changePassword(values.currentPassword, values.newPassword)
              alert('تم تغيير كلمة المرور بنجاح')
            }}
            submitText="تغيير كلمة المرور"
          />
        </SectionCard>
      </div>
    </Layout>
  )
}
