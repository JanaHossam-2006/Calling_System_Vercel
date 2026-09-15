'use client'

import React, { useState } from 'react'
import { Layout, SectionCard, ConfirmModal } from '@/components'
import { Settings, Bell, Moon, Globe, Shield, Trash2 } from 'lucide-react'

/**
 * صفحة الإعدادات
 */
export default function SettingsPage() {
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailStats: false,
    pushNotifications: true,
  })
  const [language, setLanguage] = useState('ar')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleNotificationChange = (key: string) => {
    const updated = { ...notifications, [key]: !notifications[key as keyof typeof notifications] }
    setNotifications(updated)
    localStorage.setItem('notifications', JSON.stringify(updated))
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const handleDeleteAccount = () => {
    console.log('Delete account')
    setShowDeleteConfirm(false)
  }

  return (
    <Layout title="الإعدادات">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* المظهر */}
        <SectionCard title="المظهر">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-gray-600" />
                <span>المظهر</span>
              </div>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">فاتح</option>
                <option value="dark">داكن</option>
                <option value="auto">تلقائي</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* التنبيهات */}
        <SectionCard title="التنبيهات">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={notifications.emailOrders}
                onChange={() => handleNotificationChange('emailOrders')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">بريد إلكتروني عند طلبات جديدة</p>
                <p className="text-xs text-gray-600">تلقى إشعارات بالطلبات الجديدة</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={notifications.emailStats}
                onChange={() => handleNotificationChange('emailStats')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">بريد إلكتروني بالإحصائيات الأسبوعية</p>
                <p className="text-xs text-gray-600">تقرير أسبوعي عن الأداء</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition">
              <input
                type="checkbox"
                checked={notifications.pushNotifications}
                onChange={() => handleNotificationChange('pushNotifications')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-900">إشعارات فورية</p>
                <p className="text-xs text-gray-600">تنبيهات لحظية على الجهاز</p>
              </div>
            </label>
          </div>
        </SectionCard>

        {/* اللغة */}
        <SectionCard title="اللغة">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-gray-600" />
              <span>اللغة</span>
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </SectionCard>

        {/* الخصوصية والأمان */}
        <SectionCard title="الخصوصية والأمان">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">المصادقة الثنائية</p>
                  <p className="text-xs text-gray-600">أضف طبقة أمان إضافية لحسابك</p>
                </div>
                <button className="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                  تفعيل
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium text-gray-900 mb-2">الجلسات النشطة</p>
              <p className="text-sm text-gray-600 mb-3">تسجيل الدخول من: متصفح Chrome على Windows</p>
              <button className="text-red-600 text-sm hover:text-red-700 transition">
                تسجيل الخروج من جميع الأجهزة الأخرى
              </button>
            </div>
          </div>
        </SectionCard>

        {/* البيانات */}
        <SectionCard title="البيانات">
          <div className="space-y-3">
            <button className="w-full p-3 text-left border border-gray-200 rounded hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">تحميل البيانات</span>
                <span className="text-xs text-gray-500">CSV</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">حمّل نسخة من جميع بياناتك</p>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-3 text-left border border-red-200 rounded hover:bg-red-50 transition"
            >
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 size={16} />
                <span className="font-medium">حذف الحساب</span>
              </div>
              <p className="text-xs text-red-600 mt-1">حذف حسابك والبيانات المرتبطة به بشكل دائم</p>
            </button>
          </div>
        </SectionCard>

        {/* عن النظام */}
        <SectionCard title="عن النظام">
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>الإصدار:</strong> 1.0.0
            </p>
            <p>
              <strong>آخر تحديث:</strong> 15 سبتمبر 2026
            </p>
            <p>
              <strong>المطور:</strong> فريق التطوير
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Modal حذف الحساب */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        title="حذف الحساب"
        message="هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="نعم، احذف حسابي"
        cancelText="إلغاء"
        isDangerous
      />
    </Layout>
  )
}
