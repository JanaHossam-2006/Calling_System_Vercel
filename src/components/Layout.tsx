'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, User, Settings, Home, Package, BarChart3, Search, Bell } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: number
}

interface LayoutProps {
  children: React.ReactNode
  navItems?: NavItem[]
  title?: string
  userName?: string
  userRole?: string
  onLogout?: () => void
  showNotifications?: boolean
  notificationCount?: number
}

/**
 * تخطيط الصفحة الرئيسي
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  navItems = [],
  title = 'نظام إدارة الطلبات',
  userName,
  userRole,
  onLogout,
  showNotifications = false,
  notificationCount = 0,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-center px-4">
          {sidebarOpen ? (
            <h1 className="text-lg font-bold text-blue-600 text-center">الاتصالات</h1>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              ا
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <div className="px-4 py-3 text-gray-700 hover:bg-blue-50 transition relative group">
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">{item.icon}</div>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  {item.badge && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                {!sidebarOpen && (
                  <div className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-gray-100 rounded transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            {showNotifications && (
              <button className="relative p-2 hover:bg-gray-100 rounded transition">
                <Bell size={20} className="text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userName?.charAt(0) || 'U'}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    {userName && <p className="font-medium text-gray-900">{userName}</p>}
                    {userRole && <p className="text-xs text-gray-600 mt-1">{userRole}</p>}
                  </div>

                  <div className="py-2">
                    <Link href="/profile">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                        <User size={16} />
                        الملف الشخصي
                      </div>
                    </Link>
                    <Link href="/settings">
                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2">
                        <Settings size={16} />
                        الإعدادات
                      </div>
                    </Link>
                  </div>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-right flex items-center gap-2 border-t border-gray-200"
                    >
                      <LogOut size={16} />
                      تسجيل الخروج
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * صفحة فارغة
 */
export const EmptyState: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * بطاقة القسم
 */
export const SectionCard: React.FC<{
  title: string
  children: React.ReactNode
  action?: { label: string; onClick: () => void }
}> = ({ title, children, action }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}
